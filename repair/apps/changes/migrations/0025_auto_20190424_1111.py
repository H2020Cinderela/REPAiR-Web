# Generated by Django 2.1.7 on 2019-04-24 09:11

from django.db import migrations, models
import repair.apps.utils.protect_cascade


class Migration(migrations.Migration):

    dependencies = [
        ('changes', '0024_auto_20190412_1705'),
    ]

    operations = [
        migrations.AlterField(
            model_name='solutionpart',
            name='question',
            field=models.ForeignKey(null=True, on_delete=repair.apps.utils.protect_cascade.PROTECT_CASCADE, to='changes.ImplementationQuestion'),
        ),
    ]