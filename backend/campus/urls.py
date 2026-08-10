from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('places', views.PlaceViewSet, basename='place')
router.register('discounts', views.DiscountViewSet, basename='discount')
router.register('events', views.CampusEventViewSet, basename='event')
router.register('claimed-discounts', views.ClaimedDiscountViewSet, basename='claimed-discount')
router.register('student-profiles', views.StudentProfileViewSet, basename='student-profile')
router.register('partners', views.PartnerViewSet, basename='partner')

auth_urlpatterns = [
    path('auth/me/', views.MeView.as_view(), name='auth-me'),
    path('auth/telegram/verify/', views.TelegramLoginView.as_view(), name='auth-telegram-verify'),
    path('auth/business/login/', views.BusinessLoginView.as_view(), name='auth-business-login'),
    path(
        'telegram/webhook/<str:secret>/',
        views.TelegramWebhookView.as_view(),
        name='telegram-webhook',
    ),
    path(
        'student-profiles/verify/<uuid:token>/',
        views.StudentVerifyView.as_view(),
        name='student-verify',
    ),
]

urlpatterns = auth_urlpatterns + router.urls
