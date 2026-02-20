namespace ColegioAPI.models
{
    public class AsignaturaDTO
    {
        public required int Id { get; set; }
        public required string Clase { get; set; } = string.Empty;
        public required string Profesor { get; set; } = string.Empty;
        public required int? MatriculaId { get; set; }
    }
}