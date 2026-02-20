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

namespace ColegioAPI.Tests
{
    public class NotasTests
    {
        // --- ⚙️ HELPERS ---

        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }

        private void SimularUsuario(ControllerBase controller, string nombre, string rol)
        {
            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, nombre),
                new Claim(ClaimTypes.Role, rol)
            }, "TestAuthType");

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
            };
        }

        // --- 🧪 TESTS DE LÓGICA DE NEGOCIO ---

        [Fact]
        public async Task PostNota_DeberiaRetornarBadRequest_SiNotaEsInvalida()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();
            var controller = new NotasController(context);
            SimularUsuario(controller, "ProfesorPrueba", "Profesor");

            // Creamos una nota mayor a 10 ❌
            var notaInvalida = new Notas
            {
                Id = 0,
                Valor = 15.0m,
                AsignaturaAlumnoId = 1,
                AsignaturaAlumno = null // El compilador te pedirá esto si es required
            };

            // 2. Act 🎬
            var respuesta = await controller.PostNota(notaInvalida);

            // 3. Assert ✅
            // Verificamos que devuelva un BadRequestObjectResult (error 400 con mensaje)
            Assert.IsType<BadRequestObjectResult>(respuesta.Result);
        }

        [Fact]
        public async Task PostNota_DeberiaGuardarCorrectamente_SiNotaEsValida()
        {
            var context = GetDatabaseContext();

            // 1. Corregimos el nombre del tipo y añadimos campos obligatorios
            var matricula = new AsignaturaAlumno
            {
                Id = 1,
                AlumnoId = 1,
                AsignaturaId = 1,
                AñoEscolar = 2024,
                FechaMatricula = DateTime.Now
            };
            context.Asignatura_Alumnos.Add(matricula);
            await context.SaveChangesAsync();

            var controller = new NotasController(context);
            SimularUsuario(controller, "ProfesorPrueba", "Profesor");

            var notaValida = new Notas
            {
                Id = 0,
                Valor = 8.5m,
                AsignaturaAlumnoId = 1,
                AsignaturaAlumno = null // Marcado como null porque se asigna por ID en el controlador
            };

            // 2. Act 🎬
            var respuesta = await controller.PostNota(notaValida);

            // 3. Assert ✅
            Assert.IsType<CreatedAtActionResult>(respuesta.Result);
            var notaGuardada = await context.Notas.FirstOrDefaultAsync(n => n.Valor == 8.5m);
            Assert.NotNull(notaGuardada);
        }
    }
}