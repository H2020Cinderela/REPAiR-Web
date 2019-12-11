# Generated by Django 2.0 on 2019-02-07 16:39

from django.db import migrations, models
import django.db.models.deletion

import repair.apps.login.models.bases
import repair.apps.utils.protect_cascade


class Migration(migrations.Migration):

    dependencies = [
        ('publications', '0004_auto_20180125_1751'),
        ('asmfa', '0038_productfraction_hazardous'),
    ]

    operations = [
        migrations.CreateModel(
            name='FractionFlow',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField(blank=True, max_length=510, null=True)),
                ('year', models.IntegerField(default=2016)),
                ('waste', models.BooleanField(default=False)),
                ('to_stock', models.BooleanField(default=False)),
                ('amount', models.FloatField(default=0)),
                ('avoidable', models.BooleanField(default=True)),
                ('hazardous', models.BooleanField(default=True)),
                ('nace', models.CharField(blank=True, max_length=255)),
                ('composition_name', models.CharField(blank=True, max_length=255)),
                ('destination', models.ForeignKey(null=True, on_delete=repair.apps.utils.protect_cascade.PROTECT_CASCADE, related_name='f_inputs', to='asmfa.Actor')),
                ('flow', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='f_flow', to='asmfa.Actor2Actor')),
                ('keyflow', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='asmfa.KeyflowInCasestudy')),
                ('material', models.ForeignKey(on_delete=repair.apps.utils.protect_cascade.PROTECT_CASCADE, related_name='f_material', to='asmfa.Material')),
                ('origin', models.ForeignKey(on_delete=repair.apps.utils.protect_cascade.PROTECT_CASCADE, related_name='f_outputs', to='asmfa.Actor')),
                ('process', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='asmfa.Process')),
                ('publication', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='f_pub', to='publications.PublicationInCasestudy')),
                ('stock', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='f_stock', to='asmfa.ActorStock')),
            ],
            options={
                'abstract': False,
                'default_permissions': ('add', 'change', 'delete', 'view'),
            },
            bases=(repair.apps.login.models.bases.GDSEModelMixin, models.Model),
        ),
    ]
