using System.Net;

namespace Backend.Email;

public static class PasswordResetEmails {
    public static OutgoingEmail Link(string link, bool french) {
        string subject = french ? "Réinitialiser votre mot de passe" : "Reset your password";
        string[] before = french
            ? [
                "Bonjour,",
                "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte VolunteerConnect Saskatchewan. Utilisez le lien ci-dessous pour choisir un nouveau mot de passe. Le lien fonctionne une seule fois et expire dans une heure.",
            ]
            : [
                "Hi,",
                "We received a request to reset the password for your VolunteerConnect Saskatchewan account. Use the link below to choose a new password. The link works once and expires in one hour.",
            ];
        string button = french ? "Choisir un nouveau mot de passe" : "Choose a new password";
        string[] after = french
            ? [
                "Si vous n'avez pas fait cette demande, vous pouvez ignorer ce courriel. Votre mot de passe ne changera pas.",
                "L'équipe VolunteerConnect Saskatchewan",
            ]
            : [
                "If you did not ask for this, you can ignore this email. Your password will not change.",
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
