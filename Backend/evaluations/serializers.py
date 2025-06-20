from rest_framework import serializers
from .models import Evaluation
from users.models import CustomUser

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'evaluator_type', 'evaluator_id')

    def validate(self, data):
        """
        Valida que se esté evaluando a una entidad, y no a ambas o a ninguna.
        También valida que el evaluador no se evalúe a sí mismo.
        """
        user = self.context['request'].user
        
        # Validar a quién se evalúa
        is_evaluating_student = 'evaluated_student' in data
        is_evaluating_company = 'evaluated_company' in data

        if not is_evaluating_student and not is_evaluating_company:
            raise serializers.ValidationError("Debe especificar a quién se está evaluando (estudiante o empresa).")
        
        if is_evaluating_student and is_evaluating_company:
            raise serializers.ValidationError("No puede evaluar a un estudiante y a una empresa en la misma evaluación.")

        # Validar que el evaluador no se evalúe a sí mismo
        if is_evaluating_student and user.role == CustomUser.Role.STUDENT:
            if data['evaluated_student'].user_id == user.id:
                raise serializers.ValidationError("Un estudiante no puede evaluarse a sí mismo.")
        
        if is_evaluating_company and user.role == CustomUser.Role.COMPANY:
            if data['evaluated_company'].user_id == user.id:
                 raise serializers.ValidationError("Una empresa no puede evaluarse a sí misma.")

        return data 