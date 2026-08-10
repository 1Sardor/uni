import django.db.models.deletion
from django.db import migrations, models


def create_categories_and_link(apps, schema_editor):
    Category = apps.get_model('campus', 'Category')
    Place = apps.get_model('campus', 'Place')
    for place in Place.objects.all():
        name = place.category or 'Uncategorized'
        category, _ = Category.objects.get_or_create(name=name)
        place.category_new_id = category.id
        place.save(update_fields=['category_new'])


class Migration(migrations.Migration):

    dependencies = [
        ('campus', '0004_discount_promo_code'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'verbose_name_plural': 'Categories',
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='place',
            name='category_new',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='places',
                to='campus.category',
            ),
        ),
        migrations.RunPython(create_categories_and_link, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='place',
            name='category',
        ),
        migrations.RenameField(
            model_name='place',
            old_name='category_new',
            new_name='category',
        ),
        migrations.AlterField(
            model_name='place',
            name='category',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name='places',
                to='campus.category',
            ),
        ),
    ]
