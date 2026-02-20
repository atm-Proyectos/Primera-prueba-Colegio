using System.Collections.Generic;

namespace ColegioAPI.models
{
    public class DashboardStats
    {
        public required int TotalAlumnos { get; set; }
        public required int TotalAsignaturas { get; set; }
        public required double EdadMediaGlobal { get; set; }

        public required List<DatoGrafica> AlumnosPorAsignatura { get; set; } = new List<DatoGrafica>();
        public required List<DatoGrafica> DistribucionEdades { get; set; } = new List<DatoGrafica>();

        public required List<DatoGrafica> NotaMediaPorAsignatura { get; set; } = new List<DatoGrafica>();
        public required List<DatoGrafica> AprobadosVsSuspensos { get; set; } = new List<DatoGrafica>();
        public required List<DatoGrafica> AsignaturasMatriculadas { get; set; } = new List<DatoGrafica>();


    }

    public class DatoGrafica
    {
        public required string Nombre { get; set; } = string.Empty;
        public required int Valor { get; set; }
        public required decimal ValorDecimal { get; set; }
        public required string Asignatura { get; set; } = string.Empty;

    }
}