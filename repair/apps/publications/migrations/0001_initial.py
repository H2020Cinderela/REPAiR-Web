# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-01-18 21:25
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('publications_bootstrap', '0004_catalog_fk_publication'),
        ('login', '0006_casestudy_focusarea'),
    ]

    operations = [
        migrations.CreateModel(
            name='PublicationInCasestudy',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('casestudy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='login.CaseStudy')),
                ('publication', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='publications_bootstrap.Publication')),
            ],
        ),
    ]
