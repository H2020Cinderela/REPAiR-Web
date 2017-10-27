# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-07 13:07
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('changes', '0019_auto_20171007_1418'),
    ]

    operations = [
        migrations.CreateModel(
            name='SolutionInImplementation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='implementation',
            name='solutions',
        ),
        migrations.RemoveField(
            model_name='solutioninimplementationgeometry',
            name='implementation',
        ),
        migrations.RemoveField(
            model_name='solutioninimplementationgeometry',
            name='solution',
        ),
        migrations.RemoveField(
            model_name='solutioninimplementationnote',
            name='implementation',
        ),
        migrations.RemoveField(
            model_name='solutioninimplementationnote',
            name='solution',
        ),
        migrations.RemoveField(
            model_name='solutioninimplementationquantity',
            name='implementation',
        ),
        migrations.RemoveField(
            model_name='solutioninimplementationquantity',
            name='solution',
        ),
        migrations.AddField(
            model_name='solutioninimplementation',
            name='implementation',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='changes.Implementation'),
        ),
        migrations.AddField(
            model_name='solutioninimplementation',
            name='solution',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='changes.Solution'),
        ),
        migrations.AddField(
            model_name='solutioninimplementationgeometry',
            name='sii',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='changes.SolutionInImplementation'),
        ),
        migrations.AddField(
            model_name='solutioninimplementationnote',
            name='sii',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='changes.SolutionInImplementation'),
        ),
        migrations.AddField(
            model_name='solutioninimplementationquantity',
            name='sii',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='changes.SolutionInImplementation'),
        ),
    ]