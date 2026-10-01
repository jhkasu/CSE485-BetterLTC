using Backend.Models;

namespace Backend.Files;

public static class StarterResources {
    public const string MigrationName = "AddResources";

    private static readonly (string File, string Title, string Description, string Audience, string Topic)[] Items = [
        ("onboarding-checklist.docx", "Volunteer Onboarding Checklist",
            "Steps to welcome a new volunteer before the first day, on the first day, and during the first month.",
            "Organizations", "Onboarding"),
        ("thank-you-certificate.docx", "Certificate of Appreciation",
            "A printable thank-you certificate you can personalize with the volunteer's name and hours.",
            "Organizations", "Recognition"),
        ("volunteer-check-in-form.docx", "Volunteer Check-In Form",
            "Questions for a short, regular conversation about how volunteering is going and what would help.",
            "Organizations", "Feedback"),
    ];

    public static void Seed(AppDbContext db, string contentRoot) {
        var now = DateTime.UtcNow;
        foreach (var item in Items) {
            string path = Path.Combine(contentRoot, "StarterResources", item.File);
            if (!System.IO.File.Exists(path)) continue;
            byte[] data = System.IO.File.ReadAllBytes(path);
            var resource = new Resource {
                Title = item.Title,
                Description = item.Description,
                Audience = item.Audience,
                Topic = item.Topic,
                FileName = item.File,
                ContentType = FileSignatures.Docx,
                FileSize = data.Length,
                CreatedAt = now,
                UpdatedAt = now,
            };
            db.Resources.Add(resource);
            db.SaveChanges();
            db.ResourceFiles.Add(new ResourceFile { ResourceId = resource.Id, Data = data });
            db.SaveChanges();
        }
    }
}
