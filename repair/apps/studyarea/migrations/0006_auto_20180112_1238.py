# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-01-12 11:38
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('studyarea', '0005_auto_20180110_1310'),
    ]

    operations = [
        migrations.AlterField(
            model_name='area',
            name='level',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='studyarea.AdminLevels'),
        ),
    ]
