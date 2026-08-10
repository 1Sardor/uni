from django.contrib import admin, messages
from unfold.admin import ModelAdmin

from . import bot as bot_logic
from .models import TelegramBotConfig


@admin.register(TelegramBotConfig)
class TelegramBotConfigAdmin(ModelAdmin):
    list_display = ['base_url', 'is_webhook_active', 'updated_at']
    actions = ['set_webhook', 'remove_webhook']

    @admin.action(description='Set webhook with Telegram')
    def set_webhook(self, request, queryset):
        for config in queryset:
            try:
                webhook_url = bot_logic.set_webhook(config.base_url)
            except Exception as exc:
                self.message_user(request, f'{config.base_url}: {exc}', level=messages.ERROR)
                continue
            config.is_webhook_active = True
            config.save(update_fields=['is_webhook_active'])
            self.message_user(request, f'Webhook set: {webhook_url}', level=messages.SUCCESS)

    @admin.action(description='Remove webhook from Telegram')
    def remove_webhook(self, request, queryset):
        try:
            bot_logic.remove_webhook()
        except Exception as exc:
            self.message_user(request, str(exc), level=messages.ERROR)
            return
        queryset.update(is_webhook_active=False)
        self.message_user(request, 'Webhook removed', level=messages.SUCCESS)
