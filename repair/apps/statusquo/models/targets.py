# -*- coding: utf-8 -*-

from django.db import models
from repair.apps.login.models import (UserInCasestudy, CaseStudy, GDSEModel)
from repair.apps.statusquo.models import Aim


class SustainabilityField(GDSEModel):
    name = models.CharField(max_length=255)


class AreaOfProtection(GDSEModel):
    name = models.CharField(max_length=255)
    sustainability_field = models.ForeignKey(SustainabilityField,
                                             on_delete=models.CASCADE)


class ImpactCategory(GDSEModel):
    name = models.CharField(max_length=255)
    area_of_protection = models.ForeignKey(AreaOfProtection,
                                           on_delete=models.CASCADE)
    spatial_differentiation = models.BooleanField()


class ImpactCategoryInSustainability(GDSEModel):
    impact_category = models.ForeignKey(ImpactCategory,
                                        on_delete=models.CASCADE)


class TargetSpatialReference(GDSEModel):
    name = models.CharField(max_length=255)
    text = models.CharField(max_length=255)


class TargetValue(GDSEModel):
    text = models.CharField(max_length=255)
    number = models.FloatField()
    factor = models.FloatField()

    def __str__(self):
        try:
            return self.text or ''
        except Exception:
            return ''


class Target(GDSEModel):
    user = models.ForeignKey(UserInCasestudy, on_delete=models.CASCADE)
    aim = models.ForeignKey(Aim, on_delete=models.CASCADE)
    impact_category = models.ForeignKey(ImpactCategory,
                                        on_delete=models.CASCADE)
    target_value = models.ForeignKey(TargetValue, on_delete=models.CASCADE)
    spatial_reference = models.ForeignKey(TargetSpatialReference,
                                          on_delete=models.CASCADE)

    def __str__(self):
        try:
            return 'Target {}'.format(self.id) or ''
        except Exception:
            return ''


class IndicatorCharacterisation(GDSEModel):
    name = models.CharField(max_length=255)