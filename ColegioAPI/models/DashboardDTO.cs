using System.Collections.Generic;

namespace ColegioAPI.models
{
    public class DashboardStats
    {
        public int TotalAlumnos { get; set; }
        public int TotalAsignaturas { get; set; }
        public double EdadMediaGlobal { get; set; }

        public List<DatoGrafica> AlumnosPorAsignatura { get; set; } = new List<DatoGrafica>();
        public List<DatoGrafica> DistribucionEdades { get; set; } = new List<DatoGrafica>();

        public List<DatoGrafica> NotaMediaPorAsignatura { get; set; } = new List<DatoGrafica>();
        public List<DatoGrafica> AprobadosVsSuspensos { get; set; } = new List<DatoGrafica>();
    }

    public class DatoGrafica
    {
        public string Nombre { get; set; } = string.Empty;
        public int Valor { get; set; }
        public decimal ValorDecimal { get; set; }
    }
}