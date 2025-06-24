from rest_framework import viewsets, permissions
from .models import WorkHours
from .serializers import WorkHoursSerializer

class WorkHoursViewSet(viewsets.ModelViewSet):
    queryset = WorkHours.objects.all()
    serializer_class = WorkHoursSerializer
    permission_classes = [permissions.IsAuthenticated]

