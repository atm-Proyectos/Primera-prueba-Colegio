namespace ColegioAPI.models
{
    public class AsignaturaDTO
    {
        public int Id { get; set; }
        public string Clase { get; set; } = string.Empty;
        public string Profesor { get; set; } = string.Empty;
        public int? MatriculaId { get; set; }
    }
}