using Xunit;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Controllers;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ColegioAPI.Tests
{
    public class AlumnosTests
    {
        // --- HERRAMIENTA: Configurar Base de Datos en Memoria ---
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        // --- TEST 1: COMPROBAR ERROR 404 ---
        [Fact]
        public async Task GetAlumno_DeberiaDevolverNotFound_CuandoIdNoExiste()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var controller = new AlumnosController(context);
            int idInexistente = 999;

            // 2. Act
            var respuesta = await controller.GetAlumno(idInexistente);

            // 3. Assert
            Assert.IsType<NotFoundResult>(respuesta.Result);
        }

        // --- TEST 2: COMPROBAR CREACIÓN EXITOSA (POST) ---
        [Fact]
        public async Task PostAlumno_DeberiaGuardarYDevolverAlumno()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var controller = new AlumnosController(context);
            var nuevoAlumno = new Alumnos
            {
                Nombre = "Test",
                Apellido = "Junior",
                Edad = 10
            };

            // 2. Act
            var respuesta = await controller.PostAlumno(nuevoAlumno);

            // 3. Assert
            var resultado = Assert.IsType<CreatedAtActionResult>(respuesta.Result);
            var alumnoCreado = Assert.IsType<Alumnos>(resultado.Value);
            Assert.Equal("Test", alumnoCreado.Nombre);
        }

        // --- TEST 3: OBTENER TODOS LOS ALUMNOS (GET) ---
        [Fact]
        public async Task GetAlumnos_DeberiaDevolverListaCompleta()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            context.Alumnos.Add(new Alumnos { Nombre = "Juan", Apellido = "Perez", Edad = 20 });
            context.Alumnos.Add(new Alumnos { Nombre = "Ana", Apellido = "Lopez", Edad = 22 });
            await context.SaveChangesAsync();

            var controller = new AlumnosController(context);

            // 2. Act
            var respuesta = await controller.GetAlumnos();

            // 3. Assert
            var resultado = Assert.IsType<ActionResult<IEnumerable<Alumnos>>>(respuesta);
            var lista = Assert.IsAssignableFrom<IEnumerable<Alumnos>>(resultado.Value);

            // Verificamos que haya 2 alumnos
            Assert.Equal(2, lista.Count());
        }

        // --- TEST 4: EDITAR ALUMNO (PUT) ---
        [Fact]
        public async Task PutAlumno_DeberiaModificarDatos()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var alumnoOriginal = new Alumnos { Nombre = "Original", Apellido = "Test", Edad = 10 };
            context.Alumnos.Add(alumnoOriginal);
            await context.SaveChangesAsync();

            // Desligamos la entidad para evitar error de tracking
            context.Entry(alumnoOriginal).State = EntityState.Detached;

            var controller = new AlumnosController(context);

            var alumnoModificado = new Alumnos
            {
                Id = alumnoOriginal.Id,
                Nombre = "Modificado",
                Apellido = "Test",
                Edad = 11
            };

            // 2. Act
            await controller.PutAlumno(alumnoOriginal.Id, alumnoModificado);

            // 3. Assert
            var alumnoEnDb = await context.Alumnos.FindAsync(alumnoOriginal.Id);
            Assert.Equal("Modificado", alumnoEnDb.Nombre);
            Assert.Equal(11, alumnoEnDb.Edad);
        }

        // --- TEST 5: ELIMINAR ALUMNO (DELETE) ---
        [Fact]
        public async Task DeleteAlumno_DeberiaBorrarDeLaBaseDeDatos()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            var alumno = new Alumnos { Nombre = "Borrar", Apellido = "Me", Edad = 99 };
            context.Alumnos.Add(alumno);
            await context.SaveChangesAsync();

            var controller = new AlumnosController(context);

            // 2. Act
            await controller.DeleteAlumno(alumno.Id);

            // 3. Assert
            var alumnoBorrado = await context.Alumnos.FindAsync(alumno.Id);
            Assert.Null(alumnoBorrado);
        }
    }
}