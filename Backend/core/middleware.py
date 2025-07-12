from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware

class CustomCsrfMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.csrf_middleware = CsrfViewMiddleware(get_response)

    def __call__(self, request):
        # Verificar si la URL está en la lista de excepciones
        path = request.path_info.lstrip('/')
        
        for exempt_url in getattr(settings, 'CSRF_EXEMPT_URLS', []):
            if path.startswith(exempt_url.lstrip('/')):
                # Si la URL está exenta, saltar la validación de CSRF
                return self.get_response(request)
        
        # Si no está exenta, aplicar la validación normal de CSRF
        return self.csrf_middleware(request) 