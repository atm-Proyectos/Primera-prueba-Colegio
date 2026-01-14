# 🎓 ColegioApp - Sistema de Gestión Escolar

Bienvenido a **ColegioApp**, una aplicación web completa para la gestión administrativa de un centro educativo. Permite administrar alumnos, asignaturas y calificaciones de manera intuitiva y rápida.

---

## 🚀 Tecnologías Utilizadas

Este proyecto es una aplicación **Full Stack** dividida en dos partes principales:

### 🎨 Frontend (Cliente)

- **Angular 16+**: Framework principal.
- **TypeScript**: Lógica de componentes y servicios.
- **HTML5 & CSS3**: Diseño responsivo y limpio.

### ⚙️ Backend (Servidor)

- **ASP.NET Core Web API**: API RESTful robusta.
- **C#**: Lenguaje del servidor.
- **Entity Framework Core**: ORM para gestión de datos.

---

## 📂 Estructura del Proyecto

El repositorio está organizado en dos carpetas principales:

```text
Colegio/
├── ColegioAPI/      # Backend (.NET Web API)
└── ColegioFront/    # Frontend (Angular Project)
```

## 🛠️ Instalación y Ejecución

Sigue estos pasos para arrancar el proyecto en tu máquina local.

### 1. Prerrequisitos

Asegúrate de tener instalado:

- **Node.js** (para Angular).
- **.NET SDK** (versión 7 u 8).
- **Angular CLI** (npm install -g @angular/cli).

### 2. Arrancar el Backend (API)

La API debe estar corriendo para que el Frontend pueda obtener datos.

```bash
cd ColegioAPI
dotnet restore
dotnet run
```

La API se iniciará normalmente en: http://localhost:5141

### 3. Arrancar el Frontend (Angular)

Abre una nueva terminal (no cierres la del backend).

```bash
cd ColegioFront
npm install    # Solo la primera vez para instalar dependencias
ng serve -o
```

La web se abrirá automáticamente en: http://localhost:4200

## ✨ Funcionalidades Principales

### 🏠 Dashboard Principal:

Buscador global en tiempo real.

Vista rápida de notas recientes y estados (Aprobado/Suspenso).

### 👨‍🎓 Gestión de Alumnos:

Registrar nuevos alumnos.

Editar datos personales.

Dar de baja alumnos.

### 📚 Gestión de Asignaturas:

Crear clases y asignar profesores.

Listado completo de materias.

### 📝 Control de Notas:

Asignar calificaciones a un alumno en una asignatura específica.

Validación de datos y cálculo de estados.
