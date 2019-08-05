# Generated by Django 2.2.1 on 2019-08-02 12:15

import django.contrib.gis.db.models.fields
from django.db import migrations, models
import django.db.models.deletion
import repair.apps.login.models.bases
import repair.apps.utils.protect_cascade


class Migration(migrations.Migration):

    dependencies = [
        ('changes', '0041_auto_20190701_1143'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImplementationArea',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(blank=True, null=True, srid=4326)),
            ],
            options={
                'abstract': False,
                'default_permissions': ('add', 'change', 'delete', 'view'),
            },
            bases=(repair.apps.login.models.bases.GDSEModelMixin, models.Model),
        ),
        migrations.CreateModel(
            name='PossibleImplementationArea',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326)),
                ('name', models.TextField(default='')),
            ],
            options={
                'abstract': False,
                'default_permissions': ('add', 'change', 'delete', 'view'),
            },
            bases=(repair.apps.login.models.bases.GDSEModelMixin, models.Model),
        ),
        migrations.RemoveField(
            model_name='solution',
            name='possible_implementation_area',
        ),
        migrations.RemoveField(
            model_name='solutioninstrategy',
            name='geom',
        ),
        migrations.RemoveField(
            model_name='solutionpart',
            name='references_part',
        ),
        migrations.DeleteModel(
            name='ActorInSolutionPart',
        ),
        migrations.AddField(
            model_name='possibleimplementationarea',
            name='solution',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='possible_implementation_area', to='changes.Solution'),
        ),
        migrations.AddField(
            model_name='implementationarea',
            name='implementation',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='implementation_area', to='changes.SolutionInStrategy'),
        ),
        migrations.AddField(
            model_name='implementationarea',
            name='possible_implementation_area',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='changes.PossibleImplementationArea'),
        ),
        migrations.AddField(
            model_name='solutionpart',
            name='possible_implementation_area',
            field=models.ForeignKey(null=True, on_delete=repair.apps.utils.protect_cascade.PROTECT_CASCADE, to='changes.PossibleImplementationArea'),
        ),
    ]
