from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Rating
from .serializers import RatingSerializer

class RatingViewSet(viewsets.ModelViewSet):
    """
    ViewSet para calificaciones
    """
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        """Asignar el usuario actual al crear una calificación"""
        serializer.save(user=self.request.user)
    
    def get_queryset(self):
        """Filtrar calificaciones según el usuario"""
        if self.request.user.is_staff:
            return Rating.objects.all()
        return Rating.objects.filter(user=self.request.user) 