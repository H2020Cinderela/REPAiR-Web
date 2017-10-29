from rest_framework import serializers
from rest_framework_nested.serializers import NestedHyperlinkedModelSerializer
from rest_framework_nested.relations import NestedHyperlinkedRelatedField

from repair.apps.changes.models import (Unit,
                                        SolutionCategory,
                                        Solution,
                                        Implementation,
                                        SolutionInImplementation,
                                        )

from repair.apps.login.serializers import (UserInCasestudySerializer,
                                           InCasestudyField,
                                           InCaseStudyIdentityField)



class SolutionCategoryField(InCasestudyField):
    parent_lookup_kwargs = {'casestudy_pk': 'user__casestudy'}
    child_lookup_kwargs = {'casestudy_pk': 'user__casestudy'}



class SolutionSetField(InCaseStudyIdentityField):
    lookup_url_kwarg = 'solutioncategory_pk'
    parent_lookup_kwargs = {'casestudy_pk': 'user__casestudy__id',
                            'solutioncategory_pk': 'id', }


class SolutionSetSerializer(NestedHyperlinkedModelSerializer):
    parent_lookup_kwargs = {'solutioncategory_pk': 'solution_category__id',
                            'casestudy_pk': 'solution_category__user__casestudy__id',}
    class Meta:
        model = Solution
        fields = ('url', 'id', 'name')


class SolutionCategorySerializer(NestedHyperlinkedModelSerializer):
    parent_lookup_kwargs = {'casestudy_pk': 'user__casestudy__id'}
    solution_set = SolutionSetField(
        view_name='solution-list')
    #solution_set = SolutionSetSerializer(many=True, read_only=True)
    user = UserInCasestudySerializer()
    class Meta:
        model = SolutionCategory
        fields = ('url', 'id', 'name', 'user', 'solution_set')


class SolutionCategoryPostSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = SolutionCategory
        fields = ('url', 'id', 'name', 'user')


class SolutionInImplementationField(serializers.HyperlinkedRelatedField):
    def get_queryset(self):
        obj = self.root.instance
        if obj:
            implementations_qs = Implementation.objects.filter(
                user=obj.user.id)
        else:
            implementations_qs = Implementation.objects.all()
        return implementations_qs


class SolutionSerializer(NestedHyperlinkedModelSerializer):
    #implementation_set = SolutionInImplementationField(
        #many=True,
        #view_name='implementation_set_detail')
    parent_lookup_kwargs = {
        'casestudy_pk': 'solution_category__user__casestudy__id',
        'solutioncategory_pk': 'solution_category__id',
    }
    user = UserInCasestudySerializer()
    solution_category = SolutionCategoryField(
        view_name='solutioncategory-detail',
    )

    class Meta:
        model = Solution
        fields = ('url', 'id', 'name', 'user', 'description',
                  'one_unit_equals', 'solution_category',
                  #'implementation_set',
                  )


class SolutionPostSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Solution
        fields = ('url', 'id', 'name', 'user', 'description',
                  'one_unit_equals', 'solution_category')


class SolutionInImplementationSetField(InCaseStudyIdentityField):
    lookup_url_kwarg = 'implementation_pk'
    parent_lookup_kwargs = {'casestudy_pk': 'user__casestudy__id',
                            'implementation_pk': 'id', }


class ImplementationSerializer(NestedHyperlinkedModelSerializer):
    parent_lookup_kwargs = {'casestudy_pk': 'user__casestudy__id'}
    user = UserInCasestudySerializer()
    solutions = SolutionInImplementationSetField(
        view_name='solutioninimplementation-list', read_only=True)
    class Meta:
        model = Implementation
        fields = ('url', 'id', 'name', 'user', 'solutions')


class ImplementationPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Implementation
        fields = ('id', 'name', 'user')


class ImplementationField(InCasestudyField):
    parent_lookup_kwargs = {'casestudy_pk': 'user__casestudy__id'}
    child_lookup_kwargs = {'casestudy_pk': 'implementation__user__casestudy__id'}


class SolutionField(InCasestudyField):
    parent_lookup_kwargs = {'casestudy_pk': 'solution_category__user__casestudy__id',
                            'solutioncategory_pk': 'solution_category__id',}
    child_lookup_kwargs = {'casestudy_pk': 'implementation__user__casestudy__id',
                           'implementation_pk': 'implementation__id',}



class SolutionInImplementationSerializer(NestedHyperlinkedModelSerializer):
    parent_lookup_kwargs = {'casestudy_pk':
                            'implementation__user__casestudy__id',
                            'implementation_pk': 'implementation__id',
                            }
    implementation = ImplementationField(view_name='implementation-detail')
    solution = SolutionField(view_name='solution-detail')
    class Meta:
        model = SolutionInImplementation
        fields = ('url', 'id',
                  'implementation',
                  'solution')

