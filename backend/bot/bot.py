import random
import re
from datetime import timedelta

import requests
from django.conf import settings
from django.utils import timezone

from campus.models import TelegramLoginCode, User
from .models import TelegramBotConfig

CODE_TTL = timedelta(minutes=5)


def normalize_phone(raw):
    digits = re.sub(r'\D', '', raw or '')
    return f'+{digits}' if digits else ''


def _get_token():
    config = TelegramBotConfig.objects.first()
    if not config or not config.token:
        raise RuntimeError('Telegram bot token is not set. Add it in the admin panel.')
    return config.token


def set_webhook(base_url):
    token = _get_token()
    if not settings.TELEGRAM_WEBHOOK_SECRET:
        raise RuntimeError('TELEGRAM_WEBHOOK_SECRET is not set')

    webhook_url = f"{base_url.rstrip('/')}/api/telegram/webhook/{settings.TELEGRAM_WEBHOOK_SECRET}/"
    response = requests.post(
        f'https://api.telegram.org/bot{token}/setWebhook',
        json={'url': webhook_url, 'allowed_updates': ['message']},
        timeout=10,
    )
    data = response.json()
    if not data.get('ok'):
        raise RuntimeError(f'Telegram rejected the webhook: {data}')
    return webhook_url


def remove_webhook():
    token = _get_token()

    response = requests.post(
        f'https://api.telegram.org/bot{token}/deleteWebhook',
        timeout=10,
    )
    data = response.json()
    if not data.get('ok'):
        raise RuntimeError(f'Telegram rejected the request: {data}')


def _call(method, payload):
    try:
        token = _get_token()
    except RuntimeError:
        return
    url = f'https://api.telegram.org/bot{token}/{method}'
    requests.post(url, json=payload, timeout=10)


def send_message(chat_id, text, request_contact=False, remove_keyboard=False):
    payload = {'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}
    if request_contact:
        payload['reply_markup'] = {
            'keyboard': [[{'text': '📱 Share phone number', 'request_contact': True}]],
            'resize_keyboard': True,
            'one_time_keyboard': True,
        }
    elif remove_keyboard:
        payload['reply_markup'] = {'remove_keyboard': True}
    _call('sendMessage', payload)


def _generate_code():
    return f'{random.randint(0, 999999):06d}'


def _issue_code(phone_number, telegram_id, telegram_username):
    code = _generate_code()
    TelegramLoginCode.objects.create(
        phone_number=phone_number,
        code=code,
        telegram_id=telegram_id,
        telegram_username=telegram_username or '',
        expires_at=timezone.now() + CODE_TTL,
    )
    return code


def handle_update(update):
    message = update.get('message')
    if not message:
        return

    chat_id = message['chat']['id']
    sender = message.get('from') or {}
    telegram_id = sender.get('id')
    telegram_username = sender.get('username', '')
    contact = message.get('contact')

    if contact:
        if contact.get('user_id') != telegram_id:
            send_message(
                chat_id,
                'Please share your own phone number using the button below.',
                request_contact=True,
            )
            return

        phone_number = normalize_phone(contact.get('phone_number'))
        code = _issue_code(phone_number, telegram_id, telegram_username)
        send_message(
            chat_id,
            f'Your UniLink login code is <code>{code}</code>.\n'
            'Enter it on the website to log in. It expires in 5 minutes.',
            remove_keyboard=True,
        )
        return

    existing_user = User.objects.filter(telegram_id=telegram_id).first() if telegram_id else None
    if existing_user and existing_user.phone_number:
        code = _issue_code(existing_user.phone_number, telegram_id, telegram_username)
        send_message(
            chat_id,
            f'Welcome back! Your UniLink login code is <code>{code}</code>.\n'
            'Enter it on the website to log in.',
        )
        return

    send_message(
        chat_id,
        'Welcome to UniLink! Tap the button below to share your phone number '
        'and receive a login code.',
        request_contact=True,
    )
