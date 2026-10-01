using System.Net;
using Backend.Models;

namespace Backend.Email;

public static class HelpRequestEmails {
    private static readonly Dictionary<string, string> FrenchHelpTypes = new() {
        ["Senior Care Support"] = "Soutien aux aînés",
        ["Meal Assistance"] = "Aide aux repas",
        ["Transportation Support"] = "Aide au transport",
        ["Medical Assistance"] = "Aide médicale",
        ["Mental Health Support"] = "Soutien en santé mentale",
        ["Housing Support"] = "Aide au logement",
        ["Other"] = "Autre",
    };

    public static OutgoingEmail Confirmation(HelpRequest request, string language) {
        bool french = language.StartsWith("fr", StringComparison.OrdinalIgnoreCase);
        string helpType = french && FrenchHelpTypes.TryGetValue(request.HelpType, out var fr) ? fr : request.HelpType;
        string city = request.City == "Other" ? (french ? "Autre" : "Other") : request.City;
        string name = request.FirstName;

        string subject = french
            ? "Nous avons reçu votre demande d'aide"
            : "We received your help request";
        string[] lines = french
            ? [
                $"Bonjour {name},",
                "Nous avons bien reçu votre demande d'aide. Un organisme partenaire de votre région communiquera avec vous bientôt pour discuter des prochaines étapes.",
                $"Type d'aide : {helpType}",
                $"Région : {city}",
                request.ForFamilyMember ? $"Demande faite pour : {request.SeniorName}" : "",
                "Ce service n'est pas destiné aux urgences. En cas d'urgence, composez le 911.",
                "Merci de faire partie de notre communauté,",
                "L'équipe VolunteerConnect Saskatchewan",
            ]
            : [
                $"Hi {name},",
                "We have received your help request. A partner organization in your area will contact you soon to discuss next steps.",
                $"Type of help: {helpType}",
                $"Area: {city}",
                request.ForFamilyMember ? $"Requested for: {request.SeniorName}" : "",
                "This service is not for emergencies. In an emergency, call 911.",
                "Thank you for being part of our community,",
                "The VolunteerConnect Saskatchewan Team",
            ];

        var visible = lines.Where(line => line.Length > 0).ToList();
        string text = string.Join("\n\n", visible);
        string html = "<div style=\"font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1d1d20\">"
            + string.Concat(visible.Select(line => $"<p>{WebUtility.HtmlEncode(line)}</p>"))
            + "</div>";
        return new OutgoingEmail(subject, html, text);
    }
}
