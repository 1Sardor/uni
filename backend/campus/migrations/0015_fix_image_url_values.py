from urllib.parse import unquote, urlparse

from django.db import migrations


def fix_image_urls(apps, schema_editor):
    Place = apps.get_model('campus', 'Place')
    for place in Place.objects.exclude(image_url=''):
        raw = str(place.image_url)
        if not raw.startswith('http://') and not raw.startswith('https://'):
            continue

        path = urlparse(raw).path
        if '/media/' in path:
            # A real file previously uploaded to this server's own media storage -
            # strip the host/scheme and decode it back to a plain relative name
            # (the old code stored an already percent-encoded URL; ImageField.url
            # re-encodes on read, so the stored name itself must be unencoded).
            relative = unquote(path.split('/media/', 1)[1])
            Place.objects.filter(pk=place.pk).update(image_url=relative)
        else:
            # An external placeholder URL (unsplash/picsum) - ImageField can't
            # represent a foreign URL, so clear it rather than store garbage.
            Place.objects.filter(pk=place.pk).update(image_url='')


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('campus', '0014_alter_place_image_url'),
    ]

    operations = [
        migrations.RunPython(fix_image_urls, noop),
    ]
