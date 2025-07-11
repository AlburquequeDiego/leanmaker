"""
Views for User models - Django Puro + TypeScript.
"""

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.forms import UserCreationForm
from django.db import transaction
import json

from .models import User
from .forms import UserRegistrationForm, UserLoginForm, UserUpdateForm


def home(request):
    """Home page view."""
    return render(request, 'home.html', {
        'title': 'LeanMaker - Conexión Estudiantil-Empresarial'
    })


def user_login(request):
    """User login view."""
    if request.method == 'POST':
        form = UserLoginForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']
            user = authenticate(request, email=email, password=password)
            
            if user is not None:
                login(request, user)
                messages.success(request, f'Bienvenido, {user.full_name}!')
                return redirect('dashboard')
            else:
                messages.error(request, 'Credenciales inválidas.')
    else:
        form = UserLoginForm()
    
    return render(request, 'auth/login.html', {
        'form': form,
        'title': 'Iniciar Sesión'
    })


def user_logout(request):
    """User logout view."""
    logout(request)
    messages.info(request, 'Has cerrado sesión correctamente.')
    return redirect('home')


def user_register(request):
    """User registration view."""
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            with transaction.atomic():
                user = form.save(commit=False)
                user.set_password(form.cleaned_data['password'])
                user.save()
                
                # Crear perfil específico según el rol
                if user.role == 'student':
                    from students.models import Estudiante
                    Estudiante.objects.create(
                        user=user,
                        status='pending',
                        api_level=1,
                        strikes=0,
                        gpa=0.0,
                        completed_projects=0,
                        total_hours=0,
                        experience_years=0,
                        rating=0.0
                    )
                elif user.role == 'company':
                    from companies.models import Empresa
                    Empresa.objects.create(
                        user=user,
                        company_name=user.first_name or user.email,
                        verified=False,
                        rating=0.0,
                        total_projects=0,
                        projects_completed=0,
                        total_hours_offered=0,
                        status='active'
                    )
                
                login(request, user)
                messages.success(request, f'Cuenta creada exitosamente. Bienvenido, {user.full_name}!')
                return redirect('dashboard')
    else:
        form = UserRegistrationForm()
    
    return render(request, 'auth/register.html', {
        'form': form,
        'title': 'Registrarse'
    })


@login_required
def user_profile(request):
    """User profile view."""
    if request.method == 'POST':
        form = UserUpdateForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Perfil actualizado correctamente.')
            return redirect('user_profile')
    else:
        form = UserUpdateForm(instance=request.user)
    
    return render(request, 'users/profile.html', {
        'form': form,
        'user': request.user,
        'title': 'Mi Perfil'
    })


@login_required
def change_password(request):
    """Change password view."""
    if request.method == 'POST':
        old_password = request.POST.get('old_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')
        
        if not request.user.check_password(old_password):
            messages.error(request, 'Contraseña actual incorrecta.')
        elif new_password != confirm_password:
            messages.error(request, 'Las contraseñas no coinciden.')
        else:
            request.user.set_password(new_password)
            request.user.save()
            messages.success(request, 'Contraseña cambiada exitosamente.')
            return redirect('user_profile')
    
    return render(request, 'users/change_password.html', {
        'title': 'Cambiar Contraseña'
    })


@login_required
def user_list(request):
    """User list view (admin only)."""
    if not request.user.is_staff:
        messages.error(request, 'No tienes permisos para acceder a esta página.')
        return redirect('dashboard')
    
    users = User.objects.all().order_by('-date_joined')
    return render(request, 'users/user_list.html', {
        'users': users,
        'title': 'Lista de Usuarios'
    })


@login_required
def user_detail(request, user_id):
    """User detail view."""
    user = get_object_or_404(User, id=user_id)
    
    # Solo permitir ver el propio perfil o si es admin
    if not (request.user.is_staff or request.user.id == user.id):
        messages.error(request, 'No tienes permisos para ver este perfil.')
        return redirect('dashboard')
    
    return render(request, 'users/user_detail.html', {
        'profile_user': user,
        'title': f'Perfil de {user.full_name}'
    })


# API endpoints para TypeScript (simples, sin DRF)
@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_user_data(request):
    """API endpoint para datos de usuario."""
    if request.method == 'GET':
        if request.user.is_authenticated:
            data = {
                'id': request.user.id,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'role': request.user.role,
                'is_verified': request.user.is_verified,
                'full_name': request.user.full_name,
                'date_joined': request.user.date_joined.isoformat(),
            }
            return JsonResponse(data)
        else:
            return JsonResponse({'error': 'No autenticado'}, status=401)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'No autenticado'}, status=401)
        
        try:
            data = json.loads(request.body)
            # Actualizar datos del usuario
            if 'first_name' in data:
                request.user.first_name = data['first_name']
            if 'last_name' in data:
                request.user.last_name = data['last_name']
            if 'phone' in data:
                request.user.phone = data['phone']
            if 'bio' in data:
                request.user.bio = data['bio']
            
            request.user.save()
            return JsonResponse({'status': 'success', 'message': 'Usuario actualizado'})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """API endpoint para login."""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({'error': 'Email y contraseña requeridos'}, status=400)
        
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({
                'status': 'success',
                'message': 'Login exitoso',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'full_name': user.full_name,
                }
            })
        else:
            return JsonResponse({'error': 'Credenciales inválidas'}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    """API endpoint para registro."""
    try:
        data = json.loads(request.body)
        form = UserRegistrationForm(data)
        
        if form.is_valid():
            with transaction.atomic():
                user = form.save(commit=False)
                user.set_password(form.cleaned_data['password'])
                user.save()
                
                # Crear perfil específico
                if user.role == 'student':
                    from students.models import Estudiante
                    Estudiante.objects.create(
                        user=user,
                        status='pending',
                        api_level=1,
                        strikes=0,
                        gpa=0.0,
                        completed_projects=0,
                        total_hours=0,
                        experience_years=0,
                        rating=0.0
                    )
                elif user.role == 'company':
                    from companies.models import Empresa
                    Empresa.objects.create(
                        user=user,
                        company_name=user.first_name or user.email,
                        verified=False,
                        rating=0.0,
                        total_projects=0,
                        projects_completed=0,
                        total_hours_offered=0,
                        status='active'
                    )
                
                login(request, user)
                return JsonResponse({
                    'status': 'success',
                    'message': 'Usuario registrado exitosamente',
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'full_name': user.full_name,
                    }
                })
        else:
            return JsonResponse({'error': 'Datos inválidos', 'errors': form.errors}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400) 