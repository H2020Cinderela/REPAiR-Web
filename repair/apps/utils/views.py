from rest_framework import viewsets, exceptions, mixins
from django.views import View
from publications_bootstrap.models import Publication
from repair.apps.login.serializers import PublicationSerializer
from django.http import HttpResponseRedirect, JsonResponse



class ModelPermissionViewSet(viewsets.ModelViewSet):
    """
    Check if a user has the required permissions for create(), delete(),
    update(), retrieve() and list(). Throw exceptions.PermissionDenied() if
    permission is missing.
    """

    def check_permission(self, request, permission_name):
        """
        Check if the user has the right permission for the request. If not:
        Throw PermissionDenied() exception
        """
        # get permission code for the model
        app_label = self.serializer_class.Meta.model._meta.app_label
        view_name = self.serializer_class.Meta.model._meta.object_name
        permission = '{}.{}_{}'.format(app_label.lower(),
                                     permission_name, view_name.lower())
        # check if user has the required permission
        if not request.user.has_perm(permission):
            raise exceptions.PermissionDenied()

    def list(self, request, **kwargs):
        """
        Check if user is permitted for list view.
        """
        self.check_permission(request, 'view')
        return super().list(request, **kwargs)

    def retrieve(self, request, **kwargs):
        """
        Check if user is permitted for detail view.
        """
        self.check_permission(request, 'view')
        return super().retrieve(request, **kwargs)

    def create(self, request, **kwargs):
        """
        Check if user is permitted to create this object.
        """
        self.check_permission(request, 'add')
        return super().create(request, **kwargs)

    def destroy(self, request, **kwargs):
        """
        Check if user is permitted to destroy the object.
        """
        self.check_permission(request, 'delete')
        return super().destroy(request, **kwargs)

    def update(self, request, **kwargs):
        """
        Check if user is permitted to update the object.
        """
        self.check_permission(request, 'change')
        return super().update(request, **kwargs)

    def partial_update(self, request, **kwargs):
        """
        Check if user is permitted to partial_update the object.
        """
        self.check_permission(request, 'change')
        return super().partial_update(request, **kwargs)


class SessionView(View):
    def post(self, request):
        if request.POST['casestudy']:
            request.session['casestudy'] = request.POST['casestudy']
            next = request.POST.get('next', '/')
            return HttpResponseRedirect(next)

    def get(self, request):
        response =  {'casestudy': request.session.get('casestudy')}
        return JsonResponse(response)


class PublicationView(ModelPermissionViewSet):
    queryset = Publication.objects.all()
    serializer_class = PublicationSerializer
    pagination_class = None


class ReadUpdateViewSet(mixins.RetrieveModelMixin,
                        mixins.UpdateModelMixin,
                        mixins.ListModelMixin,
                        viewsets.GenericViewSet):
    """
    A viewset that provides default `retrieve()`, `update()`,
    `partial_update()`,  and `list()` actions.
    No `create()` or `destroy()`
    """
