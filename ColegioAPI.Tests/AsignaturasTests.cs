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

namespace ColegioAPI.Tests
{
    public class AsignaturasTests
    {
        // --- ⚙️ CONFIGURACIÓN DE APOYO ---

        /// <summary>
        /// Crea un contexto de base de datos en memoria único para cada test.
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
        /// Simula un contexto de seguridad (usuario logueado) para el controlador.
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

        // --- 🧪 TESTS UNITARIOS ---

        [Fact]
        public async Task GetAsignaturas_DeberiaDevolverLista_CuandoExistenDatos()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();
            context.Asignaturas.Add(new Asignaturas
            {
                Id = 0,
                Clase = "Matemáticas",
                Profesor = "Newton",
                AsignaturaAlumnos = []
            });
            await context.SaveChangesAsync();

            var controller = new AsignaturasController(context);
            // Inyectamos un Admin para que el filtro 'User.IsInRole' no falle 🛡️
            SimularUsuario(controller, "AdminTest", "Admin");

            // 2. Act 🎬
            var respuesta = await controller.GetAsignaturas();

            // 3. Assert ✅
            var okResult = Assert.IsType<OkObjectResult>(respuesta.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<AsignaturaDTO>>(okResult.Value);
            Assert.Single(lista);
        }

        [Fact]
        public async Task PostAsignatura_DeberiaForzarNombreDeProfesor_CuandoEsRolProfesor()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();
            var controller = new AsignaturasController(context);
            var nuevaAsig = new Asignaturas
            {
                Id = 0,
                Clase = "Física",
                Profesor = "Desconocido",
                AsignaturaAlumnos = []
            };

            // Simulamos que la profesora logueada es 'MarieCurie' 🛡️
            SimularUsuario(controller, "MarieCurie", "Profesor");

            // 2. Act 🎬
            var respuesta = await controller.PostAsignatura(nuevaAsig);

            // 3. Assert ✅
            var resultado = Assert.IsType<CreatedAtActionResult>(respuesta);
            var creada = Assert.IsType<Asignaturas>(resultado.Value);

            // Verificamos que el sistema ignoró "Desconocido" y puso el nombre del usuario logueado
            Assert.Equal("MarieCurie", creada.Profesor);
        }

        [Fact]
        public async Task DeleteAsignatura_DeberiaBorrarAsignatura_CuandoExisteId()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();
            var asig = new Asignaturas
            {
                Id = 0,
                Clase = "Química",
                Profesor = "Dalton",
                AsignaturaAlumnos = []
            };
            context.Asignaturas.Add(asig);
            await context.SaveChangesAsync();

            var controller = new AsignaturasController(context);
            // Solo los Admin pueden borrar, así que simulamos uno 🛡️
            SimularUsuario(controller, "AdminPrincipal", "Admin");

            // 2. Act 🎬
            await controller.DeleteAsignatura(asig.Id);

            // 3. Assert ✅
            var borrada = await context.Asignaturas.FindAsync(asig.Id);
            Assert.Null(borrada);
        }
    }
}