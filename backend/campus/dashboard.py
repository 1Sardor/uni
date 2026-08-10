from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

from .models import CampusEvent, ClaimedDiscount, Discount, Partner, Place, User


def dashboard_callback(request, context):
    now = timezone.now()
    today = now.date()

    claims = ClaimedDiscount.objects.all()

    since = now - timedelta(days=13)
    daily_counts = dict(
        claims.filter(claimed_at__gte=since)
        .annotate(day=TruncDate('claimed_at'))
        .values('day')
        .annotate(count=Count('id'))
        .values_list('day', 'count')
    )
    daily_claims = []
    max_daily = 1
    for i in range(13, -1, -1):
        day = today - timedelta(days=i)
        count = daily_counts.get(day, 0)
        max_daily = max(max_daily, count)
        daily_claims.append({'date': day, 'count': count})
    for row in daily_claims:
        row['percent'] = int(row['count'] / max_daily * 100)

    top_discounts = list(
        claims.values('discount__title', 'discount__place__name')
        .annotate(count=Count('id'))
        .order_by('-count')[:5]
    )
    top_max = top_discounts[0]['count'] if top_discounts else 1
    for row in top_discounts:
        row['percent'] = int(row['count'] / top_max * 100)

    context.update({
        'kpis': [
            {'title': 'Students', 'value': User.objects.filter(role=User.ROLE_STUDENT).count()},
            {'title': 'Partners', 'value': Partner.objects.count()},
            {'title': 'Pending applications', 'value': Partner.objects.filter(status=Partner.STATUS_PENDING).count()},
            {'title': 'Places', 'value': Place.objects.count()},
            {'title': 'Active discounts', 'value': Discount.objects.filter(is_active=True).count()},
            {'title': 'Claims (total)', 'value': claims.count()},
            {'title': 'Claims (14 days)', 'value': sum(r['count'] for r in daily_claims)},
            {'title': 'Upcoming events', 'value': CampusEvent.objects.filter(event_date__gte=now).count()},
        ],
        'daily_claims': daily_claims,
        'top_discounts': top_discounts,
        'recent_claims': claims.select_related('user', 'discount', 'discount__place').order_by('-claimed_at')[:8],
    })
    return context
