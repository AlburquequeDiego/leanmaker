from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer para documentos"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    project_name = serializers.CharField(source='project.title', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'document_type', 'document_type_display',
            'file', 'file_url', 'file_type', 'file_size', 'file_size_mb', 'file_extension',
            'uploaded_by', 'uploaded_by_name', 'project', 'project_name',
            'is_public', 'download_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'uploaded_by', 'created_at', 'updated_at', 'file_size', 
            'file_type', 'download_count'
        ]

    def validate_file(self, value):
        """Validación del archivo"""
        if value:
            # Validar tamaño máximo (50MB)
            max_size = 50 * 1024 * 1024  # 50MB en bytes
            if value.size > max_size:
                raise serializers.ValidationError(
                    "El archivo no puede ser mayor a 50MB."
                )
            
            # Validar tipo de archivo
            allowed_types = [
                'application/pdf', 'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain', 'image/jpeg', 'image/png'
            ]
            
            if hasattr(value, 'content_type') and value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Tipo de archivo no permitido."
                )
        
        return value

    def create(self, validated_data):
        """Crear documento y establecer metadatos"""
        # Establecer usuario que subió el archivo
        validated_data['uploaded_by'] = self.context['request'].user
        
        # Establecer metadatos del archivo
        file_obj = validated_data.get('file')
        if file_obj:
            validated_data['file_size'] = file_obj.size
            validated_data['file_type'] = file_obj.content_type if hasattr(file_obj, 'content_type') else None
        
        document = super().create(validated_data)
        
        # Generar URL del archivo
        if file_obj:
            document.file_url = file_obj.url
            document.save(update_fields=['file_url'])
        
        return document


class DocumentListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listar documentos"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    project_name = serializers.CharField(source='project.title', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    file_size_mb = serializers.ReadOnlyField()
    file_extension = serializers.ReadOnlyField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'document_type', 'document_type_display',
            'file_url', 'file_size_mb', 'file_extension', 'uploaded_by_name',
            'project_name', 'is_public', 'download_count', 'created_at'
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer para subida de documentos"""
    class Meta:
        model = Document
        fields = ['title', 'description', 'document_type', 'file', 'is_public']

    def validate(self, data):
        """Validación personalizada"""
        # Verificar que el proyecto existe y el usuario tiene acceso
        project = data.get('project')
        user = self.context['request'].user
        
        if project:
            # Aquí podrías agregar lógica para verificar permisos del proyecto
            pass
        
        return data


class DocumentStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de documentos"""
    total_documents = serializers.IntegerField()
    documents_this_month = serializers.IntegerField()
    documents_this_year = serializers.IntegerField()
    total_size_mb = serializers.FloatField()
    total_downloads = serializers.IntegerField()
    public_documents = serializers.IntegerField()
    private_documents = serializers.IntegerField()
    documents_by_type = serializers.DictField()
    top_downloaded = serializers.ListField()


class DocumentSearchSerializer(serializers.Serializer):
    """Serializer para búsqueda de documentos"""
    query = serializers.CharField(required=False)
    document_type = serializers.CharField(required=False)
    project = serializers.IntegerField(required=False)
    uploaded_by = serializers.IntegerField(required=False)
    is_public = serializers.BooleanField(required=False)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False) 