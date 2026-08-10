from datetime import timedelta

from django.conf import settings
from django.db.models import Count, DecimalField, Sum, Value
from django.db.models.functions import Coalesce, TruncDate
from django.http import Http404
from django.shortcuts import render
from django.utils import timezone

from rest_framework import permissions, serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from bot import bot as telegram_bot

from .models import (
    CampusEvent,
    Category,
    ClaimedDiscount,
    Discount,
    Partner,
    Place,
    PromoVideo,
    StudentProfile,
    TelegramLoginCode,
    User,
)
from .serializers import (
    CampusEventSerializer,
    CategorySerializer,
    ClaimedDiscountSerializer,
    DiscountSerializer,
    PartnerSerializer,
    PlaceSerializer,
    StudentProfileSerializer,
    UserSerializer,
)


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'access_token': str(refresh.access_token), 'refresh_token': str(refresh)}


class BaseEntityViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_fields = []
    filter_lookup_map = {}

    def get_queryset(self):
        qs = self.queryset.all()
        for field in self.filter_fields:
            value = self.request.query_params.get(field)
            if value is not None:
                if value.lower() in ('true', 'false'):
                    value = value.lower() == 'true'
                lookup = self.filter_lookup_map.get(field, field)
                qs = qs.filter(**{lookup: value})

        sort = self.request.query_params.get('sort')
        if sort:
            qs = qs.order_by(sort)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        limit = request.query_params.get('limit')
        if limit:
            queryset = queryset[: int(limit)]

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class PlaceViewSet(BaseEntityViewSet):
    queryset = Place.objects.select_related('category').all()
    serializer_class = PlaceSerializer
    filter_fields = ['category', 'is_local']
    filter_lookup_map = {'category': 'category__name'}


class DiscountViewSet(BaseEntityViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    filter_fields = ['place_id', 'is_active', 'deal_type']

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        discount = self.get_object()
        partner = getattr(request.user, 'partner', None)
        if not partner or not partner.place_id or partner.place_id != discount.place_id:
            return Response({'message': 'You do not manage this discount'}, status=status.HTTP_403_FORBIDDEN)

        if not discount.is_active:
            return Response({'message': 'This discount is not active'}, status=status.HTTP_400_BAD_REQUEST)

        token = (request.data.get('token') or '').strip()
        if not token:
            return Response({'message': 'QR token is required'}, status=status.HTTP_400_BAD_REQUEST)

        profile = StudentProfile.objects.select_related('user').filter(verification_token=token).first()
        if not profile:
            return Response({'message': 'Invalid or unrecognized student QR code'}, status=status.HTTP_404_NOT_FOUND)

        if discount.deal_type == 'one_time' and ClaimedDiscount.objects.filter(discount=discount).exists():
            return Response({'message': 'This one-time discount has already been claimed'}, status=status.HTTP_400_BAD_REQUEST)

        if ClaimedDiscount.objects.filter(user=profile.user, discount=discount).exists():
            return Response({'message': 'This student already claimed this discount'}, status=status.HTTP_400_BAD_REQUEST)

        amount_saved = 0
        if discount.original_price is not None and discount.offer_price is not None:
            amount_saved = discount.original_price - discount.offer_price

        ClaimedDiscount.objects.create(
            user=profile.user,
            discount=discount,
            created_by=request.user,
            brand_name=discount.place.name,
            category=discount.place.category.name,
            discount_percent=discount.discount_percent,
            amount_saved=amount_saved,
            claimed_date=timezone.now().date(),
        )

        if discount.deal_type == 'one_time':
            discount.is_active = False
            discount.save(update_fields=['is_active'])

        return Response({
            'message': 'Discount claimed',
            'student_name': profile.student_name or profile.user.get_full_name() or profile.user.username,
        })


class CampusEventViewSet(BaseEntityViewSet):
    queryset = CampusEvent.objects.all()
    serializer_class = CampusEventSerializer
    filter_fields = ['category', 'is_free']


class ClaimedDiscountViewSet(BaseEntityViewSet):
    queryset = ClaimedDiscount.objects.all()
    serializer_class = ClaimedDiscountSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_fields = ['user_id', 'discount_id']

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, user=self.request.user)


class StudentProfileViewSet(BaseEntityViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_fields = ['user_id']

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            user=self.request.user,
            chat_id=self.request.user.telegram_id,
        )


