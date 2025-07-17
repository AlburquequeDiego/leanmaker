"""
URLs para la app strikes.
"""

from django.urls import path
from . import views

app_name = 'strikes'

urlpatterns = [
    # Strikes existentes
    path('', views.strikes_list, name='strikes_list'),
    path('<uuid:strike_id>/', views.strike_detail, name='strike_detail'),
    
    # Reportes de strikes
    path('reports/', views.strike_reports_list, name='strike_reports_list'),
    path('reports/create/', views.strike_reports_create, name='strike_reports_create'),
    path('reports/<uuid:report_id>/approve/', views.strike_report_approve, name='strike_report_approve'),
    path('reports/<uuid:report_id>/reject/', views.strike_report_reject, name='strike_report_reject'),
]
