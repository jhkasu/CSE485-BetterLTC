using Backend.Models;

namespace Backend.Files;

public static class StarterFaqs {
    public const string MigrationName = "AddFaqs";

    private static readonly (string Topic, string QuestionEn, string AnswerEn, string QuestionFr, string AnswerFr)[] Items = [
        ("GettingStarted",
            "How do I start volunteering?",
            "Browse the organization directory and find an organization whose work and area fit you. Then contact them using the details on their profile page. Each organization handles its own volunteer sign-up.",
            "Comment commencer à faire du bénévolat?",
            "Parcourez le répertoire des organismes et trouvez-en un dont le travail et la région vous conviennent. Communiquez ensuite avec lui à l'aide des coordonnées sur sa page de profil. Chaque organisme gère sa propre inscription des bénévoles."),
        ("GettingStarted",
            "Do I need an account?",
            "No. You can browse organizations and download resources without an account. An account lets you save your interests, area, and availability.",
            "Ai-je besoin d'un compte?",
            "Non. Vous pouvez parcourir les organismes et télécharger les ressources sans compte. Un compte vous permet d'enregistrer vos intérêts, votre région et vos disponibilités."),
        ("GettingStarted",
            "Is there a minimum age to volunteer?",
            "Each organization sets its own age requirements, and they depend on the role. Many organizations welcome youth volunteers with a parent's permission. Ask the organization before you apply.",
            "Y a-t-il un âge minimum pour faire du bénévolat?",
            "Chaque organisme fixe ses propres exigences d'âge, selon le rôle. Beaucoup d'organismes accueillent les jeunes bénévoles avec la permission d'un parent. Renseignez-vous auprès de l'organisme avant de postuler."),
        ("BackgroundChecks",
            "Will I need a criminal record check?",
            "Many roles that involve older adults or other vulnerable people require a criminal record check, and some require a Vulnerable Sector Check. The organization will tell you which check is needed.",
            "Aurai-je besoin d'une vérification du casier judiciaire?",
            "Beaucoup de rôles auprès des aînés ou d'autres personnes vulnérables exigent une vérification du casier judiciaire, et certains exigent une vérification des antécédents en vue d'un travail auprès de personnes vulnérables. L'organisme vous dira quelle vérification est nécessaire."),
        ("BackgroundChecks",
            "Where do I get a check, and who pays for it?",
            "Checks are usually requested through your local police service or RCMP detachment. Some organizations cover the cost or give you a letter that lowers the fee for volunteers. Ask the organization before you apply.",
            "Où obtenir une vérification, et qui la paie?",
            "Les vérifications se demandent habituellement auprès du service de police local ou du détachement de la GRC. Certains organismes paient les frais ou vous remettent une lettre qui les réduit pour les bénévoles. Renseignez-vous auprès de l'organisme avant de postuler."),
        ("Insurance",
            "Am I covered by insurance while volunteering?",
            "Insurance is arranged by each organization, not by this hub. Ask the organization whether its insurance covers volunteers and which activities are included.",
            "Suis-je assuré pendant mon bénévolat?",
            "L'assurance relève de chaque organisme, et non de ce carrefour. Demandez à l'organisme si son assurance couvre les bénévoles et quelles activités sont incluses."),
        ("Insurance",
            "Can I drive someone in my own car?",
            "Only if the organization's role allows it. Driving roles usually need a valid licence, a clean driving record, and proof of your own vehicle insurance. Check with the organization first.",
            "Puis-je conduire quelqu'un dans ma propre voiture?",
            "Seulement si le rôle offert par l'organisme le permet. Les rôles de conduite exigent habituellement un permis valide, un bon dossier de conduite et une preuve d'assurance de votre véhicule. Vérifiez d'abord auprès de l'organisme."),
        ("Training",
            "Will I get training?",
            "Most organizations give an orientation before your first shift. Some roles, such as supporting people living with dementia, may need extra training.",
            "Vais-je recevoir une formation?",
            "La plupart des organismes offrent une séance d'orientation avant votre premier quart. Certains rôles, comme l'accompagnement de personnes atteintes de démence, peuvent exiger une formation supplémentaire."),
        ("Training",
            "Are there tools to help organizations train volunteers?",
            "Yes. The Resources page has free templates for onboarding, check-ins, and recognition that you can download and adapt.",
            "Y a-t-il des outils pour aider les organismes à former les bénévoles?",
            "Oui. La page Ressources offre des modèles gratuits pour l'accueil, les rencontres de suivi et la reconnaissance, à télécharger et à adapter."),
    ];

    public static void Seed(AppDbContext db) {
        var now = DateTime.UtcNow;
        var order = new Dictionary<string, int>();
        foreach (var item in Items) {
            order[item.Topic] = order.GetValueOrDefault(item.Topic) + 1;
            db.FaqItems.Add(new FaqItem {
                Topic = item.Topic,
                QuestionEn = item.QuestionEn,
                AnswerEn = item.AnswerEn,
                QuestionFr = item.QuestionFr,
                AnswerFr = item.AnswerFr,
                SortOrder = order[item.Topic],
                UpdatedAt = now,
            });
        }
        db.SaveChanges();
    }
}
