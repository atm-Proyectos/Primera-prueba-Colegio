using Microsoft.EntityFrameworkCore;
using ColegioAPI.models;

namespace ColegioAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Alumnos> Alumnos { get; set; }
        public DbSet<Asignaturas> Asignaturas { get; set; }
        public DbSet<AsignaturaAlumno> Asignatura_Alumnos { get; set; }
        public DbSet<Notas> Notas { get; set; }
    }
}