using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColegioAPI.Migrations
{
    /// <inheritdoc />
    public partial class AgregarDeleteAlTrigger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        CREATE OR REPLACE FUNCTION function_auditoria_notas()
        RETURNS TRIGGER AS $$
        BEGIN
            -- 1. Si la operación es una ACTUALIZACIÓN
            IF (TG_OP = 'UPDATE') THEN
                INSERT INTO ""AuditoriaNotas"" (""AsignaturaAlumnoId"", ""NotaAntigua"", ""NotaNueva"", ""Operacion"", ""Fecha"")
                VALUES (NEW.""AsignaturaAlumnoId"", OLD.""Valor"", NEW.""Valor"", 'UPDATE', NOW());
                RETURN NEW;
                
            -- 2. Si la operación es un BORRADO
            ELSIF (TG_OP = 'DELETE') THEN
                INSERT INTO ""AuditoriaNotas"" (""AsignaturaAlumnoId"", ""NotaAntigua"", ""NotaNueva"", ""Operacion"", ""Fecha"")
                VALUES (OLD.""AsignaturaAlumnoId"", OLD.""Valor"", NULL, 'DELETE', NOW());
                RETURN OLD;
            END IF;
            
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        -- ¡Importante! Borramos el disparador viejo y creamos uno nuevo que escuche UPDATE y DELETE
        DROP TRIGGER IF EXISTS trg_auditoria_notas ON ""Notas"";
        
        CREATE TRIGGER trg_auditoria_notas
        AFTER UPDATE OR DELETE ON ""Notas""
        FOR EACH ROW EXECUTE FUNCTION function_auditoria_notas();
    ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Si deshacemos esto, el trigger vuelve a escuchar solo UPDATE
            migrationBuilder.Sql(@"
        DROP TRIGGER IF EXISTS trg_auditoria_notas ON ""Notas"";
        
        CREATE TRIGGER trg_auditoria_notas
        AFTER UPDATE ON ""Notas""
        FOR EACH ROW EXECUTE FUNCTION function_auditoria_notas();
    ");
        }
    }
}
