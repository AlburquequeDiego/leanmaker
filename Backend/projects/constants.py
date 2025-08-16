"""
CONSTANTES DE ESTADOS DE PROYECTO

IMPORTANTE: Este archivo centraliza todos los estados válidos de proyecto.
NO MODIFICAR sin revisar el impacto en todo el sistema.

ESTRATEGIA: Estados internos en inglés, etiquetas visibles en español.
"""

# Estados principales de proyecto (INTERNOS - siempre en inglés)
PROJECT_STATUS_ACTIVE = 'active'
PROJECT_STATUS_PUBLISHED = 'published'
PROJECT_STATUS_COMPLETED = 'completed'
PROJECT_STATUS_DRAFT = 'draft'
PROJECT_STATUS_DELETED = 'deleted'
PROJECT_STATUS_SUSPENDED = 'suspended'
PROJECT_STATUS_OPEN = 'open'
PROJECT_STATUS_IN_PROGRESS = 'in-progress'
PROJECT_STATUS_CANCELLED = 'cancelled'
PROJECT_STATUS_OVERDUE = 'overdue'
PROJECT_STATUS_CLOSED = 'closed'
PROJECT_STATUS_TERMINATED = 'terminated'

# Estados de aplicación (INTERNOS - siempre en inglés)
APPLICATION_STATUS_PENDING = 'pending'
APPLICATION_STATUS_REVIEWING = 'reviewing'
APPLICATION_STATUS_ACCEPTED = 'accepted'
APPLICATION_STATUS_REJECTED = 'rejected'
APPLICATION_STATUS_WITHDRAWN = 'withdrawn'

# Estados legacy (compatibilidad temporal)
LEGACY_STATUS_ACTIVO = 'activo'
LEGACY_STATUS_PUBLICADO = 'publicado'
LEGACY_STATUS_COMPLETADO = 'completado'
LEGACY_STATUS_BORRADOR = 'borrador'
LEGACY_STATUS_ELIMINADO = 'eliminado'
LEGACY_STATUS_SUSPENDIDO = 'suspendido'
LEGACY_STATUS_PENDIENTE = 'pendiente'
LEGACY_STATUS_EN_REVISION = 'en_revision'
LEGACY_STATUS_ACEPTADO = 'aceptado'
LEGACY_STATUS_RECHAZADO = 'rechazado'
LEGACY_STATUS_ABIERTO = 'abierto'
LEGACY_STATUS_EN_PROGRESO = 'en_progreso'
LEGACY_STATUS_CANCELADO = 'cancelado'
LEGACY_STATUS_ATRASADO = 'atrasado'
LEGACY_STATUS_CERRADO = 'cerrado'
LEGACY_STATUS_TERMINADO = 'terminado'

# Mapeo de estados legacy a estados internos
LEGACY_TO_INTERNAL_MAP = {
    LEGACY_STATUS_ACTIVO: PROJECT_STATUS_ACTIVE,
    LEGACY_STATUS_PUBLICADO: PROJECT_STATUS_PUBLISHED,
    LEGACY_STATUS_COMPLETADO: PROJECT_STATUS_COMPLETED,
    LEGACY_STATUS_BORRADOR: PROJECT_STATUS_DRAFT,
    LEGACY_STATUS_ELIMINADO: PROJECT_STATUS_DELETED,
    LEGACY_STATUS_SUSPENDIDO: PROJECT_STATUS_SUSPENDED,
    LEGACY_STATUS_PENDIENTE: APPLICATION_STATUS_PENDING,
    LEGACY_STATUS_EN_REVISION: APPLICATION_STATUS_REVIEWING,
    LEGACY_STATUS_ACEPTADO: APPLICATION_STATUS_ACCEPTED,
    LEGACY_STATUS_RECHAZADO: APPLICATION_STATUS_REJECTED,
    LEGACY_STATUS_ABIERTO: PROJECT_STATUS_OPEN,
    LEGACY_STATUS_EN_PROGRESO: PROJECT_STATUS_IN_PROGRESS,
    LEGACY_STATUS_CANCELADO: PROJECT_STATUS_CANCELLED,
    LEGACY_STATUS_ATRASADO: PROJECT_STATUS_OVERDUE,
    LEGACY_STATUS_CERRADO: PROJECT_STATUS_CLOSED,
    LEGACY_STATUS_TERMINADO: PROJECT_STATUS_TERMINATED
}

