"""
Django settings for repair project.

Generated by 'django-admin startproject' using Django 1.11.5.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os
import sys
import django

from django.utils.translation import ugettext_lazy as _

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_ROOT = os.path.abspath(os.path.join(PROJECT_DIR, 'public'))

GEOSERVER_URL = 'https://geoserver.h2020repair.bk.tudelft.nl/geoserver'
GEOSERVER_USER = os.environ.get('GEOSERVER_USER')
GEOSERVER_PASS = os.environ.get('GEOSERVER_PASS')

if os.name == 'nt':
    os.environ['GDAL_DATA'] = os.path.join(sys.prefix, 'Library',
                                           'share', 'gdal')
    os.environ['PATH'] = ';'.join([os.environ['PATH'],
                                  os.path.join(os.path.dirname(
                                      os.path.dirname(__file__)),
                                 'spatialite'),
                                  os.path.join(sys.prefix, 'Library', 'bin')])


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '$f#=dn^_6xu1e7py@$(8_8yu2(%*a&b@6uxr*_zyi3c*%5@u1^'

ALLOWED_HOSTS = ['geodesignhub.h2020cinderela.bk.tudelft.nl',
                 'gdse.h2020cinderela.bk.tudelft.nl',
                 'staging.h2020cinderela.bk.tudelft.nl',
                 "localhost",
                 "127.0.0.1"]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'django_pandas',
    'djmoney',
    'rest_framework',
    'rest_framework_gis',
    'fixture_magic',
    'repair.apps.login',
    'repair.apps.asmfa',
    'repair.apps.studyarea',
    'repair.apps.changes',
    'repair.apps.statusquo',
    'repair.apps.conclusions',
    'repair.apps.publications',
    'repair.apps.reversions',
    'repair.apps.wmsresources',
    'reversion',
    'reversion_compare', # https://github.com/jedie/django-reversion-compare
    'publications_bootstrap',
    'webpack_loader',
    'django_filters',
    'wms_client',
]

ADD_REVERSION_ADMIN=True
#SESSION_ENGINE = 'django.contrib.sessions.backends.signed_cookies'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
        'rest_framework_datatables.renderers.DatatablesRenderer',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework_datatables.filters.DatatablesFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework_datatables.pagination.DatatablesPageNumberPagination',
    'PAGE_SIZE': 50,
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler'
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'reversion.middleware.RevisionMiddleware',
]

ROOT_URLCONF = 'repair.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(PROJECT_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'debug': True,
            'context_processors': [
                'django.template.context_processors.static',
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'repair.wsgi.application'

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

#USE_X_FORWARDED_HOST = True

# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LOGIN_REDIRECT_URL = '/'
LOGIN_URL = '/login/login'

# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

LANGUAGES = (
    ('en-us', _('English')),
    ('de', _('German')),
    ('nl', _('Dutch')),
    ('pl', _('Polish')),
    ('hu', _('Hungarian')),
    ('it', _('Italian')),
)

if sys.platform == 'linux':
    # Linux
    GDAL_LIBRARY_PATH = os.path.join(sys.exec_prefix,
                                     'lib', 'libgdal.so')
    GEOS_LIBRARY_PATH = os.path.join(sys.exec_prefix,
                                     'lib', 'libgeos_c.so')
    if not os.path.exists(GEOS_LIBRARY_PATH):
        GEOS_LIBRARY_PATH = os.path.join(
            sys.exec_prefix, 'lib', 'x86_64-linux-gnu', 'libgeos_c.so')
    PROJ4_LIBRARY_PATH = os.path.join(sys.exec_prefix,
                                     'lib', 'libproj.so')
elif sys.platform == 'darwin':
    # Max OS
    GDAL_LIBRARY_PATH = os.path.join(sys.exec_prefix,
                                     'lib', 'libgdal.dylib')
    GEOS_LIBRARY_PATH = os.path.join(sys.exec_prefix,
                                     'lib', 'libgeos_c.dylib')
    PROJ4_LIBRARY_PATH = os.path.join(sys.exec_prefix,
                                     'lib', 'libproj.dylib')

LOCALE_PATHS = (
    os.path.join(PROJECT_DIR, "locale"),
)

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

# dir of static files for deployment
STATIC_ROOT = os.path.join(PUBLIC_ROOT, 'static')
MEDIA_ROOT = os.path.join(PUBLIC_ROOT, 'media')

STATIC_URL = '/static/'
MEDIA_URL = '/media/'

# dir to store temporary media files
TEMP_MEDIA_ROOT = os.path.join(MEDIA_ROOT, 'tmp')
# dir to store the graphs in
GRAPH_ROOT = os.path.join(MEDIA_ROOT, 'graphs')

STATICFILES_DIRS = [
    os.path.join(PROJECT_DIR, "static"),
]

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder'
)

FIXTURE_DIRS = (
    os.path.join(PROJECT_DIR, "fixtures"),
)

LOGGING = {
    'version': 1,
        'disable_existing_loggers': False,
        'filters': {
            'require_debug_false': {
                '()': 'django.utils.log.RequireDebugFalse',
                },
            'require_debug_true': {
                '()': 'django.utils.log.RequireDebugTrue',
                },
            },
        'formatters': {
            'django.server': {
                '()': 'django.utils.log.ServerFormatter',
                'format': '[%(server_time)s] %(message)s',
            }
            },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'filters': ['require_debug_true'],
                'class': 'logging.StreamHandler',
                },
            'console_debug_false': {
                'level': 'ERROR',
                    'filters': ['require_debug_false'],
                    'class': 'logging.StreamHandler',
                    },
            'django.server': {
                'level': 'INFO',
                    'class': 'logging.StreamHandler',
                    'formatter': 'django.server',
                    },
                #'mail_admins': {
                    #'level': 'ERROR',
                        #'filters': ['require_debug_false'],
                        #'class': 'django.utils.log.AdminEmailHandler'
                #}
                },
        'loggers': {
            'django': {
                'handlers': ['console', 'console_debug_false'],  # , 'mail_admins'],
                # 'level': 'INFO',
                },
            'django.server': {
                'handlers': ['django.server'],
                'level': 'INFO',
                'propagate': False,
            },
        
            #'django.db.backends': {
                #'level': 'DEBUG',
                #'handlers': ['console'],
            #}
        }
}

PROTECT_FOREIGN_KEY = False
