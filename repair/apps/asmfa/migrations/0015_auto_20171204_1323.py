# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-12-04 12:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0014_auto_20171126_2041'),
    ]

    operations = [
        migrations.AddField(
            model_name='administrativelocation',
            name='name',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='operationallocation',
            name='name',
            field=models.TextField(blank=True, null=True),
        ),
    ]
