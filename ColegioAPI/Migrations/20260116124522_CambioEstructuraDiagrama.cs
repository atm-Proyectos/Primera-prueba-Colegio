using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ColegioAPI.Migrations
{
    /// <inheritdoc />
    public partial class CambioEstructuraDiagrama : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notas_Alumnos_AlumnoId",
                table: "Notas");

            migrationBuilder.DropForeignKey(
                name: "FK_Notas_Asignaturas_AsignaturaId",
                table: "Notas");

            migrationBuilder.DropTable(
                name: "Matriculas");

            migrationBuilder.DropIndex(
                name: "IX_Notas_AlumnoId",
                table: "Notas");

            migrationBuilder.DropColumn(
                name: "AlumnoId",
                table: "Notas");

            migrationBuilder.RenameColumn(
                name: "AsignaturaId",
                table: "Notas",
                newName: "AsignaturaAlumnoId");

            migrationBuilder.RenameIndex(
                name: "IX_Notas_AsignaturaId",
                table: "Notas",
                newName: "IX_Notas_AsignaturaAlumnoId");

            migrationBuilder.CreateTable(
                name: "Asignatura_Alumnos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlumnoId = table.Column<int>(type: "integer", nullable: false),
                    AsignaturaId = table.Column<int>(type: "integer", nullable: false),
                    AñoEscolar = table.Column<int>(type: "integer", nullable: false),
                    FechaMatricula = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asignatura_Alumnos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Asignatura_Alumnos_Alumnos_AlumnoId",
                        column: x => x.AlumnoId,
                        principalTable: "Alumnos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Asignatura_Alumnos_Asignaturas_AsignaturaId",
                        column: x => x.AsignaturaId,
                        principalTable: "Asignaturas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Asignatura_Alumnos_AlumnoId",
                table: "Asignatura_Alumnos",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_Asignatura_Alumnos_AsignaturaId",
                table: "Asignatura_Alumnos",
                column: "AsignaturaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notas_Asignatura_Alumnos_AsignaturaAlumnoId",
                table: "Notas",
                column: "AsignaturaAlumnoId",
                principalTable: "Asignatura_Alumnos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notas_Asignatura_Alumnos_AsignaturaAlumnoId",
                table: "Notas");

            migrationBuilder.DropTable(
                name: "Asignatura_Alumnos");

            migrationBuilder.RenameColumn(
                name: "AsignaturaAlumnoId",
                table: "Notas",
                newName: "AsignaturaId");

            migrationBuilder.RenameIndex(
                name: "IX_Notas_AsignaturaAlumnoId",
                table: "Notas",
                newName: "IX_Notas_AsignaturaId");

            migrationBuilder.AddColumn<int>(
                name: "AlumnoId",
                table: "Notas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Matriculas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AlumnoId = table.Column<int>(type: "integer", nullable: false),
                    AsignaturaId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matriculas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Matriculas_Alumnos_AlumnoId",
                        column: x => x.AlumnoId,
                        principalTable: "Alumnos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Matriculas_Asignaturas_AsignaturaId",
                        column: x => x.AsignaturaId,
                        principalTable: "Asignaturas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notas_AlumnoId",
                table: "Notas",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_Matriculas_AlumnoId",
                table: "Matriculas",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_Matriculas_AsignaturaId",
                table: "Matriculas",
                column: "AsignaturaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notas_Alumnos_AlumnoId",
                table: "Notas",
                column: "AlumnoId",
                principalTable: "Alumnos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notas_Asignaturas_AsignaturaId",
                table: "Notas",
                column: "AsignaturaId",
                principalTable: "Asignaturas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
