"""
URLs para la app ratings.
"""

from django.urls import path
from . import views

app_name = 'ratings'

urlpatterns = [
    path('', views.ratings_list, name='ratings_list'),
    path('<int:rating_id>/', views.ratings_detail, name='ratings_detail'),
]
