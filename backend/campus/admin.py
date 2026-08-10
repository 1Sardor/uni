from django.contrib import admin
from unfold.admin import ModelAdmin

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


@admin.register(User)
class UserAdmin(ModelAdmin):
    list_display = ['username', 'phone_number', 'role', 'is_verified', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_verified', 'is_staff']
    search_fields = ['username', 'phone_number', 'email', 'first_name', 'last_name']


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Place)
class PlaceAdmin(ModelAdmin):
    list_display = ['name', 'category', 'location', 'is_local', 'partner']
    list_filter = ['category', 'is_local']
    search_fields = ['name']


@admin.register(Discount)
class DiscountAdmin(ModelAdmin):
    list_display = ['title', 'place', 'discount_percent', 'deal_type', 'is_active', 'expires_at']
    list_filter = ['is_active', 'deal_type', 'place']
    search_fields = ['title', 'place__name']


@admin.register(CampusEvent)
class CampusEventAdmin(ModelAdmin):
    list_display = ['title', 'category', 'location', 'is_free', 'event_date']
    list_filter = ['category', 'is_free']
    search_fields = ['title']


@admin.register(ClaimedDiscount)
class ClaimedDiscountAdmin(ModelAdmin):
    list_display = ['user', 'discount', 'brand_name', 'discount_percent', 'amount_saved', 'claimed_at']
    list_filter = ['category']
    search_fields = ['user__username', 'discount__title', 'brand_name']
    date_hierarchy = 'claimed_at'


@admin.register(StudentProfile)
class StudentProfileAdmin(ModelAdmin):
    list_display = ['first_name', 'last_name', 'user', 'university', 'student_id_number', 'year_of_study', 'id_verified']
    list_filter = ['id_verified', 'university']
    search_fields = ['first_name', 'last_name', 'user__username', 'student_id_number']


@admin.register(TelegramLoginCode)
class TelegramLoginCodeAdmin(ModelAdmin):
    list_display = ['phone_number', 'code', 'telegram_username', 'is_used', 'created_at', 'expires_at']
    search_fields = ['phone_number', 'telegram_username']


@admin.register(Partner)
class PartnerAdmin(ModelAdmin):
    list_display = ['business_name', 'contact_name', 'email', 'category', 'status', 'place', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['business_name', 'contact_name', 'email']


@admin.register(PromoVideo)
class PromoVideoAdmin(ModelAdmin):
    list_display = ['file', 'updated_at']
