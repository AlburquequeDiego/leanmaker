"""
URLs para la app evaluation_categories.
"""

from django.urls import path
from . import views

app_name = 'evaluation_categories'

urlpatterns = [
    path('', views.evaluation_categories_list, name='evaluation_categories_list'),
    path('<int:category_id>/', views.evaluation_categories_detail, name='evaluation_categories_detail'),
]
