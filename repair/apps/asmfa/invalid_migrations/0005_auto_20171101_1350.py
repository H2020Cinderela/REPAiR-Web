# -*- coding: utf-8 -*-
# Generated by Django 1.11.6 on 2017-11-01 12:50
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('asmfa', '0004_auto_20171101_1345'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activitystock',
            name='material',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='ActivityStock_Material', to='asmfa.Material'),
        ),
        migrations.AlterField(
            model_name='activitystock',
            name='quality',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='ActivityStock_Quality', to='asmfa.Quality'),
        ),
        migrations.AlterField(
            model_name='actorstock',
            name='material',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='ActorStock_Material', to='asmfa.Material'),
        ),
        migrations.AlterField(
            model_name='actorstock',
            name='quality',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='ActorStock_Quality', to='asmfa.Quality'),
        ),
        migrations.AlterField(
            model_name='groupstock',
            name='material',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='GroupStock_Material', to='asmfa.Material'),
        ),
        migrations.AlterField(
            model_name='groupstock',
            name='quality',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='GroupStock_Quality', to='asmfa.Quality'),
        ),
    ]