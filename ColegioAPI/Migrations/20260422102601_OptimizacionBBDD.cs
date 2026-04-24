using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColegioAPI.Migrations
{
    /// <inheritdoc />
    public partial class OptimizacionBBDD : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notas_AsignaturaAlumnoId",
                table: "Notas");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_AsignaturaAlumnoId",
                table: "Notas",
                column: "AsignaturaAlumnoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notas_AsignaturaAlumnoId",
                table: "Notas");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_AsignaturaAlumnoId",
                table: "Notas",
                column: "AsignaturaAlumnoId");
        }
    }
}
