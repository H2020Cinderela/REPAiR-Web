from django.test import TestCase
from django.core.validators import ValidationError

from repair.apps.login.models import CaseStudy, User, Profile
from repair.apps.login.factories import *
from rest_framework.test import APIRequestFactory
from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status


class ModelTest(TestCase):

    fixtures = ['user_fixture.json']


    def test_profile_creation(self):
        # New user created
        user = User.objects.create(
            username="horst",
            password="django-tutorial",
            email='horst@gmail.com')
        # Check that a Profile instance has been crated
        self.assertIsInstance(user.profile, Profile)
        # Call the save method of the user to activate the signal
        # again, and check that it doesn't try to create another
        # profile instace
        user.save()
        self.assertIsInstance(user.profile, Profile)

    def test_profile_creation(self):
        profile = ProfileFactory()
        # should use the default username of the UserFactory
        self.assertEqual(str(profile), profile.user.username)

        # should use the provided username
        profile = ProfileFactory(user__username='Adele')
        self.assertEqual(str(profile),"Adele")

    def test_string_representation(self):
        casestudy = CaseStudy(name="MyName")
        self.assertEqual(str(casestudy),"MyName")

        user = UserFactory(username="Markus")
        self.assertEqual(str(user.profile),"Markus")

    def test_casestudies_of_profile(self):
        casestudy_hh = CaseStudyFactory(name='Hamburg')
        casestudy_ams = CaseStudyFactory(name='Amsterdam')
        casestudies = [casestudy_hh, casestudy_ams]
        user = ProfileFactory()
        user_in_hh = UserInCasestudyFactory(user=user,
                                            casestudy=casestudy_hh)
        user_in_ams = UserInCasestudyFactory(user=user,
                                             casestudy=casestudy_ams)

        # assert that the user has the correct casestudies assigned
        self.assertEqual([(cs.id, cs.name) for cs in user.casestudies.all()],
                         [(cs.id, cs.name) for cs in casestudies])


class ViewTest(APITestCase):

    fixtures = ['user_fixture.json']


    def test_get_group(self):
        url = reverse('group-list')
        data = {'name': 'MyGroup'}
        response = self.client.post(url, data, format='json')
        print(response)
        response = self.client.get(url)
        print(response.data)

    def test_get_user(self):
        lodz = reverse('casestudy-detail', kwargs=dict(pk=3))

        url = reverse('user-list')
        data = {'username': 'MyUser',
                'casestudies': [lodz],
                'password': 'PW',
                'organization': 'GGR',
                'groups': [],
                'email': 'a.b@c.de',}
        response = self.client.post(url, data, format='json')
        print(response)
        response = self.client.get(url)
        print(response.data)
        url = reverse('user-detail', kwargs=dict(pk=4))
        response = self.client.get(url)
        print(response.data)
        new_mail = 'new@mail.de'
        data = {'email': new_mail,}
        self.client.patch(url, data)
        response = self.client.get(url)
        assert response.data['email'] == new_mail

        user_in_ams = UserInCasestudyFactory()


