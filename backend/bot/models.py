from django.db import models


class TelegramBotConfig(models.Model):
    token = models.CharField(
        max_length=255, blank=True, help_text='Bot token from @BotFather'
    )
    base_url = models.URLField(
        blank=True,
        help_text='Public HTTPS base URL of the backend, e.g. https://api.example.com',
    )
    is_webhook_active = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Telegram bot'
        verbose_name_plural = 'Telegram bot'

    def __str__(self):
        return self.base_url or 'Telegram bot'
