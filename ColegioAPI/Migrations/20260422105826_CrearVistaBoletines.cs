using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColegioAPI.Migrations
{
    /// <inheritdoc />
    public partial class CrearVistaBoletines : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        CREATE OR REPLACE FUNCTION ""ContarAsignaturasAlumno""(alumno_id INT)
        RETURNS integer AS $$
            SELECT COUNT(*)::integer
            FROM ""Asignatura_Alumnos""
            WHERE ""AlumnoId"" = alumno_id;
        $$ LANGUAGE sql;
    ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP FUNCTION ""ContarAsignaturasAlumno""(INT);");
        }
    }
}