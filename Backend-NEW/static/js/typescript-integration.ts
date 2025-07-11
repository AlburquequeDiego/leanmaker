/**
 * TypeScript Integration for LeanMaker Backend
 * Integración TypeScript con Django Puro
 */

// Tipos globales
declare global {
    interface Window {
        LEANMAKER_CONFIG: {
            apiBaseUrl: string;
            csrfToken: string;
            user: {
                id: number;
                email: string;
                firstName: string;
                lastName: string;
                role: string;
                isVerified: boolean;
            } | null;
            debug: boolean;
        };
    }
}

// Interfaces TypeScript
interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'student' | 'company';
    isVerified: boolean;
    fullName?: string;
}

interface ApiResponse<T = any> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'company';
    phone?: string;
}

// Clase principal para integración con Django
class LeanMakerAPI {
    private baseUrl: string;
    private csrfToken: string;

    constructor() {
        this.baseUrl = window.LEANMAKER_CONFIG?.apiBaseUrl || '';
        this.csrfToken = window.LEANMAKER_CONFIG?.csrfToken || '';
    }

    /**
     * Realizar petición HTTP con CSRF token
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.csrfToken,
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                return {
                    status: 'error',
                    message: data.error || `HTTP error! status: ${response.status}`,
                    errors: data.errors
                };
            }
            
            return {
                status: 'success',
                data,
                message: data.message
            };
        } catch (error) {
            console.error('API request failed:', error);
            return {
                status: 'error',
                message: 'Error de conexión'
            };
        }
    }

    /**
     * Obtener datos del usuario actual
     */
    async getUserData(): Promise<ApiResponse<User>> {
        return this.request<User>('/users/api/data/');
    }

    /**
     * Login de usuario
     */
    async login(loginData: LoginData): Promise<ApiResponse<User>> {
        return this.request<User>('/users/api/login/', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
    }

    /**
     * Registro de usuario
     */
    async register(registerData: RegisterData): Promise<ApiResponse<User>> {
        return this.request<User>('/users/api/register/', {
            method: 'POST',
            body: JSON.stringify(registerData)
        });
    }

    /**
     * Actualizar datos del usuario
     */
    async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
        return this.request<User>('/users/api/data/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    /**
     * Obtener datos generales del sistema
     */
    async getSystemData(): Promise<ApiResponse<any>> {
        return this.request('/api-data/');
    }
}

// Clase para manejo de formularios
class FormHandler {
    private api: LeanMakerAPI;

    constructor() {
        this.api = new LeanMakerAPI();
    }

    /**
     * Manejar envío de formulario de login
     */
    async handleLogin(form: HTMLFormElement): Promise<boolean> {
        const formData = new FormData(form);
        const loginData: LoginData = {
            email: formData.get('email') as string,
            password: formData.get('password') as string
        };

        const response = await this.api.login(loginData);
        
        if (response.status === 'success') {
            // Redirigir al dashboard
            window.location.href = '/dashboard/';
            return true;
        } else {
            this.showError(response.message || 'Error en el login');
            return false;
        }
    }

    /**
     * Manejar envío de formulario de registro
     */
    async handleRegister(form: HTMLFormElement): Promise<boolean> {
        const formData = new FormData(form);
        const registerData: RegisterData = {
            email: formData.get('email') as string,
            password: formData.get('password1') as string,
            firstName: formData.get('first_name') as string,
            lastName: formData.get('last_name') as string,
            role: formData.get('role') as 'student' | 'company',
            phone: formData.get('phone') as string
        };

        const response = await this.api.register(registerData);
        
        if (response.status === 'success') {
            // Redirigir al dashboard
            window.location.href = '/dashboard/';
            return true;
        } else {
            this.showError(response.message || 'Error en el registro');
            return false;
        }
    }

    /**
     * Mostrar mensaje de error
     */
    private showError(message: string): void {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }
    }
}

// Clase para utilidades del dashboard
class DashboardUtils {
    private api: LeanMakerAPI;

    constructor() {
        this.api = new LeanMakerAPI();
    }

    /**
     * Cargar datos del dashboard
     */
    async loadDashboardData(): Promise<void> {
        const userResponse = await this.api.getUserData();
        
        if (userResponse.status === 'success' && userResponse.data) {
            this.updateUserInfo(userResponse.data);
        }
    }

    /**
     * Actualizar información del usuario en la UI
     */
    private updateUserInfo(user: User): void {
        const userNameElements = document.querySelectorAll('.user-name');
        const userRoleElements = document.querySelectorAll('.user-role');
        
        userNameElements.forEach(element => {
            element.textContent = user.fullName || `${user.firstName} ${user.lastName}`;
        });
        
        userRoleElements.forEach(element => {
            element.textContent = this.getRoleDisplay(user.role);
        });
    }

    /**
     * Obtener nombre legible del rol
     */
    private getRoleDisplay(role: string): string {
        const roleMap: Record<string, string> = {
            'admin': 'Administrador',
            'student': 'Estudiante',
            'company': 'Empresa'
        };
        return roleMap[role] || role;
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const api = new LeanMakerAPI();
    const formHandler = new FormHandler();
    const dashboardUtils = new DashboardUtils();

    // Configurar formularios
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await formHandler.handleLogin(loginForm);
        });
    }

    const registerForm = document.getElementById('register-form') as HTMLFormElement;
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await formHandler.handleRegister(registerForm);
        });
    }

    // Cargar datos del dashboard si estamos en esa página
    if (window.location.pathname.includes('/dashboard/')) {
        dashboardUtils.loadDashboardData();
    }

    // Debug mode
    if (window.LEANMAKER_CONFIG?.debug) {
        console.log('LeanMaker TypeScript Integration loaded');
        console.log('Config:', window.LEANMAKER_CONFIG);
    }
});

// Exportar para uso global
(window as any).LeanMakerAPI = LeanMakerAPI;
(window as any).FormHandler = FormHandler;
(window as any).DashboardUtils = DashboardUtils; 