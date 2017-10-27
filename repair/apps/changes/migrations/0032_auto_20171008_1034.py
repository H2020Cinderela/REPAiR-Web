# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-08 08:34
from __future__ import unicode_literals

from django.db import models, migrations


def make_many_users(apps, schema_editor):
    """
        Adds the CaseStudy object in User.casestudy to the
        many-to-many relationship in User.casestudies
    """
    User = apps.get_model('changes', 'User')
    UserInCasestudy = apps.get_model('changes', 'UserInCasestudy')
    Casestudy = apps.get_model('changes', 'Casestudy')

    for user in User.objects.all():
        casestudy = Casestudy.objects.get(pk=user.casestudy)
        user_in_casestudy = UserInCasestudy.objects.create(user=user,
                                                   casestudy=casestudy)
        user_in_casestudy.save()


class Migration(migrations.Migration):

    dependencies = [
        ('changes', '0031_add_user_case_study'),
    ]

    operations = [
        migrations.RunPython(make_many_users),

    ]