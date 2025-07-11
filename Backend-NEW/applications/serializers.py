
from .models import Aplicacion, Asignacion

class AplicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aplicacion
        fields = '__all__'

class AsignacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asignacion
        fields = '__all__' 