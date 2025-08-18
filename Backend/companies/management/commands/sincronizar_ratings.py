from django.core.management.base import BaseCommand
from companies.models import Empresa
from students.models import Estudiante
from evaluations.models import Evaluation
from django.db import transaction

class Command(BaseCommand):
    help = 'Sincroniza todos los ratings y GPAs de empresas y estudiantes con sus evaluaciones reales'

    def add_arguments(self, parser):
        parser.add_argument(
            '--empresas',
            action='store_true',
            help='Solo sincronizar empresas',
        )
        parser.add_argument(
            '--estudiantes',
            action='store_true',
            help='Solo sincronizar estudiantes',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Mostrar qué se haría sin hacer cambios',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Iniciando sincronización de ratings y GPAs...')
        )
        
        dry_run = options['dry_run']
        solo_empresas = options['empresas']
        solo_estudiantes = options['estudiantes']
        
        if not solo_empresas and not solo_estudiantes:
            # Sincronizar ambos
            self.sincronizar_empresas(dry_run)
            self.sincronizar_estudiantes(dry_run)
        elif solo_empresas:
            self.sincronizar_empresas(dry_run)
        elif solo_estudiantes:
            self.sincronizar_estudiantes(dry_run)
        
        self.stdout.write(
            self.style.SUCCESS('✅ Sincronización completada')
        )

    def sincronizar_empresas(self, dry_run=False):
        """Sincroniza ratings de empresas"""
        self.stdout.write('\n🔧 Sincronizando ratings de empresas...')
        
        empresas = Empresa.objects.all()
        empresas_reparadas = 0
        
        for empresa in empresas:
            # Rating actual en BD
            rating_actual = empresa.rating
            
            # Buscar evaluaciones reales
            evaluaciones = Evaluation.objects.filter(
                project__company=empresa,
                status='completed',
                evaluation_type='student_to_company'
            )
            
            if evaluaciones.exists():
                # Calcular rating real
                scores = [e.score for e in evaluaciones]
                rating_real = round(sum(scores) / len(scores), 2)
                
                # Verificar si hay diferencia
                if rating_actual != rating_real:
                    if dry_run:
                        self.stdout.write(
                            f"  ⚠️  {empresa.company_name}: {rating_actual} → {rating_real} "
                            f"({len(scores)} evaluaciones: {scores})"
                        )
                    else:
                        try:
                            with transaction.atomic():
                                empresa.rating = rating_real
                                empresa.save(update_fields=['rating'])
                                self.stdout.write(
                                    f"  ✅ {empresa.company_name}: {rating_actual} → {rating_real}"
                                )
                                empresas_reparadas += 1
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f"  ❌ Error en {empresa.company_name}: {e}")
                            )
                else:
                    self.stdout.write(f"  ✅ {empresa.company_name}: {rating_actual} (correcto)")
            else:
                # No hay evaluaciones, rating debe ser 0
                if rating_actual != 0:
                    if dry_run:
                        self.stdout.write(
                            f"  ⚠️  {empresa.company_name}: {rating_actual} → 0 (sin evaluaciones)"
                        )
                    else:
                        try:
                            with transaction.atomic():
                                empresa.rating = 0
                                empresa.save(update_fields=['rating'])
                                self.stdout.write(f"  ✅ {empresa.company_name}: {rating_actual} → 0")
                                empresas_reparadas += 1
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f"  ❌ Error en {empresa.company_name}: {e}")
                            )
                else:
                    self.stdout.write(f"  ✅ {empresa.company_name}: 0 (correcto)")
        
        if dry_run:
            self.stdout.write(f"\n📊 RESUMEN EMPRESAS (DRY RUN):")
            self.stdout.write(f"  - Total empresas: {empresas.count()}")
            self.stdout.write(f"  - Con diferencias: {empresas_reparadas}")
        else:
            self.stdout.write(f"\n📊 RESUMEN EMPRESAS:")
            self.stdout.write(f"  - Total empresas: {empresas.count()}")
            self.stdout.write(f"  - Reparadas: {empresas_reparadas}")

    def sincronizar_estudiantes(self, dry_run=False):
        """Sincroniza GPAs de estudiantes"""
        self.stdout.write('\n🔧 Sincronizando GPAs de estudiantes...')
        
        estudiantes = Estudiante.objects.all()
        estudiantes_reparados = 0
        
        for estudiante in estudiantes:
            # GPA actual en BD
            gpa_actual = estudiante.gpa
            
            # Buscar evaluaciones reales
            evaluaciones = Evaluation.objects.filter(
                student=estudiante,
                status='completed',
                evaluation_type='company_to_student'
            )
            
            if evaluaciones.exists():
                # Calcular GPA real
                scores = [e.score for e in evaluaciones]
                gpa_real = round(sum(scores) / len(scores), 2)
                
                # Verificar si hay diferencia
                if gpa_actual != gpa_real:
                    if dry_run:
                        self.stdout.write(
                            f"  ⚠️  {estudiante.user.full_name}: {gpa_actual} → {gpa_real} "
                            f"({len(scores)} evaluaciones: {scores})"
                        )
                    else:
                        try:
                            with transaction.atomic():
                                estudiante.gpa = gpa_real
                                estudiante.save(update_fields=['gpa'])
                                self.stdout.write(
                                    f"  ✅ {estudiante.user.full_name}: {gpa_actual} → {gpa_real}"
                                )
                                estudiantes_reparados += 1
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f"  ❌ Error en {estudiante.user.full_name}: {e}")
                            )
                else:
                    self.stdout.write(f"  ✅ {estudiante.user.full_name}: {gpa_actual} (correcto)")
            else:
                # No hay evaluaciones, GPA debe ser 0
                if gpa_actual != 0:
                    if dry_run:
                        self.stdout.write(
                            f"  ⚠️  {estudiante.user.full_name}: {gpa_actual} → 0 (sin evaluaciones)"
                        )
                    else:
                        try:
                            with transaction.atomic():
                                estudiante.gpa = 0
                                estudiante.save(update_fields=['gpa'])
                                self.stdout.write(f"  ✅ {estudiante.user.full_name}: {gpa_actual} → 0")
                                estudiantes_reparados += 1
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f"  ❌ Error en {estudiante.user.full_name}: {e}")
                            )
                else:
                    self.stdout.write(f"  ✅ {estudiante.user.full_name}: 0 (correcto)")
        
        if dry_run:
            self.stdout.write(f"\n📊 RESUMEN ESTUDIANTES (DRY RUN):")
            self.stdout.write(f"  - Total estudiantes: {estudiantes.count()}")
            self.stdout.write(f"  - Con diferencias: {estudiantes_reparados}")
        else:
            self.stdout.write(f"\n📊 RESUMEN ESTUDIANTES:")
            self.stdout.write(f"  - Total estudiantes: {estudiantes.count()}")
            self.stdout.write(f"  - Reparados: {estudiantes_reparados}")
