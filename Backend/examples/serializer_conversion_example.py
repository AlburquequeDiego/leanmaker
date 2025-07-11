"""
EJEMPLO DE CONVERSIÓN: Serializers DRF -> Formularios Django
============================================================

Este archivo muestra cómo se convierten los serializers DRF a formularios Django
durante el proceso de migración.
"""

# ========================================
# ANTES: Serializer DRF (Backend Original)
# ========================================

"""
# serializers.py (DRF)
from rest_framework import serializers
from .models import Project, Application, Evaluation

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'company', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['title', 'description', 'company', 'requirements']

class ApplicationSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.user.full_name')
    
    class Meta:
        model = Application
        fields = ['id', 'project', 'student', 'student_name', 'status', 'applied_at']
        read_only_fields = ['id', 'applied_at']

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['id', 'project', 'student', 'company_rating', 'student_rating', 'comments']
"""

# ========================================
# DESPUÉS: Formulario Django (Backend Nuevo)
# ========================================

"""
# serializers.py (convertido a formularios Django)
from django import forms
from django.core.exceptions import ValidationError
from .models import Project, Application, Evaluation

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['title', 'description', 'company', 'status']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'company': forms.Select(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }

class ProjectCreateForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['title', 'description', 'company', 'requirements']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'company': forms.Select(attrs={'class': 'form-control'}),
            'requirements': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class ApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = ['project', 'student', 'status']
        widgets = {
            'project': forms.Select(attrs={'class': 'form-control'}),
            'student': forms.Select(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }

class EvaluationForm(forms.ModelForm):
    class Meta:
        model = Evaluation
        fields = ['project', 'student', 'company_rating', 'student_rating', 'comments']
        widgets = {
            'project': forms.Select(attrs={'class': 'form-control'}),
            'student': forms.Select(attrs={'class': 'form-control'}),
            'company_rating': forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'max': 5}),
            'student_rating': forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'max': 5}),
            'comments': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
"""

# ========================================
# CÓMO USAR LOS FORMULARIOS EN LAS VISTAS
# ========================================

"""
# views.py (Django puro)
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Project
from .serializers import ProjectForm, ProjectCreateForm

@login_required
def project_create(request):
    if request.method == 'POST':
        form = ProjectCreateForm(request.POST)
        if form.is_valid():
            project = form.save(commit=False)
            project.company = request.user.company  # Asignar empresa del usuario
            project.save()
            messages.success(request, 'Proyecto creado exitosamente.')
            return redirect('project_detail', pk=project.pk)
    else:
        form = ProjectCreateForm()
    
    return render(request, 'projects/create.html', {
        'form': form,
        'title': 'Crear Proyecto'
    })

@login_required
def project_update(request, pk):
    project = get_object_or_404(Project, pk=pk)
    
    if request.method == 'POST':
        form = ProjectForm(request.POST, instance=project)
        if form.is_valid():
            form.save()
            messages.success(request, 'Proyecto actualizado exitosamente.')
            return redirect('project_detail', pk=project.pk)
    else:
        form = ProjectForm(instance=project)
    
    return render(request, 'projects/update.html', {
        'form': form,
        'project': project,
        'title': 'Actualizar Proyecto'
    })
"""

# ========================================
# VENTAJAS DE LA CONVERSIÓN
# ========================================

"""
✅ VENTAJAS DE FORMULARIOS DJANGO:

1. **Validación automática**: Django valida automáticamente los datos
2. **Widgets personalizables**: Control total sobre la apariencia HTML
3. **Integración nativa**: Funciona perfectamente con templates Django
4. **Menos código**: No necesitas serializers complejos
5. **Más simple**: Lógica más directa y fácil de entender
6. **CSRF protection**: Protección automática contra CSRF
7. **Mensajes de error**: Integración con el sistema de mensajes de Django

❌ DESVENTAJAS DE ELIMINAR SERIALIZERS:

1. **Pérdida de lógica**: Puedes perder validaciones personalizadas
2. **Dependencias rotas**: Otros archivos pueden depender de los serializers
3. **Reescritura manual**: Tendrías que reescribir toda la lógica
4. **Inconsistencia**: Diferentes apps pueden tener diferentes enfoques

✅ SOLUCIÓN: CONVERTIR EN LUGAR DE ELIMINAR

- Mantiene toda la lógica de validación
- Convierte automáticamente a formularios Django
- Preserva las relaciones y campos
- Agrega widgets Bootstrap automáticamente
- Mantiene la funcionalidad completa
"""

# ========================================
# EJEMPLO DE TEMPLATE CON FORMULARIO
# ========================================

"""
<!-- templates/projects/create.html -->
{% extends 'base.html' %}

{% block title %}Crear Proyecto{% endblock %}

{% block content %}
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h4>Crear Nuevo Proyecto</h4>
                </div>
                <div class="card-body">
                    <form method="post">
                        {% csrf_token %}
                        
                        {% for field in form %}
                        <div class="mb-3">
                            <label for="{{ field.id_for_label }}" class="form-label">
                                {{ field.label }}
                            </label>
                            {{ field }}
                            {% if field.help_text %}
                            <div class="form-text">{{ field.help_text }}</div>
                            {% endif %}
                            {% if field.errors %}
                            <div class="alert alert-danger">
                                {{ field.errors }}
                            </div>
                            {% endif %}
                        </div>
                        {% endfor %}
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Crear Proyecto
                            </button>
                            <a href="{% url 'project_list' %}" class="btn btn-secondary">
                                <i class="fas fa-arrow-left me-2"></i>Cancelar
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
""" 