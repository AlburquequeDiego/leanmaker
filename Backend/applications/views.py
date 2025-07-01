from rest_framework import viewsets, permissions
from .models import Aplicacion, Asignacion
from .serializers import AplicacionSerializer, AsignacionSerializer

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Aplicacion.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AplicacionSerializer

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Asignacion.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AsignacionSerializer

# class ApplicationViewSet(viewsets.ModelViewSet):
#     queryset = Aplicacion.objects.all()
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = None  # Stub, para que el equipo lo complete

# class AssignmentViewSet(viewsets.ModelViewSet):
#     queryset = Asignacion.objects.all()
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = None  # Stub, para que el equipo lo complete 