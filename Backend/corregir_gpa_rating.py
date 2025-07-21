from students.models import Estudiante
from companies.models import Empresa
from Backend.evaluations.models import Evaluation
from companies.models import CalificacionEmpresa

# Recalcular GPA de estudiantes
def corregir_gpa_estudiantes():
    estudiantes = Estudiante.objects.all()
    for estudiante in estudiantes:
        estudiante.actualizar_calificacion()
    print(f"GPA recalculado para {estudiantes.count()} estudiantes.")

# Recalcular rating de empresas
def corregir_rating_empresas():
    empresas = Empresa.objects.all()
    for empresa in empresas:
        calificaciones = CalificacionEmpresa.objects.filter(empresa=empresa)
        if calificaciones.exists():
            promedio = sum([c.puntuacion for c in calificaciones]) / calificaciones.count()
            empresa.rating = round(promedio, 2)
        else:
            empresa.rating = 0
        empresa.save(update_fields=['rating'])
    print(f"Rating recalculado para {empresas.count()} empresas.")

if __name__ == "__main__":
    corregir_gpa_estudiantes()
    corregir_rating_empresas() 