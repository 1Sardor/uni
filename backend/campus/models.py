import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    ROLE_ADMIN = 1
    ROLE_PLACE = 2
    ROLE_STUDENT = 3
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_PLACE, 'Places'),
        (ROLE_STUDENT, 'Students'),
    ]

    is_verified = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    phone_number = models.CharField(max_length=32, unique=True, null=True, blank=True)
    telegram_id = models.BigIntegerField(unique=True, null=True, blank=True)
    telegram_username = models.CharField(max_length=255, blank=True)


class TelegramLoginCode(models.Model):
    phone_number = models.CharField(max_length=32, db_index=True)
    code = models.CharField(max_length=6)
    telegram_id = models.BigIntegerField()
    telegram_username = models.CharField(max_length=255, blank=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f'{self.phone_number} ({self.code})'


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='+'
    )

    class Meta:
        abstract = True


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Place(TimestampedModel):
    name = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='places')
    description = models.TextField(blank=True)
    image_url = models.ImageField(upload_to='place_images/', blank=True)
    instagram = models.URLField(blank=True)
    is_local = models.BooleanField(default=False)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name


class CampusEvent(TimestampedModel):
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    organizer = models.CharField(max_length=255, blank=True)
    is_free = models.BooleanField(default=True)
    event_date = models.DateTimeField()

    def __str__(self):
        return self.title


class Discount(TimestampedModel):
    DEAL_TYPE_CHOICES = [
        ('regular', 'Regular'),
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('one_time', 'One-time'),
    ]

    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='discounts')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    discount_percent = models.PositiveIntegerField(default=0)
    promo_code = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    deal_type = models.CharField(max_length=20, choices=DEAL_TYPE_CHOICES, default='regular')
    expires_at = models.DateTimeField(null=True, blank=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.title


class ClaimedDiscount(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claimed_discounts')
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name='claims')
    claimed_at = models.DateTimeField(auto_now_add=True)
    brand_name = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100, blank=True)
    discount_percent = models.PositiveIntegerField(default=0)
    amount_saved = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    claimed_date = models.DateField(null=True, blank=True)


class StudentProfile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_name = models.CharField(max_length=255, blank=True)
    university = models.CharField(max_length=255, blank=True)
    student_id_number = models.CharField(max_length=100, blank=True)
    major = models.CharField(max_length=255, blank=True)
    year_of_study = models.CharField(max_length=50, blank=True)
    id_verified = models.BooleanField(default=False)
    chat_id = models.BigIntegerField(null=True, blank=True)
    verification_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)


class Partner(TimestampedModel):
    STATUS_PENDING = 'pending'
    STATUS_CONTACTED = 'contacted'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONTACTED, 'Contacted'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    business_name = models.CharField(max_length=255)
    contact_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='partner_applications')
    website = models.URLField(blank=True)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    user = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='partner'
    )
    place = models.OneToOneField(
        Place, on_delete=models.SET_NULL, null=True, blank=True, related_name='partner'
    )

    def __str__(self):
        return self.business_name

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.user_id:
            should_be_active = self.status == self.STATUS_APPROVED
            if self.user.is_active != should_be_active:
                self.user.is_active = should_be_active
                self.user.save(update_fields=['is_active'])


class PromoVideo(models.Model):
    file = models.FileField(upload_to='promo_videos/', blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Promo video'
        verbose_name_plural = 'Promo video'

    def __str__(self):
        return self.file.name