# Estados que requieren estudiantes asignados
STATUSES_REQUIRING_ASSIGNED_STUDENTS = [
    PROJECT_STATUS_ACTIVE,
    LEGACY_STATUS_ACTIVO
]

# Estados que muestran todos los postulantes
STATUSES_SHOWING_ALL_APPLICANTS = [
    PROJECT_STATUS_PUBLISHED,
    LEGACY_STATUS_PUBLICADO
]

# Estados que indican proyecto finalizado
STATUSES_INDICATING_FINALIZED = [
    PROJECT_STATUS_COMPLETED,
    PROJECT_STATUS_DELETED,
    PROJECT_STATUS_CANCELLED,
    PROJECT_STATUS_CLOSED,
    PROJECT_STATUS_TERMINATED,
    LEGACY_STATUS_COMPLETADO,
    LEGACY_STATUS_ELIMINADO,
    LEGACY_STATUS_CANCELADO,
    LEGACY_STATUS_CERRADO,
    LEGACY_STATUS_TERMINADO
]

# Estados que indican proyecto activo
STATUSES_INDICATING_ACTIVE = [
    PROJECT_STATUS_ACTIVE,
    PROJECT_STATUS_PUBLISHED,
    PROJECT_STATUS_OPEN,
    PROJECT_STATUS_IN_PROGRESS,
    LEGACY_STATUS_ACTIVO,
    LEGACY_STATUS_PUBLICADO,
    LEGACY_STATUS_ABIERTO,
    LEGACY_STATUS_EN_PROGRESO
]

def normalize_status(status: str) -> str:
    """
    Normaliza un estado a su versión interna en inglés.
    
    Args:
        status: Estado a normalizar (puede ser en español o inglés)
    
    Returns:
        Estado normalizado en inglés, o el estado original si no se puede normalizar
    """
    if not status:
        return PROJECT_STATUS_DRAFT
    
    normalized = status.lower().strip()
    
    # Si ya es un estado interno, devolverlo tal como está
    if normalized in [
        PROJECT_STATUS_ACTIVE, PROJECT_STATUS_PUBLISHED, PROJECT_STATUS_COMPLETED,
        PROJECT_STATUS_DRAFT, PROJECT_STATUS_DELETED, PROJECT_STATUS_SUSPENDED,
        PROJECT_STATUS_OPEN, PROJECT_STATUS_IN_PROGRESS, PROJECT_STATUS_CANCELLED,
        PROJECT_STATUS_OVERDUE, PROJECT_STATUS_CLOSED, PROJECT_STATUS_TERMINATED
    ]:
        return normalized
    
    # Si es un estado legacy, convertirlo
    if normalized in LEGACY_TO_INTERNAL_MAP:
        return LEGACY_TO_INTERNAL_MAP[normalized]
    
    # Si no se puede normalizar, devolver el estado original
    return normalized

def is_status_requiring_assigned_students(status: str) -> bool:
    """Verifica si un estado requiere estudiantes asignados."""
    normalized = normalize_status(status)
    return normalized in STATUSES_REQUIRING_ASSIGNED_STUDENTS

def is_status_showing_all_applicants(status: str) -> bool:
    """Verifica si un estado debe mostrar todos los postulantes."""
    normalized = normalize_status(status)
    return normalized in STATUSES_SHOWING_ALL_APPLICANTS

def is_status_finalized(status: str) -> bool:
    """Verifica si un estado indica que el proyecto está finalizado."""
    normalized = normalize_status(status)
    return normalized in STATUSES_INDICATING_FINALIZED

def is_status_active(status: str) -> bool:
    """Verifica si un estado indica que el proyecto está activo."""
    normalized = normalize_status(status)
    return normalized in STATUSES_INDICATING_ACTIVE
