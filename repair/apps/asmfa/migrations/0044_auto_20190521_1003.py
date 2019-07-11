# Generated by Django 2.2.1 on 2019-05-21 10:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0043_auto_20190520_0857'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activitygroup',
            name='code',
            field=models.CharField(choices=[('P1', 'Production'), ('P2', 'Production of packaging'), ('P3', 'Packaging'), ('D', 'Distribution'), ('S', 'Selling'), ('C', 'Consuming'), ('SC', 'Selling and Cosuming'), ('R', 'Return Logistics'), ('COL', 'Collection'), ('W', 'Waste Management'), ('imp', 'Import'), ('exp', 'Export')], max_length=255),
        ),
    ]