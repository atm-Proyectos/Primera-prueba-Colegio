using Xunit;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Controllers;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace ColegioAPI.Tests
{
    public class AlumnosTests
    {
        // --- ⚙️ CONFIGURACIÓN DE APOYO (HELPERS) ---

        /// <summary>
        /// Crea una base de datos en memoria aislada para cada prueba. 🧪
        /// </summary>
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        /// <summary>
        /// Simula un contexto de seguridad para evitar NullReferenceException al acceder a User. 🛡️
        /// </summary>
        private void SimularUsuario(ControllerBase controller, string nombre, string rol)
        {
            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, nombre),
                new Claim(ClaimTypes.Role, rol)
            }, "TestAuthType");

            var user = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        // --- 🧪 TESTS DE FUNCIONALIDAD (CRUD) ---

        [Fact]
        public async Task GetAlumno_DeberiaDevolverAlumno_CuandoIdExiste()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();
            var alumnoFalso = new Alumnos
            {
                Id = 0,
                Nombre = "Carlos",
                Apellido = "Ruiz",
                Edad = 15,
                AsignaturaAlumnos = []
            };
            context.Alumnos.Add(alumnoFalso);
            await context.SaveChangesAsync();

            var controller = new AlumnosController(context);

            // 2. Act 🎬
            var resultado = await controller.GetAlumnos(alumnoFalso.Id);

            // 3. Assert ✅
            Assert.NotNull(resultado.Value);
            Assert.Equal("Carlos", resultado.Value.Nombre);
        }

        [Fact]
        public async Task GetAlumno_DeberiaDevolverNotFound_CuandoIdNoExiste()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();
            var controller = new AlumnosController(context);
            int idQueNoExiste = 999;

            // 2. Act 🎬
            var respuesta = await controller.GetAlumnos(idQueNoExiste);

            // 3. Assert ✅
            Assert.IsType<NotFoundResult>(respuesta.Result);
        }

        // --- 🧪 TESTS DE RELACIONES Y SEGURIDAD ---

        [Fact]
        public async Task GetMatriculas_DeberiaIncluirNombreDelAlumno_CuandoExisteRelacion()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            using (var context = new AppDbContext(options))
            {
                // 1. Añadimos la lista de matrículas obligatoria
                var alumno = new Alumnos { Id = 0, Nombre = "Carlos", Apellido = "Ruiz", Edad = 15, AsignaturaAlumnos = [] };
                var asignatura = new Asignaturas { Id = 0, Clase = "Programacion", Profesor = "Pepe", AsignaturaAlumnos = [] };
                context.Alumnos.Add(alumno);
                context.Asignaturas.Add(asignatura);
                await context.SaveChangesAsync();

                // 2. Tu fragmento de código corregido ✨
                context.Asignatura_Alumnos.Add(new AsignaturaAlumno
                {
                    Id = 0,
                    AlumnoId = alumno.Id,
                    AsignaturaId = asignatura.Id,
                    AñoEscolar = 2024,
                    FechaMatricula = DateTime.Now
                });
                await context.SaveChangesAsync();

                // 3. Añadimos el Id requerido al Usuario
                context.Usuarios.Add(new User { Id = 0, NombreUsuario = "carlosruiz", Rol = "Alumno", Password = "..." });
                await context.SaveChangesAsync();
            }

            using (var context = new AppDbContext(options))
            {
                var controller = new AsignaturaAlumnosController(context);
                // El disfraz debe ser "carlosruiz", que es el NombreUsuario generado
                SimularUsuario(controller, "carlosruiz", "Alumno");

                var respuesta = await controller.GetMatriculas();
                var okResult = Assert.IsType<OkObjectResult>(respuesta.Result);
                var json = JsonConvert.SerializeObject(okResult.Value);

                Assert.NotEqual("[]", json);
                Assert.Contains("Carlos", json);
            }
        }
    }
}