from rest_framework import serializers

from .models import (
    CampusEvent,
    Category,
    ClaimedDiscount,
    Discount,
    Partner,
    Place,
    StudentProfile,
    User,
)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'phone_number', 'full_name', 'role', 'is_verified', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class PlaceSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field='name', queryset=Category.objects.all())

    class Meta:
        model = Place
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']


class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']


class CampusEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusEvent
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by']


class ClaimedDiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimedDiscount
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by', 'claimed_at', 'user']


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'created_by', 'user', 'chat_id', 'verification_token']


class PartnerSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(slug_field='name', queryset=Category.objects.all())
    password = serializers.CharField(write_only=True, min_length=6, required=False)
    place = serializers.PrimaryKeyRelatedField(read_only=True)
    place_name = serializers.CharField(source='place.name', read_only=True)
    place_image_url = serializers.SerializerMethodField()

    def get_place_image_url(self, obj):
        if not obj.place or not obj.place.image_url:
            return ''
        request = self.context.get('request')
        url = obj.place.image_url.url
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = Partner
        fields = [
            'id', 'business_name', 'contact_name', 'email', 'phone', 'city',
            'category', 'website', 'message', 'status', 'created_at', 'password',
            'place', 'place_name', 'place_image_url',
        ]
        read_only_fields = ['id', 'created_at', 'status']
