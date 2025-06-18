# Tutorial de Instalación y Ejecución de Leanmaker

Este tutorial te guiará paso a paso para instalar y ejecutar el proyecto Leanmaker (Frontend y Backend) en tu entorno local.

## Requisitos previos
- Tener instalado **Python 3.10+**
- Tener instalado **Node.js 18+** y **npm**

---

## 1. Clonar el repositorio (si aplica)
Si aún no tienes el proyecto, clónalo desde el repositorio correspondiente:
```bash
git clone <URL_DEL_REPOSITORIO>
```

---

## 2. Instalación y ejecución del Backend (Django)

1. Abre una terminal y navega a la carpeta `Backend`:
   ```bash
   cd Backend
   ```
2. Edita el archivo `requirements.txt` y cambia la línea:
   ```
   pytest-django==4.7.0
   ```
   por:
   ```
   pytest-django==4.5.2
   ```
3. Guarda el archivo.
4. Instala las dependencias de Python:
   ```bash
   pip install --user -r requirements.txt
   ```
5. (Opcional) Aplica migraciones si es necesario:
   ```bash
   python manage.py migrate
   ```
6. Inicia el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```
   El backend estará disponible en: http://127.0.0.1:8000

---

## 3. Instalación y ejecución del Frontend (Vite + React)

1. Abre otra terminal y navega a la carpeta `Frontend`:
   ```bash
   cd Frontend
   ```
2. Instala las dependencias de Node.js:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   El frontend estará disponible en: http://localhost:3000

---

## 4. Notas adicionales
- Si tienes problemas de dependencias en el frontend, usa siempre `npm install --legacy-peer-deps`.
- Asegúrate de que ambos servidores estén corriendo antes de probar la aplicación.
- Si necesitas datos de ejemplo, revisa la carpeta `database/`.

---

¡Listo! Ahora puedes desarrollar y probar Leanmaker en tu entorno local.
