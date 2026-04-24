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
        public DbSet<User> Usuarios { get; set; }
        public DbSet<Profesores> Profesores { get; set; }
        public DbSet<VistaBoletin> VistaBoletines { get; set; }
        public DbSet<AuditoriaNota> AuditoriaNotas { get; set; }


        [DbFunction("ContarAsignaturasAlumno", "public")]
        public static int ContarAsignaturasAlumno(int alumnoId) => throw new NotSupportedException("Esta función se ejecuta en base de datos.");

        [DbFunction("CalcularNotaMedia", "public")]
        public static decimal CalcularNotaMedia(int alumnoId) => throw new NotSupportedException();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Es buena práctica dejar esto si ya estaba
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // 🚀 OPTIMIZACIÓN: ÍNDICES DE BASE DE DATOS
            // ==========================================

            // 1. Índice Simple: Para buscar alumnos por Apellido a la velocidad de la luz
            modelBuilder.Entity<Alumnos>()
                .HasIndex(a => a.Apellido)
                .HasDatabaseName("IX_Alumnos_Apellido");

            // 2. Índice Compuesto: Para cuando el usuario busca por Nombre Y Apellido a la vez
            modelBuilder.Entity<Alumnos>()
                .HasIndex(a => new { a.Nombre, a.Apellido })
                .HasDatabaseName("IX_Alumnos_NombreApellido");

            // 3. Índice de Rendimiento: Para que el dashboard calcule los aprobados/suspensos más rápido
            modelBuilder.Entity<Notas>()
                .HasIndex(n => n.Valor)
                .HasDatabaseName("IX_Notas_Valor");

            // ==========================================
            // 👁️ VISTAS DE BASE DE DATOS
            // ==========================================
            modelBuilder.Entity<VistaBoletin>()
                .HasNoKey()
                .ToView("Vista_Boletines_Alumnos");

        }
    }
}