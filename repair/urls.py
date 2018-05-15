"""repair URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include

from django.http import HttpResponse
from django.template import loader
from django.conf import settings
from django.conf.urls.static import static
from repair.views import HomeView
from django.contrib.auth.views import logout
from django.views.i18n import JavaScriptCatalog
from repair.apps.wmsresources.views import (WMSProxyView)
from repair.apps import admin
#from django.contrib import admin


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    url(r'^$', HomeView.as_view(), name='index'),
    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^admin/', admin.site.urls),
    url(r'^data-entry/', include('repair.apps.dataentry.urls')),
    url(r'^study-area/', include('repair.apps.studyarea.urls')),
    url(r'^status-quo/', include('repair.apps.statusquo.urls')),
    url(r'^changes/', include('repair.apps.changes.urls')),
    url(r'^recommendations/', include('repair.apps.decisions.urls')),
    url(r'^impacts/', include('repair.apps.impacts.urls')),
    # API urls
    url(r'^login/', include('repair.apps.login.urls')),
    url(r'^api/', include('repair.rest_urls')),
    url(r'^publications/', include('publications_bootstrap.urls')),
    url(r'^logout', logout, {'next_page': '/'}, name='logout'),
    url(r'^jsi18n/', JavaScriptCatalog.as_view(), name='javascript-catalog'),
    url(r'^proxy/layers/(?P<layer_id>[0-9]+)/wms', WMSProxyView.as_view(), name='wms_proxy'),
    url(r'^wms-client/', include('wms_client.urls'))
] \
+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
