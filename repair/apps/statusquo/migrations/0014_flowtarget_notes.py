# Generated by Django 2.0 on 2019-01-28 15:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('statusquo', '0013_auto_20190108_1136'),
    ]

    operations = [
        migrations.AddField(
            model_name='flowtarget',
            name='notes',
            field=models.TextField(blank=True, null=True),
        ),
    ]