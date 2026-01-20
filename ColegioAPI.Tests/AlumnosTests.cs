using Xunit;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Controllers;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;

namespace ColegioAPI.Tests
{
    public class AlumnosTests
    {
        // HERRAMIENTA
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
            // 1. ARRANGE (Preparar el escenario)
            var context = GetDatabaseContext();
            var controller = new AlumnosController(context);
            int idInexistente = 999;

            // 2. ACT (Ejecutar la acción)
            var respuesta = await controller.GetAlumno(idInexistente);

            // 3. ASSERT (Verificar que devuelve 404 NotFound)
            Assert.IsType<NotFoundResult>(respuesta.Result);
        }

        // --- TEST 2: COMPROBAR CREACIÓN EXITOSA ---
        [Fact]
        public async Task PostAlumno_DeberiaGuardarYDevolverAlumno()
        {
            // 1. Preparar
            var context = GetDatabaseContext();
            var controller = new AlumnosController(context);
            var nuevoAlumno = new Alumnos
            {
                Nombre = "Test",
                Apellido = "Junior",
                Edad = 10
            };

            // 2. Ejecutar
            var respuesta = await controller.PostAlumno(nuevoAlumno);

            // 3. Verificar
            var resultado = Assert.IsType<CreatedAtActionResult>(respuesta.Result);
            var alumnoCreado = Assert.IsType<Alumnos>(resultado.Value);
            Assert.Equal("Test", alumnoCreado.Nombre);
        }
    }
}