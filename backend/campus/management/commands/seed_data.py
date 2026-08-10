from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from campus.models import CampusEvent, Discount, Place


class Command(BaseCommand):
    help = 'Seed the database with demo places, discounts and events.'

    def handle(self, *args, **options):
        if Place.objects.exists():
            self.stdout.write('Data already seeded, skipping.')
            return

        now = timezone.now()

        places = Place.objects.bulk_create([
            Place(name='Café Nero', category='Food & Drinks', is_local=True,
                       location='Dubai Mall, Downtown Dubai',
                       image_url='https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80',
                       instagram='https://instagram.com',
                       description='Born from a love of great coffee, Café Nero has been serving handcrafted beverages to students and city-dwellers alike.'),
            Place(name='Shawarma House', category='Food & Drinks', is_local=True,
                       location='Al Wasl Road, Jumeirah',
                       image_url='https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80',
                       instagram='https://instagram.com',
                       description='A neighborhood favorite serving fresh wraps and combos made daily with locally sourced ingredients.'),
            Place(name='FitLife Gym', category='Fitness', is_local=False,
                       location='Sheikh Zayed Road, Dubai',
                       image_url='https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80',
                       instagram='https://instagram.com',
                       description='FitLife Gym brings state-of-the-art equipment and certified trainers to help students stay active and healthy on a budget.'),
            Place(name='VOX Cinemas', category='Entertainment', is_local=False,
                       location='Mall of the Emirates, Al Barsha',
                       image_url='https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&q=80',
                       instagram='https://instagram.com',
                       description="The region's leading cinema chain, bringing the latest blockbusters with premium sound and seating."),
            Place(name='TechHub Electronics', category='Electronics', is_local=False,
                       location='Deira City Centre, Deira',
                       image_url='https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900&q=80',
                       instagram='https://instagram.com',
                       description='TechHub stocks the latest laptops, accessories and gadgets, with dedicated student pricing year-round.'),
            Place(name='Urban Threads', category='Fashion', is_local=True,
                       location='City Walk, Al Satwa',
                       image_url='https://images.unsplash.com/photo-1521334884684-d80222895322?w=900&q=80',
                       instagram='https://instagram.com',
                       description='Urban Threads brings curated streetwear and seasonal collections designed for campus life.'),
            Place(name='Skybound Travel', category='Travel', is_local=False,
                       location='Business Bay, Dubai',
                       image_url='https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80',
                       instagram='https://instagram.com',
                       description='Skybound Travel helps students explore the world with discounted flights and travel packages.'),
            Place(name='Wellness Pharmacy', category='Health', is_local=True,
                       location='Al Karama, Dubai',
                       image_url='https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80',
                       instagram='https://instagram.com',
                       description='Wellness Pharmacy offers everyday essentials, vitamins and supplements at student-friendly prices.'),
        ])
        nero, shawarma, fitlife, vox, techhub, urban, sky, wellness = places

        Discount.objects.bulk_create([
            Discount(place=nero, title='25% off all beverages',
                     description='25% off all hot and cold beverages, every day.',
                     discount_percent=25, promo_code='NERO25', deal_type='regular'),
            Discount(place=nero, title='Buy one pastry, get one free',
                     description='Valid on weekends only, dine-in or takeaway.',
                     discount_percent=50, promo_code='NEROBOGO', deal_type='weekly',
                     expires_at=now + timedelta(days=3)),
            Discount(place=shawarma, title='20% off all wraps',
                     description='20% off all wraps and combos.',
                     discount_percent=20, promo_code='WRAP20', deal_type='daily',
                     expires_at=now + timedelta(hours=20)),
            Discount(place=fitlife, title='40% off memberships',
                     description='40% off monthly memberships for students.',
                     discount_percent=40, promo_code='FIT40', deal_type='weekly',
                     expires_at=now + timedelta(days=5), original_price=300, offer_price=180),
            Discount(place=vox, title='30% off movie tickets',
                     description='30% off movie tickets, all week long.',
                     discount_percent=30, promo_code='VOX30', deal_type='regular'),
            Discount(place=techhub, title='15% off laptops',
                     description='15% off laptops and accessories.',
                     discount_percent=15, promo_code='TECH15', deal_type='regular'),
            Discount(place=urban, title='20% off new arrivals',
                     description='20% off new season arrivals.',
                     discount_percent=20, promo_code='URBAN20', deal_type='hourly',
                     expires_at=now + timedelta(minutes=45)),
            Discount(place=sky, title='10% off flights',
                     description='10% off flight bookings for students.',
                     discount_percent=10, promo_code='FLY10', deal_type='regular'),
            Discount(place=wellness, title='12% off supplements',
                     description='12% off vitamins and supplements.',
                     discount_percent=12, promo_code='WELL12', deal_type='regular'),
        ])

        CampusEvent.objects.bulk_create([
            CampusEvent(title='Welcome Back Mixer', category='Social', is_free=True,
                        location='Student Union Hall', organizer='Student Council',
                        description='Kick off the semester with games, music and free food.',
                        event_date=now + timedelta(days=2)),
            CampusEvent(title='Career Fair 2026', category='Career', is_free=True,
                        location='Main Auditorium', organizer='Career Services',
                        description='Meet recruiters from 40+ companies across the region.',
                        event_date=now + timedelta(days=6)),
            CampusEvent(title='Intro to AI Workshop', category='Workshop', is_free=False,
                        location='Lab Building B, Room 204', organizer='Computer Science Dept.',
                        description='Hands-on workshop covering the fundamentals of machine learning.',
                        event_date=now + timedelta(days=9)),
            CampusEvent(title='Inter-Uni Football Cup', category='Sports', is_free=True,
                        location='Campus Stadium', organizer='Sports Committee',
                        description='Cheer on your university team in the regional finals.',
                        event_date=now - timedelta(days=2)),
            CampusEvent(title='Cultural Night', category='Cultural', is_free=True,
                        location='Open Air Theatre', organizer='International Students Club',
                        description='Celebrate diversity with food, performances and art from around the world.',
                        event_date=now + timedelta(days=14)),
        ])

        self.stdout.write(self.style.SUCCESS('Seed data created.'))
