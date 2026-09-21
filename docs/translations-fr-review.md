# French translation review list

The French file is `frontend/public/locales/fr/translation.json`. It uses Canadian French conventions:
`courriel` for email, `téléverser` for upload, `organisme` for a non-profit organization, `aînés` / `personnes aînées` for seniors,
`ouvrir une session` for sign in, guillemets « » for quotes, and no space before `?` and `!`.

The keys below need a fluent speaker or the client to confirm them before launch. Everything else is routine interface text.

## Needs client approval (official wording of the organization)

| Key | Why |
|---|---|
| `mission.missionHeadline` | Official mission statement. The client may already have an approved French version. |
| `mission.missionBody` | Same. Three paragraphs. "asset-based approach" was translated as "approche fondée sur les forces". |
| `mission.visionTagline` | Official vision statement. |
| `mission.visionBody` | Same. "care partners" was translated as "partenaires de soins". "caring with older adults" keeps the "with" on purpose ("avec les personnes aînées"). |
| `footer.tagline` | Brand tagline. "care" was translated as "entraide" (mutual help) instead of "soins" (medical care). |

## Slogans and idioms (a literal translation does not work)

| Key | English | French used | Note |
|---|---|---|---|
| `home.hero.heading` | Care. Connect. Community. | Soigner. Relier. Rassembler. | Three verbs to keep the rhythm. Alternative: "Entraide. Liens. Communauté." |
| `about.heading` | Neighbours looking after neighbours | Des voisins qui veillent les uns sur les autres | |
| `home.hero.lead` | ...from neighbours who care | ...offerte par des voisins qui ont leur bien-être à cœur | |
| `home.pillars.community.text` | people who show up for each other | gens qui sont là les uns pour les autres | |
| `about.history.title` | How we got here | Notre parcours | |
| `about.mission.title` | Why we exist | Notre raison d'être | |

## Word choices to confirm

| Key | French used | Question |
|---|---|---|
| `nav.volunteer` | Bénévolat | The menu item is the activity ("Bénévolat"), the homepage card is the people ("Bénévoles"). Confirm this split is wanted. |
| `nav.ourWork`, `ourWork.*` | Nos réalisations | Alternative: "Notre travail". |
| `*.opportunities`, `volunteer.*` | occasion(s) | "Occasion de bénévolat" is the Canadian term. France would say "opportunité", which is avoided here. |
| `dashboard.nav.shifts` | Quarts à venir | "Quart" is the Quebec and Canadian workplace term for a shift. Alternative: "Périodes de bénévolat". |
| `getHelp.expect.item1` | Une coordonnatrice ou un coordonnateur | Written with both genders. Shorten if the client prefers one form. |
| `options.listingStatus.oneTime` | Ponctuelle | Feminine because it describes "une occasion". |
| `options.applicationStatus.*`, `dashboard.bgCheck.approved` | Approuvée / Refusée | Feminine because they describe "une candidature" / "une vérification". |
| `adminDashboard.organizations.contact` | Personne-ressource | Standard Canadian term for a contact person. |
| `auth.errors.lettersOnly` | lettres de l'alphabet anglais | The form currently rejects accented letters, which will block many French names (é, è, ç). This is a product issue, not only a wording issue. |

## Not translated on purpose

- `VolunteerConnect Saskatchewan` and `BetterLTC` are names.
- City names stay as they are.
- Listing titles, descriptions, team bios, and Our Work posts come from the database. They appear in whatever language they were typed in.
