using System;
using System.ComponentModel.DataAnnotations;

public class ServiceAnnouncement
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; }

    [Required]
    public string Message { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public bool ShowPublicly { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
