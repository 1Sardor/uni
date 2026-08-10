from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from campus.views import PromoVideoPresentationView, PromoVideoRedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('video/', PromoVideoRedirectView.as_view(), name='promo-video'),
    path('video/presentation/', PromoVideoPresentationView.as_view(), name='promo-video-presentation'),
    path('api/', include('campus.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
