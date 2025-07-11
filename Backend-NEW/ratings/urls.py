, include

from .views import RatingViewSet


(r'ratings', RatingViewSet, basename='rating')

urlpatterns = [
    
] 