using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColegioAPI.Migrations
{
    public partial class FuncionNotaMedia : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION ""CalcularNotaMedia""(alumno_id INT)
                RETURNS numeric AS $$
                    SELECT AVG(n.""Valor"")
                    FROM ""Notas"" n
                    INNER JOIN ""Asignatura_Alumnos"" aa ON n.""AsignaturaAlumnoId"" = aa.""Id""
                    WHERE aa.""AlumnoId"" = alumno_id;
                $$ LANGUAGE sql;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP FUNCTION ""CalcularNotaMedia""(INT);");
        }
    }
}