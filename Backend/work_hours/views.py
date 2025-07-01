from rest_framework import viewsets, permissions
from .models import WorkHour
from .serializers import WorkHourSerializer

class WorkHourViewSet(viewsets.ModelViewSet):
    queryset = WorkHour.objects.all()
    serializer_class = WorkHourSerializer
    permission_classes = [permissions.IsAuthenticated]

