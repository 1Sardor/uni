from django.core.management.base import BaseCommand, CommandError

from bot import bot as bot_logic


class Command(BaseCommand):
    help = (
        'Registers the Django webhook URL with Telegram so the bot receives updates. '
        'Run once whenever the public URL or bot token changes.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            'base_url',
            help='Public HTTPS base URL of the backend, e.g. https://api.example.com',
        )

    def handle(self, *args, **options):
        try:
            webhook_url = bot_logic.set_webhook(options['base_url'])
        except RuntimeError as exc:
            raise CommandError(str(exc))

        self.stdout.write(self.style.SUCCESS(f'Webhook registered: {webhook_url}'))
