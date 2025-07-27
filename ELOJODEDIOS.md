# IMPLEMENTACIÓN DE SISTEMA DE GEOLOCALIZACIÓN CON GOOGLE MAPS
## Proyecto LeanMaker - Dashboard de Administrador

### 📋 ÍNDICE
1. [Descripción General](#descripción-general)
2. [Requisitos Previos](#requisitos-previos)
3. [Implementación Backend (Django)](#implementación-backend)
4. [Implementación Frontend (React)](#implementación-frontend)
5. [Configuración de Google Maps](#configuración-google-maps)
6. [Consideraciones de Seguridad y Privacidad](#consideraciones-seguridad)
7. [Pruebas y Validación](#pruebas-y-validación)
8. [Mantenimiento y Monitoreo](#mantenimiento)

---

## 📖 DESCRIPCIÓN GENERAL

Este documento describe la implementación de un sistema de geolocalización en tiempo real para el dashboard de administrador de LeanMaker, que permitirá:

- **Obtener la IP y localización** de usuarios activos
- **Mostrar ubicaciones en Google Maps** en tiempo real
- **Actualizar automáticamente** las posiciones de usuarios
- **Filtrar por tipo de usuario** (estudiantes, empresas, administradores)
- **Registrar historial** de ubicaciones para auditoría

---

## 🎯 **¿Qué hace esta funcionalidad?**

**"Obtener la IP y localización de usuarios activos"** significa que el sistema:

1. **Captura automáticamente** la dirección IP de cada usuario cuando:
   - Inicia sesión en el sistema
   - Realiza cualquier acción en la plataforma
   - Accede al dashboard

2. **Determina la ubicación geográfica** de esa IP usando servicios de geolocalización, obteniendo:
   - **País** donde se encuentra el usuario
   - **Región/Estado** 
   - **Ciudad**
   - **Coordenadas** (latitud y longitud)

3. **Almacena esta información** en la base de datos para que el administrador pueda:
   - Ver en tiempo real dónde están los usuarios activos
   - Mostrar las ubicaciones en un mapa de Google Maps
   - Tener un historial de ubicaciones para auditoría

##  **Ejemplo práctico:**

Cuando un estudiante en México accede al sistema:
- **IP capturada**: `189.203.45.123`
- **Ubicación determinada**: Ciudad de México, México
- **Coordenadas**: 19.4326, -99.1332
- **Se muestra en el mapa** como un marcador verde (color para estudiantes)

Esta funcionalidad es la **base fundamental** de todo el sistema de geolocalización que se describe en el documento. ¿Te gustaría que profundice en algún aspecto específico de esta funcionalidad?

---

## 🔧 REQUISITOS PREVIOS

### Backend (Django)
```bash
# Instalar dependencias adicionales
pip install requests geopy django-user-agents
```

### Frontend (React)
```bash
# Instalar dependencias para Google Maps
npm install @googlemaps/js-api-loader @types/google.maps
```

### Servicios Externos
- **Cuenta de Google Cloud Platform** con Maps JavaScript API habilitada
- **API Key de Google Maps** (gratuita hasta 28,500 cargas/mes)
- **Servicio de geolocalización por IP** (opciones gratuitas: ipinfo.io, ipapi.co)

---

## 🐍 IMPLEMENTACIÓN BACKEND (Django)

### 1. Crear Nueva App para Geolocalización

```bash
cd Backend
python manage.py startapp user_location
```

### 2. Agregar App a INSTALLED_APPS

**Archivo: `Backend/core/settings.py`**
```python
INSTALLED_APPS = [
    # ... apps existentes ...
    'user_location',  # Nueva app
]
```

### 3. Crear Modelos de Geolocalización

**Archivo: `Backend/user_location/models.py`**
```python
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class UserLocation(models.Model):
    """
    Modelo para almacenar la ubicación de usuarios activos
    """
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    
    # Información de IP
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    
    # Coordenadas geográficas
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Información de localización
    country = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    timezone = models.CharField(max_length=50, blank=True, null=True)
    
    # Estado de la sesión
    is_active = models.BooleanField(default=True)
    last_activity = models.DateTimeField(auto_now=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_locations'
        ordering = ['-last_activity']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['last_activity']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.city}, {self.country}"

class LocationHistory(models.Model):
    """
    Historial de ubicaciones para auditoría
    """
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='location_history')
    
    # Información de ubicación
    ip_address = models.GenericIPAddressField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    
    # Contexto de la acción
    action = models.CharField(max_length=100)  # login, logout, api_call, etc.
    user_agent = models.TextField(blank=True, null=True)
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'location_history'
        ordering = ['-created_at']
```

### 4. Crear Servicio de Geolocalización

**Archivo: `Backend/user_location/services.py`**
```python
import requests
import json
from django.conf import settings
from django.core.cache import cache
from .models import UserLocation, LocationHistory

class GeolocationService:
    """
    Servicio para obtener información de geolocalización por IP
    """
    
    def __init__(self):
        self.api_url = "http://ip-api.com/json/"  # Servicio gratuito
        self.cache_timeout = 3600  # 1 hora
    
    def get_location_by_ip(self, ip_address):
        """
        Obtiene la localización de una IP usando cache
        """
        cache_key = f"ip_location_{ip_address}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        try:
            response = requests.get(f"{self.api_url}{ip_address}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                
                location_data = {
                    'latitude': data.get('lat'),
                    'longitude': data.get('lon'),
                    'country': data.get('country'),
                    'region': data.get('regionName'),
                    'city': data.get('city'),
                    'timezone': data.get('timezone'),
                }
                
                # Cachear resultado
                cache.set(cache_key, location_data, self.cache_timeout)
                return location_data
                
        except Exception as e:
            print(f"Error obteniendo localización para IP {ip_address}: {e}")
            return None
    
    def update_user_location(self, user, ip_address, user_agent=None, action="api_call"):
        """
        Actualiza la ubicación de un usuario
        """
        # Obtener información de geolocalización
        location_data = self.get_location_by_ip(ip_address)
        
        if location_data:
            # Actualizar o crear ubicación activa
            user_location, created = UserLocation.objects.update_or_create(
                user=user,
                defaults={
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'latitude': location_data.get('latitude'),
                    'longitude': location_data.get('longitude'),
                    'country': location_data.get('country'),
                    'region': location_data.get('region'),
                    'city': location_data.get('city'),
                    'timezone': location_data.get('timezone'),
                    'is_active': True,
                }
            )
            
            # Registrar en historial
            LocationHistory.objects.create(
                user=user,
                ip_address=ip_address,
                latitude=location_data.get('latitude'),
                longitude=location_data.get('longitude'),
                country=location_data.get('country'),
                region=location_data.get('region'),
                city=location_data.get('city'),
                action=action,
                user_agent=user_agent,
            )
            
            return user_location
        
        return None
```

### 5. Crear Middleware para Capturar IP

**Archivo: `Backend/user_location/middleware.py`**
```python
from django.utils.deprecation import MiddlewareMixin
from .services import GeolocationService

class UserLocationMiddleware(MiddlewareMixin):
    """
    Middleware para capturar y registrar la ubicación de usuarios
    """
    
    def process_request(self, request):
        # Solo procesar si el usuario está autenticado
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Obtener IP real (considerando proxies)
            ip_address = self.get_client_ip(request)
            
            # Obtener User-Agent
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Determinar acción basada en la URL
            action = self.get_action_from_url(request.path)
            
            # Actualizar ubicación
            geolocation_service = GeolocationService()
            geolocation_service.update_user_location(
                user=request.user,
                ip_address=ip_address,
                user_agent=user_agent,
                action=action
            )
    
    def get_client_ip(self, request):
        """
        Obtiene la IP real del cliente considerando proxies
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def get_action_from_url(self, path):
        """
        Determina la acción basada en la URL
        """
        if '/api/token/' in path:
            return 'login'
        elif '/api/auth/logout/' in path:
            return 'logout'
        elif '/api/dashboard/' in path:
            return 'dashboard_access'
        else:
            return 'api_call'
```

### 6. Agregar Middleware a Settings

**Archivo: `Backend/core/settings.py`**
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'user_location.middleware.UserLocationMiddleware',  # Nuevo middleware
]
```

### 7. Crear Vistas para API

**Archivo: `Backend/user_location/views.py`**
```python
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.http import require_http_methods
from django.core.serializers import serialize
from django.db.models import Q
from .models import UserLocation, LocationHistory
from .services import GeolocationService
import json

def is_admin(user):
    """Verifica si el usuario es administrador"""
    return user.is_authenticated and user.role == 'admin'

@login_required
@user_passes_test(is_admin)
@require_http_methods(["GET"])
def get_active_users_location(request):
    """
    Obtiene la ubicación de todos los usuarios activos
    """
    try:
        # Obtener usuarios activos (últimos 30 minutos)
        from django.utils import timezone
        from datetime import timedelta
        
        active_threshold = timezone.now() - timedelta(minutes=30)
        
        active_locations = UserLocation.objects.filter(
            is_active=True,
            last_activity__gte=active_threshold
        ).select_related('user')
        
        # Formatear datos para el frontend
        locations_data = []
        for location in active_locations:
            locations_data.append({
                'id': location.id,
                'user_id': location.user.id,
                'user_email': location.user.email,
                'user_name': f"{location.user.first_name} {location.user.last_name}".strip() or location.user.email,
                'user_role': location.user.role,
                'latitude': float(location.latitude) if location.latitude else None,
                'longitude': float(location.longitude) if location.longitude else None,
                'country': location.country,
                'region': location.region,
                'city': location.city,
                'ip_address': location.ip_address,
                'last_activity': location.last_activity.isoformat(),
                'timezone': location.timezone,
            })
        
        return JsonResponse({
            'success': True,
            'data': locations_data,
            'total_active': len(locations_data)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@user_passes_test(is_admin)
@require_http_methods(["GET"])
def get_location_history(request):
    """
    Obtiene el historial de ubicaciones de un usuario específico
    """
    try:
        user_id = request.GET.get('user_id')
        if not user_id:
            return JsonResponse({
                'success': False,
                'error': 'user_id es requerido'
            }, status=400)
        
        history = LocationHistory.objects.filter(
            user_id=user_id
        ).order_by('-created_at')[:100]  # Últimas 100 entradas
        
        history_data = []
        for entry in history:
            history_data.append({
                'id': entry.id,
                'ip_address': entry.ip_address,
                'latitude': float(entry.latitude) if entry.latitude else None,
                'longitude': float(entry.longitude) if entry.longitude else None,
                'country': entry.country,
                'region': entry.region,
                'city': entry.city,
                'action': entry.action,
                'created_at': entry.created_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'data': history_data
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required
@user_passes_test(is_admin)
@require_http_methods(["POST"])
def update_user_location_manual(request):
    """
    Actualiza manualmente la ubicación de un usuario (para testing)
    """
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        ip_address = data.get('ip_address')
        
        if not user_id or not ip_address:
            return JsonResponse({
                'success': False,
                'error': 'user_id e ip_address son requeridos'
            }, status=400)
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user = User.objects.get(id=user_id)
        geolocation_service = GeolocationService()
        
        result = geolocation_service.update_user_location(
            user=user,
            ip_address=ip_address,
            action='manual_update'
        )
        
        if result:
            return JsonResponse({
                'success': True,
                'message': 'Ubicación actualizada correctamente'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'No se pudo obtener la localización'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
```

### 8. Crear URLs

**Archivo: `Backend/user_location/urls.py`**
```python
from django.urls import path
from . import views

urlpatterns = [
    path('active-users/', views.get_active_users_location, name='active_users_location'),
    path('history/', views.get_location_history, name='location_history'),
    path('update-manual/', views.update_user_location_manual, name='update_location_manual'),
]
```

### 9. Agregar URLs al Proyecto Principal

**Archivo: `Backend/core/urls.py`**
```python
urlpatterns = [
    # ... URLs existentes ...
    path('api/user-location/', include('user_location.urls')),
]
```

### 10. Crear Migraciones

```bash
cd Backend
python manage.py makemigrations user_location
python manage.py migrate
```

---

## ⚛️ IMPLEMENTACIÓN FRONTEND (React)

### 1. Instalar Dependencias

```bash
cd Frontend
npm install @googlemaps/js-api-loader @types/google.maps
```

### 2. Crear Componente de Google Maps

**Archivo: `Frontend/src/components/features/UserLocationMap.tsx`**
```typescript
import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { Loader } from '@googlemaps/js-api-loader';

interface UserLocation {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
  latitude: number | null;
  longitude: number | null;
  country: string;
  region: string;
  city: string;
  ip_address: string;
  last_activity: string;
  timezone: string;
}

interface UserLocationMapProps {
  apiKey: string;
  refreshInterval?: number; // en milisegundos
}

const UserLocationMap: React.FC<UserLocationMapProps> = ({ 
  apiKey, 
  refreshInterval = 30000 // 30 segundos por defecto
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Colores por tipo de usuario
  const getMarkerColor = (role: string): string => {
    switch (role) {
      case 'admin': return '#f44336'; // Rojo
      case 'student': return '#4caf50'; // Verde
      case 'company': return '#2196f3'; // Azul
      default: return '#9e9e9e'; // Gris
    }
  };

  // Iconos personalizados para marcadores
  const createCustomMarker = (role: string): google.maps.Symbol => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: getMarkerColor(role),
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    };
  };

  // Inicializar mapa
  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });

      const google = await loader.load();
      
      if (mapRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 2,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        
        // Centrar mapa en la primera ubicación válida
        if (users.length > 0) {
          const validUser = users.find(u => u.latitude && u.longitude);
          if (validUser) {
            map.setCenter({ 
              lat: validUser.latitude!, 
              lng: validUser.longitude! 
            });
            map.setZoom(4);
          }
        }
      }
    } catch (err) {
      setError('Error al cargar Google Maps');
      console.error('Error loading Google Maps:', err);
    }
  };

  // Obtener datos de usuarios activos
  const fetchActiveUsers = async () => {
    try {
      const response = await fetch('/api/user-location/active-users/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener datos de usuarios');
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setLastUpdate(new Date());
        updateMarkers(data.data);
      } else {
        setError(data.error || 'Error desconocido');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar marcadores en el mapa
  const updateMarkers = (userData: UserLocation[]) => {
    if (!mapInstanceRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    // Crear nuevos marcadores
    userData.forEach(user => {
      if (user.latitude && user.longitude) {
        const marker = new google.maps.Marker({
          position: { lat: user.latitude, lng: user.longitude },
          map: mapInstanceRef.current,
          icon: createCustomMarker(user.user_role),
          title: user.user_name,
        });

        // Crear contenido del InfoWindow
        const infoContent = `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${user.user_name}</h3>
            <p style="margin: 5px 0; color: #666;">
              <strong>Email:</strong> ${user.user_email}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Rol:</strong> ${user.user_role}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Ubicación:</strong> ${user.city}, ${user.region}, ${user.country}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>IP:</strong> ${user.ip_address}
            </p>
            <p style="margin: 5px 0; color: #666;">
              <strong>Última actividad:</strong> ${new Date(user.last_activity).toLocaleString()}
            </p>
          </div>
        `;

        // Agregar evento click al marcador
        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(infoContent);
            infoWindowRef.current.open(mapInstanceRef.current, marker);
          }
        });

        markersRef.current.set(user.id, marker);
      }
    });
  };

  // Efectos
  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    fetchActiveUsers();
    
    // Configurar intervalo de actualización
    const interval = setInterval(fetchActiveUsers, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Actualizar marcadores cuando cambien los usuarios
  useEffect(() => {
    if (mapInstanceRef.current && users.length > 0) {
      updateMarkers(users);
    }
  }, [users]);

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '600px', position: 'relative' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Usuarios Activos en Tiempo Real
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {users.length} usuarios activos
          {lastUpdate && ` • Última actualización: ${lastUpdate.toLocaleTimeString()}`}
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1000 
        }}>
          <CircularProgress />
        </Box>
      )}

      <Box 
        ref={mapRef} 
        sx={{ 
          width: '100%', 
          height: 'calc(100% - 80px)', 
          borderRadius: 1 
        }} 
      />

      {/* Leyenda */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 16, 
        right: 16, 
        bgcolor: 'white', 
        p: 1, 
        borderRadius: 1, 
        boxShadow: 2 
      }}>
        <Typography variant="caption" display="block">
          <span style={{ color: '#f44336' }}>●</span> Administrador
        </Typography>
        <Typography variant="caption" display="block">
          <span style={{ color: '#4caf50' }}>●</span> Estudiante
        </Typography>
        <Typography variant="caption" display="block">
          <span style={{ color: '#2196f3' }}>●</span> Empresa
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserLocationMap;
```

### 3. Crear Hook para Datos de Ubicación

**Archivo: `Frontend/src/hooks/useUserLocation.ts`**
```typescript
import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';

interface UserLocation {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  user_role: string;
  latitude: number | null;
  longitude: number | null;
  country: string;
  region: string;
  city: string;
  ip_address: string;
  last_activity: string;
  timezone: string;
}

interface LocationHistoryEntry {
  id: string;
  ip_address: string;
  latitude: number | null;
  longitude: number | null;
  country: string;
  region: string;
  city: string;
  action: string;
  created_at: string;
}

export const useUserLocation = (refreshInterval = 30000) => {
  const [activeUsers, setActiveUsers] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/user-location/active-users/');
      
      if (response.success) {
        setActiveUsers(response.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        setError(response.error || 'Error al obtener usuarios activos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error fetching active users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (userId: string) => {
    try {
      const response = await apiService.get(`/user-location/history/?user_id=${userId}`);
      
      if (response.success) {
        return response.data as LocationHistoryEntry[];
      } else {
        throw new Error(response.error || 'Error al obtener historial');
      }
    } catch (err) {
      console.error('Error fetching user history:', err);
      throw err;
    }
  };

  const updateLocationManual = async (userId: string, ipAddress: string) => {
    try {
      const response = await apiService.post('/user-location/update-manual/', {
        user_id: userId,
        ip_address: ipAddress
      });
      
      if (response.success) {
        // Recargar datos después de actualización
        await fetchActiveUsers();
        return true;
      } else {
        throw new Error(response.error || 'Error al actualizar ubicación');
      }
    } catch (err) {
      console.error('Error updating location:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    
    const interval = setInterval(fetchActiveUsers, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    activeUsers,
    loading,
    error,
    lastUpdate,
    fetchActiveUsers,
    fetchUserHistory,
    updateLocationManual,
  };
};
```

### 4. Crear Componente de Tabla de Usuarios Activos

**Archivo: `Frontend/src/components/features/ActiveUsersTable.tsx`**
```typescript
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import {
  History as HistoryIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUserLocation } from '../../hooks/useUserLocation';

interface ActiveUsersTableProps {
  refreshInterval?: number;
}

const ActiveUsersTable: React.FC<ActiveUsersTableProps> = ({ refreshInterval = 30000 }) => {
  const {
    activeUsers,
    loading,
    error,
    lastUpdate,
    fetchActiveUsers,
    fetchUserHistory,
    updateLocationManual,
  } = useUserLocation(refreshInterval);

  const [historyDialog, setHistoryDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [manualUpdateDialog, setManualUpdateDialog] = useState(false);
  const [manualIp, setManualIp] = useState('');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'student': return 'success';
      case 'company': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'student': return 'Estudiante';
      case 'company': return 'Empresa';
      default: return role;
    }
  };

  const handleViewHistory = async (user: any) => {
    try {
      setSelectedUser(user);
      setHistoryDialog(true);
      const history = await fetchUserHistory(user.user_id);
      setUserHistory(history);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleManualUpdate = async () => {
    if (!selectedUser || !manualIp) return;
    
    try {
      await updateLocationManual(selectedUser.user_id, manualIp);
      setManualUpdateDialog(false);
      setManualIp('');
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Usuarios Activos ({activeUsers.length})
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {lastUpdate && `Actualizado: ${lastUpdate.toLocaleTimeString()}`}
            </Typography>
            <Tooltip title="Actualizar ahora">
              <IconButton onClick={fetchActiveUsers} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Última Actividad</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {user.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.user_email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.user_role)}
                      color={getRoleColor(user.user_role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.latitude && user.longitude ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {user.city}, {user.region}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No disponible
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {user.ip_address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.last_activity).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Ver historial">
                        <IconButton
                          size="small"
                          onClick={() => handleViewHistory(user)}
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Actualizar ubicación manual">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user);
                            setManualUpdateDialog(true);
                          }}
                        >
                          <LocationIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de Historial */}
      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Historial de Ubicaciones - {selectedUser?.user_name}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {entry.ip_address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {entry.city}, {entry.region}, {entry.country}
                    </TableCell>
                    <TableCell>
                      <Chip label={entry.action} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Actualización Manual */}
      <Dialog
        open={manualUpdateDialog}
        onClose={() => setManualUpdateDialog(false)}
      >
        <DialogTitle>
          Actualizar Ubicación Manual - {selectedUser?.user_name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dirección IP"
            type="text"
            fullWidth
            variant="outlined"
            value={manualIp}
            onChange={(e) => setManualIp(e.target.value)}
            placeholder="192.168.1.1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualUpdateDialog(false)}>Cancelar</Button>
          <Button onClick={handleManualUpdate} variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActiveUsersTable;
```

### 5. Integrar en el Dashboard de Administrador

**Archivo: `Frontend/src/pages/Dashboard/Admin/AdminDashboard.tsx`**
```typescript
// ... imports existentes ...
import UserLocationMap from '../../../components/features/UserLocationMap';
import ActiveUsersTable from '../../../components/features/ActiveUsersTable';

export default function AdminDashboard() {
  // ... código existente ...

  return (
    <Box sx={{ p: 3, bgcolor: '#f7fafd', minHeight: '100vh' }}>
      {/* ... código existente ... */}

      {/* Nueva sección de geolocalización */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
          Geolocalización de Usuarios
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {/* Mapa de Google Maps */}
          <UserLocationMap 
            apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
            refreshInterval={30000}
          />
          
          {/* Tabla de usuarios activos */}
          <ActiveUsersTable refreshInterval={30000} />
        </Box>
      </Box>

      {/* ... resto del código existente ... */}
    </Box>
  );
}
```

### 6. Agregar Variables de Entorno

**Archivo: `Frontend/.env`**
```env
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

---

## 🗺️ CONFIGURACIÓN DE GOOGLE MAPS

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Maps JavaScript API**
4. Ve a "Credentials" y crea una nueva API Key
5. Restringe la API Key a tu dominio para mayor seguridad

### 2. Configurar Restricciones de API Key

- **Restricción de aplicaciones**: Solo tu dominio
- **Restricción de APIs**: Solo Maps JavaScript API
- **Cuotas**: Configura límites diarios si es necesario

### 3. Obtener API Key

La API Key se verá así: `AIzaSyB...`

---

## 🔒 CONSIDERACIONES DE SEGURIDAD Y PRIVACIDAD

### 1. Cumplimiento Legal

- **GDPR**: Informar a usuarios sobre recopilación de datos de ubicación
- **Consentimiento**: Obtener consentimiento explícito si es necesario
- **Política de Privacidad**: Actualizar con información sobre geolocalización

### 2. Seguridad de Datos

- **Encriptación**: Almacenar IPs de forma segura
- **Retención**: Definir política de retención de datos de ubicación
- **Acceso**: Limitar acceso solo a administradores autorizados

### 3. Configuraciones de Seguridad

```python
# En settings.py
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True  # Solo en producción
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

---

## 🧪 PRUEBAS Y VALIDACIÓN

### 1. Pruebas del Backend

```bash
# Crear pruebas unitarias
python manage.py test user_location

# Probar endpoints manualmente
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/user-location/active-users/
```

### 2. Pruebas del Frontend

```bash
# Ejecutar pruebas
npm test

# Verificar tipos TypeScript
npm run type-check
```

### 3. Pruebas de Integración

- Verificar que los marcadores aparecen en el mapa
- Comprobar actualización en tiempo real
- Validar filtros por tipo de usuario
- Probar funcionalidad de historial

---

## 🔧 MANTENIMIENTO Y MONITOREO

### 1. Monitoreo de Rendimiento

- **Logs**: Revisar logs de Django para errores
- **Base de datos**: Monitorear tamaño de tablas de ubicación
- **API**: Verificar límites de Google Maps API

### 2. Limpieza de Datos

```python
# Script para limpiar datos antiguos
from user_location.models import LocationHistory
from django.utils import timezone
from datetime import timedelta

# Eliminar historial de más de 90 días
old_date = timezone.now() - timedelta(days=90)
LocationHistory.objects.filter(created_at__lt=old_date).delete()
```

### 3. Backup y Recuperación

- Incluir tablas de ubicación en backups regulares
- Documentar procedimientos de recuperación
- Probar restauración de datos

---

## 📝 NOTAS IMPORTANTES

1. **Precisión**: La geolocalización por IP no es 100% precisa
2. **VPN**: Los usuarios con VPN pueden mostrar ubicaciones incorrectas
3. **Privacidad**: Siempre respetar la privacidad de los usuarios
4. **Rendimiento**: Monitorear el impacto en el rendimiento del sistema
5. **Costos**: Google Maps tiene límites gratuitos, monitorear uso

---

## 🚀 PASOS FINALES

1. **Implementar gradualmente**: Comenzar con usuarios de prueba
2. **Documentar**: Crear documentación para administradores
3. **Capacitar**: Entrenar al equipo en el uso del sistema
4. **Monitorear**: Establecer alertas y monitoreo continuo
5. **Optimizar**: Ajustar basado en feedback y uso real

---

**¡El sistema de geolocalización está listo para implementar! 🎉** 