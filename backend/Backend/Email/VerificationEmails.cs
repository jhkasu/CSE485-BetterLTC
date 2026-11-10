using System.Net;

namespace Backend.Email;

public static class VerificationEmails {
    public static OutgoingEmail Link(string link, bool french) {
        string subject = french ? "Confirmez votre adresse courriel" : "Confirm your email address";
        string[] before = french
            ? [
                "Bonjour,",
                "Merci de vous être inscrit à VolunteerConnect Saskatchewan. Utilisez le lien ci-dessous pour confirmer votre adresse courriel. Le lien fonctionne une seule fois et expire dans 24 heures.",
            ]
            : [
                "Hi,",
                "Thank you for signing up for VolunteerConnect Saskatchewan. Use the link below to confirm your email address. The link works once and expires in 24 hours.",
            ];
        string button = french ? "Confirmer mon courriel" : "Confirm my email";
        string[] after = french
            ? [
                "Si vous n'avez pas créé de compte, vous pouvez ignorer ce courriel.",
                "L'équipe VolunteerConnect Saskatchewan",
            ]
            : [
                "If you did not create an account, you can ignore this email.",
                "The VolunteerConnect Saskatchewan Team",
            ];

        string text = string.Join("\n\n", before) + $"\n\n{link}\n\n" + string.Join("\n\n", after);
        string html = "<div style=\"font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1d1d20\">"
            + Paragraphs(before)
            + $"<p><a href=\"{WebUtility.HtmlEncode(link)}\" style=\"display:inline-block;background:#0f9d58;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold\">{WebUtility.HtmlEncode(button)}</a></p>"
            + $"<p style=\"font-size:14px;color:#555555;word-break:break-all\">{WebUtility.HtmlEncode(link)}</p>"
            + Paragraphs(after)
            + "</div>";
        return new OutgoingEmail(subject, html, text);
    }

    private static string Paragraphs(IEnumerable<string> lines) {
        return string.Concat(lines.Select(line => $"<p>{WebUtility.HtmlEncode(line)}</p>"));
    }
}