class PartnerViewSet(BaseEntityViewSet):
    queryset = Partner.objects.select_related('category').all()
    serializer_class = PartnerSerializer
    filter_fields = ['status', 'category']
    filter_lookup_map = {'category': 'category__name'}

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ('me', 'upload_image', 'stats'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        password = serializer.validated_data.pop('password', None)
        email = (serializer.validated_data.get('email') or '').strip().lower()
        serializer.validated_data['email'] = email

        user = None
        place = None
        if password:
            if User.objects.filter(username=email).exists():
                raise serializers.ValidationError({'email': 'An account with this email already exists.'})
            user = User.objects.create_user(
                username=email, email=email, password=password, role=User.ROLE_PLACE,
            )
            place = Place.objects.create(
                name=serializer.validated_data.get('business_name', ''),
                category=serializer.validated_data.get('category'),
                location=serializer.validated_data.get('city', ''),
                created_by=user,
            )

        serializer.save(created_by=None, user=user, place=place)

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        partner = getattr(request.user, 'partner', None)
        if not partner:
            return Response({'message': 'No partner profile for this account'}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'PATCH':
            serializer = self.get_serializer(partner, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.validated_data.pop('password', None)
            serializer.save()
        else:
            serializer = self.get_serializer(partner)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def upload_image(self, request):
        partner = getattr(request.user, 'partner', None)
        if not partner or not partner.place:
            return Response({'message': 'No linked business to upload an image for'}, status=status.HTTP_404_NOT_FOUND)

        image = request.FILES.get('image')
        if not image:
            return Response({'message': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

        partner.place.image_url = image
        partner.place.save(update_fields=['image_url'])

        image_url = request.build_absolute_uri(partner.place.image_url.url)
        return Response({'image_url': image_url})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        partner = getattr(request.user, 'partner', None)
        if not partner or not partner.place:
            return Response({
                'claims_count': 0,
                'students_count': 0,
                'total_sales': 0,
                'daily_claims': [],
                'by_discount': [],
            })

        claims = ClaimedDiscount.objects.filter(discount__place=partner.place)

        since = timezone.now() - timedelta(days=13)
        daily_counts = dict(
            claims.filter(claimed_at__gte=since)
            .annotate(day=TruncDate('claimed_at'))
            .values('day')
            .annotate(count=Count('id'))
            .values_list('day', 'count')
        )
        today = timezone.now().date()
        daily_claims = [
            {'date': (today - timedelta(days=i)).isoformat(), 'count': daily_counts.get(today - timedelta(days=i), 0)}
            for i in range(13, -1, -1)
        ]

        by_discount = [
            {'title': row['discount__title'], 'count': row['count']}
            for row in claims.values('discount__title').annotate(count=Count('id')).order_by('-count')[:5]
        ]

        total_sales = claims.aggregate(
            total=Sum(
                Coalesce(
                    'discount__offer_price', 'discount__original_price', Value(0),
                    output_field=DecimalField(max_digits=10, decimal_places=2),
                )
            )
        )['total'] or 0

        return Response({
            'claims_count': claims.count(),
            'students_count': claims.values('user').distinct().count(),
            'total_sales': total_sales,
            'daily_claims': daily_claims,
            'by_discount': by_discount,
        })


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class StudentVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        profile = StudentProfile.objects.select_related('user').filter(verification_token=token).first()
        if not profile:
            return Response({'valid': False}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'valid': True,
            'student_name': profile.student_name or profile.user.get_full_name() or profile.user.username,
            'university': profile.university,
            'major': profile.major,
            'year_of_study': profile.year_of_study,
            'id_verified': profile.id_verified,
        })


class BusinessLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        password = request.data.get('password') or ''

        if not email or not password:
            return Response({'message': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=email, role=User.ROLE_PLACE).first()
        if not user or not user.check_password(password):
            return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response(
                {'message': 'Your business account is still pending approval.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response({**tokens_for_user(user), 'user': UserSerializer(user).data})


class TelegramWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, secret):
        if not settings.TELEGRAM_WEBHOOK_SECRET or secret != settings.TELEGRAM_WEBHOOK_SECRET:
            return Response(status=status.HTTP_404_NOT_FOUND)

        telegram_bot.handle_update(request.data)
        return Response({'ok': True})


class TelegramLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = (request.data.get('code') or '').strip()

        if not code:
            return Response({'message': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        login_code = (
            TelegramLoginCode.objects.filter(code=code, is_used=False)
            .order_by('-created_at')
            .first()
        )
        if not login_code or login_code.is_expired():
            return Response({'message': 'Invalid or expired code'}, status=status.HTTP_401_UNAUTHORIZED)

        user, created = User.objects.get_or_create(
            phone_number=login_code.phone_number,
            defaults={
                'username': login_code.phone_number,
                'telegram_id': login_code.telegram_id,
                'telegram_username': login_code.telegram_username,
                'is_verified': True,
                'role': User.ROLE_STUDENT,
            },
        )
        if created:
            user.set_unusable_password()
            user.save()
        elif (
            user.telegram_id != login_code.telegram_id
            or user.telegram_username != login_code.telegram_username
        ):
            user.telegram_id = login_code.telegram_id
            user.telegram_username = login_code.telegram_username
            user.save(update_fields=['telegram_id', 'telegram_username'])

        profile = getattr(user, 'student_profile', None)
        if profile and profile.chat_id != login_code.telegram_id:
            profile.chat_id = login_code.telegram_id
            profile.save(update_fields=['chat_id'])

        login_code.delete()

        return Response({**tokens_for_user(user), 'user': UserSerializer(user).data})


class PromoVideoRedirectView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        video = PromoVideo.objects.order_by('-updated_at').first()
        if not video or not video.file:
            raise Http404
        return Response({'url': video.file.url})


class PromoVideoPresentationView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        video = PromoVideo.objects.order_by('-updated_at').first()
        if not video or not video.file:
            raise Http404
        return render(request, 'campus/promo_video.html', {
            'video_url': video.file.url,
        })
