# Base de Datos Generada por Django ORM

## ¿Cómo se crea la base de datos?

La base de datos de LeanMaker **se genera automáticamente** a partir de los modelos definidos en el backend Django. No es necesario ejecutar manualmente el archivo `schema.sql` ni crear tablas a mano: **Django se encarga de todo** mediante el sistema de migraciones.

## ¿Por qué este enfoque?

- Permite mantener la base de datos **sincronizada** con el backend y el frontend.
- Facilita la evolución, el versionado y la migración de la estructura de datos.
- Aprovecha todas las ventajas del ORM de Django: validaciones, relaciones, integridad, consultas avanzadas, etc.
- Permite que cualquier desarrollador pueda levantar el sistema desde cero con solo correr las migraciones.

## Relación con el schema original (`schema.sql`)

- Los modelos de Django han sido **diseñados para imitar y expandir** el schema original de la base de datos (`schema.sql`).
- Se han creado **25+ modelos/apps** para reflejar la robustez y funcionalidad del sistema original, cubriendo entidades como:
  - Niveles TRL (`trl_levels`)
  - Áreas de conocimiento (`areas`)
  - Estados de proyecto (`project_status`)
  - Asignaciones, evaluaciones, logs, reportes, respaldos, documentos, notificaciones, etc.
- El archivo `schema.sql` queda como **referencia histórica** y para comparar la cobertura de los modelos.

## ¿Cómo crear la base de datos desde cero?

1. **Asegúrate de tener la base de datos vacía** (puedes usar los scripts de limpieza si es necesario).
2. Activa el entorno virtual de Python:
   ```bash
   # En Windows PowerShell
   .\venv312\Scripts\Activate.ps1
   ```
3. Ve al directorio `Backend` y ejecuta:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. Django creará automáticamente todas las tablas y relaciones necesarias.

## ¿Qué hacer si necesitas limpiar la base de datos?

- Usa los scripts de limpieza (`clean_database_nuclear.sql`) para eliminar todas las tablas y objetos.
- Luego, vuelve a ejecutar las migraciones de Django.

## ¿Dónde están definidos los modelos?

- Cada app tiene su archivo `models.py` con la definición de las entidades.
- Los modelos están documentados con docstrings y comentarios para facilitar su comprensión.

## Ventajas de este enfoque

- **Automatización:** No necesitas preocuparte por el SQL manual.
- **Consistencia:** El backend, la base de datos y el frontend siempre estarán alineados.
- **Escalabilidad:** Puedes agregar o modificar modelos fácilmente y versionar los cambios.

## Referencia cruzada

- El archivo `schema.sql` sirve como referencia histórica y para comparar la cobertura de los modelos.
- Si necesitas una tabla o relación específica del schema original, revisa los modelos de Django: probablemente ya está cubierta o se puede agregar fácilmente.

---

**LeanMaker - Plataforma robusta, flexible y lista para escalar.** 