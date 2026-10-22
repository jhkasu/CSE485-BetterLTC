using System.Net;
using System.Text.RegularExpressions;

namespace Backend.Email;

public static class OrganizationEmails {
    public static OutgoingEmail Approved(string contactName, string orgName) {
        string[] english = [
            $"Hi {contactName},",
            $"Good news: {orgName} has been approved on VolunteerConnect Saskatchewan and now appears in the organization directory.",
            "Sign in to complete your profile and list the volunteer roles you need. Volunteers can then contact you from your page.",
            "The VolunteerConnect Saskatchewan Team",
        ];
        string[] french = [
            $"Bonjour {contactName},",
            $"Bonne nouvelle : {orgName} a été approuvé sur VolunteerConnect Saskatchewan et figure maintenant dans le répertoire des organismes.",
            "Connectez-vous pour compléter votre profil et indiquer les rôles bénévoles dont vous avez besoin. Les bénévoles pourront ensuite vous écrire à partir de votre page.",
            "L'équipe VolunteerConnect Saskatchewan",
        ];
        return Build($"{orgName} is approved / {orgName} est approuvé", english, french);
    }

    public static OutgoingEmail Rejected(string contactName, string orgName, string reason) {
        string[] english = [
            $"Hi {contactName},",
            $"We could not approve {orgName} on VolunteerConnect Saskatchewan yet.",
            $"Reason: {reason}",
            "Sign in to check your registration number and send it again for review.",
            "The VolunteerConnect Saskatchewan Team",
        ];
        string[] french = [
            $"Bonjour {contactName},",
            $"Nous n'avons pas encore pu approuver {orgName} sur VolunteerConnect Saskatchewan.",
            $"Raison : {reason}",
            "Connectez-vous pour vérifier votre numéro d'enregistrement et le soumettre de nouveau.",
            "L'équipe VolunteerConnect Saskatchewan",
        ];
        return Build($"{orgName} needs another look / {orgName} doit être revu", english, french);
    }

    private static OutgoingEmail Build(string subject, string[] english, string[] french) {
        string text = string.Join("\n\n", english) + "\n\n---\n\n" + string.Join("\n\n", french);
        string html = "<div style=\"font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1d1d20\">"
            + Paragraphs(english)
            + "<hr style=\"border:none;border-top:1px solid #ddd;margin:24px 0\">"
            + Paragraphs(french)
            + "</div>";
        return new OutgoingEmail(Regex.Replace(subject, @"\s+", " "), html, text);
    }

    private static string Paragraphs(IEnumerable<string> lines) {
        return string.Concat(lines.Select(line => $"<p style=\"white-space:pre-line\">{WebUtility.HtmlEncode(line)}</p>"));
    }
}
