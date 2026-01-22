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
    public class AsignaturasTests
    {
        // --- CONFIGURACIÓN DE BD EN MEMORIA ---
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        // --- TEST 1: GET (Lista vacía o con datos) ---
        [Fact]
        public async Task GetAsignaturas_DeberiaDevolverLista()
        {
            // 1. Arrange
            var context = GetDatabaseContext();
            context.Asignaturas.Add(new Asignaturas { Clase = "Matemáticas", Profesor = "Newton" });
            context.Asignaturas.Add(new Asignaturas { Clase = "Física", Profesor = "Einstein" });
            await context.SaveChangesAsync();

            var controller = new AsignaturasController(context);

            // 2. Act
            var respuesta = await controller.GetAsignaturas();

            // 3. Assert
            var resultado = Assert.IsType<ActionResult<IEnumerable<Asignaturas>>>(respuesta);
            var lista = Assert.IsAssignableFrom<IEnumerable<Asignaturas>>(resultado.Value);
            Assert.Equal(2, lista.Count());
        }

        // --- TEST 2: POST (Crear Asignatura) ---
        [Fact]
        public async Task PostAsignatura_DeberiaCrearCorrectamente()
        {
            var context = GetDatabaseContext();
            var controller = new AsignaturasController(context);
            var nuevaAsig = new Asignaturas { Clase = "Química", Profesor = "Marie Curie" };

            var respuesta = await controller.PostAsignatura(nuevaAsig);

            var resultado = Assert.IsType<CreatedAtActionResult>(respuesta.Result);
            var creada = Assert.IsType<Asignaturas>(resultado.Value);
            Assert.Equal("Química", creada.Clase);
        }

        // --- TEST 3: DELETE (Borrar Asignatura) ---
        [Fact]
        public async Task DeleteAsignatura_DeberiaBorrar()
        {
            var context = GetDatabaseContext();
            var asig = new Asignaturas { Clase = "Recreo", Profesor = "Nadie" };
            context.Asignaturas.Add(asig);
            await context.SaveChangesAsync();

            var controller = new AsignaturasController(context);

            await controller.DeleteAsignatura(asig.Id);

            var borrada = await context.Asignaturas.FindAsync(asig.Id);
            Assert.Null(borrada);
        }
    }
}