# Generated by Django 2.0 on 2018-11-19 15:05

from django.db import migrations, models
import repair.apps.utils.protect_cascade


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0030_auto_20181114_1104'),
    ]

    operations = [
        migrations.AddField(
            model_name='composition',
            name='keyflow',
            field=models.ForeignKey(null=True, on_delete=repair.apps.utils.protect_cascade.PROTECT_CASCADE, to='asmfa.KeyflowInCasestudy'),
        ),
        migrations.AlterField(
            model_name='material',
            name='keyflow',
            field=models.ForeignKey(null=True, on_delete=repair.apps.utils.protect_cascade.PROTECT_CASCADE, to='asmfa.KeyflowInCasestudy'),
        ),
    ]
