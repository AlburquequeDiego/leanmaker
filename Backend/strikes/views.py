from rest_framework import viewsets, permissions
from .models import Strike
from .serializers import StrikeSerializer

class StrikeViewSet(viewsets.ModelViewSet):
    queryset = Strike.objects.all()
    serializer_class = StrikeSerializer
    permission_classes = [permissions.IsAuthenticated]
