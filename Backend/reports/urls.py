"""
URLs para la app reports.
"""

from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.reports_list, name='reports_list'),
    path('<int:report_id>/', views.reports_detail, name='reports_detail'),
]
