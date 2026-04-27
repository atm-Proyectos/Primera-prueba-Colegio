# 🎓 ColegioApp - Sistema de Gestión Escolar Avanzado

Bienvenido a **ColegioApp**, una aplicación web Full Stack para la gestión administrativa integral de un centro educativo. Este sistema permite administrar alumnos, asignaturas, calificaciones y auditorías de manera intuitiva, segura y escalable.

---

## 🚀 Stack Tecnológico

El proyecto está dividido en dos capas totalmente desacopladas:

### 🎨 Frontend (Cliente SPA)

- **Angular 17+**: Framework principal.
- **NgRx**: Gestión de estado reactiva (Store, Actions, Selectors).
- **TypeScript & HTML5/CSS3**: Lógica y diseño responsivo.
- **Librerías extra**: `ngx-charts` (gráficos) y `SweetAlert2` (notificaciones).

### ⚙️ Backend (Servidor API REST)

- **ASP.NET Core Web API (.NET 8)**: Servidor robusto y seguro.
- **C#**: Lenguaje principal.
- **Entity Framework Core**: ORM (Code-First).
- **PostgreSQL**: Base de datos relacional avanzada.
- **Autenticación**: JWT (JSON Web Tokens) con Autorización por Roles.
- **Librerías extra**: `QuestPDF` (exportación a PDF) y utilidades para Excel.

---

## ✨ Características Destacadas (Funcionalidades Avanzadas)

- **Arquitectura de Base de Datos Nativa**:
  - **Triggers (Disparadores)**: Sistema de auditoría automática que registra silenciosamente cualquier modificación (`UPDATE`) o borrado (`DELETE`) de notas por parte de los profesores.
  - **Funciones Escalares**: Cálculos matemáticos (como la nota media) ejecutados directamente en PostgreSQL para maximizar el rendimiento.
  - **Vistas (Views)**: Estructuras pre-calculadas en base de datos para la generación ultra-rápida de boletines de notas.
  - **Índices Únicos**: Restricciones a nivel de esquema para evitar matemáticamente la duplicidad de matrículas y notas.
- **Exportación de Datos**: Generación dinámica de boletines en PDF y reportes de alumnos en Excel.
- **Dashboard Estadístico**: Gráficas en tiempo real de aprobados/suspensos, medias globales y demografía.

---

## 🛠️ Guía de Instalación y Despliegue Local

Sigue estos pasos para arrancar el proyecto en tu máquina desde cero.

### 1. Prerrequisitos

Asegúrate de tener instalado en tu ordenador:

- [Node.js](https://nodejs.org/) (Versión LTS recomendada).
- [.NET 8 SDK](https://dotnet.microsoft.com/download).
- [PostgreSQL](https://www.postgresql.org/download/) y pgAdmin (opcional pero recomendado).
- Angular CLI global: Ejecuta `npm install -g @angular/cli`.

### 2. Configurar la Base de Datos

El proyecto usa **Code-First**, por lo que la base de datos se crea sola, pero necesitas configurar tu conexión.

1. Abre el archivo `ColegioAPI/appsettings.json`.
2. Busca la sección `"ConnectionStrings"` y modifica la cadena `"DefaultConnection"` con tu usuario y contraseña de PostgreSQL local:
   ```json
   "DefaultConnection": "Host=localhost;Database=ColegioDB;Username=TU_USUARIO;Password=TU_CONTRASEÑA"
   Abre una terminal en la carpeta ColegioAPI y ejecuta las migraciones para crear las tablas, funciones y triggers:
   ```

Bash
dotnet ef database update 3. Arrancar el Backend (API)
Manteniendo la terminal en la carpeta ColegioAPI, ejecuta:

Bash
dotnet restore
dotnet run
La API se iniciará normalmente en http://localhost:5141 (o el puerto indicado en la consola).

4. Arrancar el Frontend (Angular)
   Abre una nueva terminal (sin cerrar la del backend) y dirígete a la carpeta ColegioFront:

Bash
npm install # Solo la primera vez para descargar módulos
ng serve -o
La web se abrirá automáticamente en tu navegador en http://localhost:4200.
