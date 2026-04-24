using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ColegioAPI.Migrations
{
    public partial class CrearTriggerAuditoria : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Creación de la tabla (Lo que EF generó)
            migrationBuilder.CreateTable(
                name: "AuditoriaNotas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AsignaturaAlumnoId = table.Column<int>(type: "integer", nullable: false),
                    NotaAntigua = table.Column<double>(type: "double precision", nullable: true),
                    NotaNueva = table.Column<double>(type: "double precision", nullable: true),
                    Operacion = table.Column<string>(type: "text", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditoriaNotas", x => x.Id);
                });

            // 2. Trigger inyectado con SQL nativo
            migrationBuilder.Sql(@"
                CREATE OR REPLACE FUNCTION function_auditoria_notas()
                RETURNS TRIGGER AS $$
                BEGIN
                    -- Si la operación es una ACTUALIZACIÓN (Cambio de nota)
                    IF (TG_OP = 'UPDATE') THEN
                        INSERT INTO ""AuditoriaNotas"" (""AsignaturaAlumnoId"", ""NotaAntigua"", ""NotaNueva"", ""Operacion"", ""Fecha"")
                        VALUES (NEW.""AsignaturaAlumnoId"", OLD.""Valor"", NEW.""Valor"", 'UPDATE', NOW());
                        RETURN NEW;
                    END IF;
                    RETURN NULL;
                END;
                $$ LANGUAGE plpgsql;

                -- Enganchamos la función a la tabla Notas
                CREATE TRIGGER trg_auditoria_notas
                AFTER UPDATE ON ""Notas""
                FOR EACH ROW EXECUTE FUNCTION function_auditoria_notas();
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Si nos arrepentimos, borramos el trigger, la función y la tabla
            migrationBuilder.Sql(@"
                DROP TRIGGER IF EXISTS trg_auditoria_notas ON ""Notas"";
                DROP FUNCTION IF EXISTS function_auditoria_notas();
            ");

            migrationBuilder.DropTable(
                name: "AuditoriaNotas");
        }
    }
}