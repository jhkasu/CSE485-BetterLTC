using System.Net;

namespace Backend.Email;

public record VolunteerInterest(string Name, string Email, string Phone, string RoleTitle, string Message, bool French);

public static class InterestEmails {
    public static OutgoingEmail ToOrganization(string orgName, VolunteerInterest interest) {
        string subject = $"New volunteer interest: {interest.Name} / Nouvel intérêt d'un bénévole";
        string[] english = [
            $"Hi {orgName},",
            $"{interest.Name} is interested in volunteering with your organization and contacted you through VolunteerConnect Saskatchewan.",
            $"Role: {(interest.RoleTitle.Length > 0 ? interest.RoleTitle : "Any role")}",
            $"Email: {interest.Email}",
            interest.Phone.Length > 0 ? $"Phone: {interest.Phone}" : "",
            $"Preferred language: {(interest.French ? "French" : "English")}",
            interest.Message.Length > 0 ? $"Message: {interest.Message}" : "",
            $"Reply to this email to contact {interest.Name} directly.",
            "The VolunteerConnect Saskatchewan Team",
        ];
        string[] french = [
            $"Bonjour {orgName},",
            $"{interest.Name} souhaite faire du bénévolat avec votre organisme et vous a écrit par l'intermédiaire de VolunteerConnect Saskatchewan.",
            $"Rôle : {(interest.RoleTitle.Length > 0 ? interest.RoleTitle : "Tout rôle")}",
            $"Courriel : {interest.Email}",
            interest.Phone.Length > 0 ? $"Téléphone : {interest.Phone}" : "",
            $"Langue préférée : {(interest.French ? "français" : "anglais")}",
            interest.Message.Length > 0 ? $"Message : {interest.Message}" : "",
            $"Répondez à ce courriel pour communiquer directement avec {interest.Name}.",
            "L'équipe VolunteerConnect Saskatchewan",
        ];

        var englishLines = english.Where(line => line.Length > 0).ToList();
        var frenchLines = french.Where(line => line.Length > 0).ToList();
        string text = string.Join("\n\n", englishLines) + "\n\n---\n\n" + string.Join("\n\n", frenchLines);
        string html = "<div style=\"font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1d1d20\">"
            + Paragraphs(englishLines)
            + "<hr style=\"border:none;border-top:1px solid #ddd;margin:24px 0\">"
            + Paragraphs(frenchLines)
            + "</div>";
        return new OutgoingEmail(subject, html, text, interest.Email);
    }

    private static string Paragraphs(IEnumerable<string> lines) {
        return string.Concat(lines.Select(line => $"<p style=\"white-space:pre-line\">{WebUtility.HtmlEncode(line)}</p>"));
    }
}
