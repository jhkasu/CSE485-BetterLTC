import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import CITIES from './saskatchewanCities';
import usePageTitle from './usePageTitle';
import './FindYourFit.css';

// The offline demo suggests broad volunteer role types, NOT live job openings.
// This is intentionally separate from the backend's approved organization directory.
export const ROLE_TYPES = [
 {id:'companion',name:'Conversation & companionship',fr:'Conversation et compagnie',cause:'seniors',skill:'listening',hours:2,locations:['in-person','remote'],low:true,gen:true,description:'Share conversation, stories, or patient help with everyday technology. Ask about friendly visiting and telephone companionship.',descriptionFr:'Partagez des conversations, des histoires ou une aide patiente avec la technologie. Renseignez-vous sur les visites amicales et les appels de compagnie.'},
 {id:'mentor',name:'Learning & mentorship',fr:'Apprentissage et mentorat',cause:'youth',skill:'teaching',hours:2,locations:['in-person','remote'],low:true,gen:true,description:'Encourage a learner through reading, homework support, or career conversations. Agree on a regular schedule and clear boundaries.',descriptionFr:'Encouragez une personne par la lecture, le soutien scolaire ou des échanges sur les carrières. Convenez d’un horaire et de limites claires.'},
 {id:'garden',name:'Community gardening',fr:'Jardinage communautaire',cause:'environment',skill:'gardening',hours:3,locations:['in-person'],low:false,gen:true,description:'Help neighbours grow together through garden care and seed sharing. Ask about seasonal commitments and adapted tasks.',descriptionFr:'Aidez vos voisins à cultiver ensemble et à échanger des semences. Renseignez-vous sur les engagements saisonniers et les tâches adaptées.'},
 {id:'welcome',name:'Welcome & community support',fr:'Accueil et soutien communautaire',cause:'health',skill:'organizing',hours:4,locations:['in-person'],low:true,gen:false,description:'Welcome visitors, organize information, or support a community program. Seated tasks may be available; confirm training with the organization.',descriptionFr:'Accueillez les visiteurs, organisez l’information ou soutenez un programme. Des tâches assises peuvent être possibles; confirmez la formation requise.'},
 {id:'digital',name:'Skills-based digital support',fr:'Soutien numérique',cause:'community',skill:'technology',hours:1,locations:['remote'],low:true,gen:true,description:'Share technology or communication skills from home. Help a community group with a newsletter, website, or digital mentoring.',descriptionFr:'Partagez vos compétences technologiques depuis chez vous. Aidez un organisme avec un bulletin, un site Web ou du mentorat numérique.'},
 {id:'events',name:'Community programs & events',fr:'Programmes et événements communautaires',cause:'community',skill:'organizing',hours:3,locations:['in-person'],low:false,gen:true,description:'Bring people together through shared meals and community activities. Ask about occasional events and the physical requirements of tasks.',descriptionFr:'Rassemblez les gens autour de repas et d’activités. Renseignez-vous sur les événements ponctuels et les exigences physiques.'}
];

export function matchRoles(preferences) {
  return ROLE_TYPES
    .filter(role => role.hours <= Number(preferences.hours))
    .filter(role => !preferences.low || role.low)
    .filter(role => preferences.location === 'either' || role.locations.includes(preferences.location))
    .map(role => ({
      ...role,
      score:
        (role.cause === preferences.cause ? 2 : 0) +
        (role.skill === preferences.skill ? 2 : 0) +
        (preferences.generations && role.gen ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

// Link the quiz to REAL organizations already approved in the website directory.
// Category and city are only browse filters; individual role availability is
// never assumed based on an organization's general categories.
const CAUSE_TO_ORG_CATEGORY = {
  seniors: 'Seniors Services',
  youth: 'Youth',
  environment: 'Environment',
  health: 'Health',
  community: 'Community Services',
};

export function matchingDirectoryUrl(preferences) {
  const query = new URLSearchParams();
  const category = CAUSE_TO_ORG_CATEGORY[preferences.cause];
  if (category) query.append('category', category);

  const city = String(preferences.city || '').trim();
  const listedCity = CITIES.find(name => name.toLowerCase() === city.toLowerCase());
  if (listedCity && listedCity !== 'Other') query.append('area', listedCity);
  if (preferences.generations) query.append('intergenerational', 'true');

  return query.toString() ? `/organizations?${query.toString()}` : '/organizations';
}

const CAUSES = [
  ['seniors', 'Seniors’ services', 'Services aux aînés'],
  ['youth', 'Youth', 'Jeunesse'],
  ['environment', 'Environment', 'Environnement'],
  ['health', 'Health', 'Santé'],
  ['community', 'Community', 'Communauté'],
];
const SKILLS = [
  ['listening', 'Listening & conversation', 'Écoute et conversation'],
  ['teaching', 'Teaching & mentoring', 'Enseignement et mentorat'],
  ['gardening', 'Gardening & practical skills', 'Jardinage et compétences pratiques'],
  ['organizing', 'Organizing & welcoming', 'Organisation et accueil'],
  ['technology', 'Technology & communication', 'Technologie et communication'],
];

export default function FindYourFit() {
  const { i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  const tr = (en, french) => fr ? french : en;
  usePageTitle(tr('Find Your Fit', 'Trouvez votre place'));

  const [results, setResults] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (results !== null) resultsRef.current?.focus();
  }, [results]);

  function submit(event) {
    event.preventDefault();
    const answers = Object.fromEntries(new FormData(event.currentTarget));
    setPreferences(answers);
    setResults(matchRoles(answers));
  }

  function reset() {
    setResults(null);
    setPreferences(null);
  }

  return (
    <>
      <Navbar />
      <header className="band-header">
        <div className="band-header-inner container">
          <span className="eyebrow">{tr('A place for your time and talents', 'Une place pour votre temps et vos talents')}</span>
          <h1>{tr('Find Your Fit', 'Trouvez votre place')}</h1>
          <p>{tr(
            'Tell us what matters to you. Discover volunteer role types that fit your interests, skills, and availability.',
            'Dites-nous ce qui compte pour vous. Découvrez des types de rôles adaptés à vos intérêts, compétences et disponibilités.'
          )}</p>
        </div>
      </header>

      <main className="fit-page container">
        <div className="fit-layout">
          <form className="fit-form" onSubmit={submit} onReset={reset}>
            <h2>{tr('Start with you', 'Commençons par vous')}</h2>

            <label htmlFor="fit-cause">{tr('1. What cause interests you?', '1. Quelle cause vous intéresse ?')}</label>
            <select id="fit-cause" name="cause" required defaultValue="">
              <option value="">{tr('Choose a cause', 'Choisissez une cause')}</option>
              {CAUSES.map(([value, en, french]) => <option value={value} key={value}>{tr(en, french)}</option>)}
            </select>

            <label htmlFor="fit-skill">{tr('2. What would you like to share?', '2. Que souhaitez-vous partager ?')}</label>
            <select id="fit-skill" name="skill" required defaultValue="">
              <option value="">{tr('Choose a skill', 'Choisissez une compétence')}</option>
              {SKILLS.map(([value, en, french]) => <option value={value} key={value}>{tr(en, french)}</option>)}
            </select>

            <label htmlFor="fit-hours">{tr('3. How much time can you offer each week?', '3. Combien de temps pouvez-vous offrir chaque semaine ?')}</label>
            <select id="fit-hours" name="hours" required defaultValue="">
              <option value="">{tr('Choose your availability', 'Choisissez vos disponibilités')}</option>
              <option value="1">{tr('Up to 1 hour', 'Jusqu’à 1 heure')}</option>
              <option value="2">{tr('Up to 2 hours', 'Jusqu’à 2 heures')}</option>
              <option value="4">{tr('Up to 4 hours or more', 'Jusqu’à 4 heures ou plus')}</option>
            </select>

            <label htmlFor="fit-city">{tr('4. Where in Saskatchewan?', '4. Où en Saskatchewan ?')}</label>
            <input id="fit-city" name="city" list="fit-cities" placeholder={tr('City or community (optional)', 'Ville ou communauté (facultatif)')} maxLength="100" />
            <datalist id="fit-cities">
              {CITIES.filter(city => city !== 'Other').map(city => <option key={city} value={city} />)}
            </datalist>

            <label htmlFor="fit-location">{tr('How would you prefer to participate?', 'Comment souhaitez-vous participer ?')}</label>
            <select id="fit-location" name="location" defaultValue="either">
              <option value="either">{tr('In person or remotely', 'En personne ou à distance')}</option>
              <option value="in-person">{tr('In person', 'En personne')}</option>
              <option value="remote">{tr('Remotely', 'À distance')}</option>
            </select>

            <label className="fit-check">
              <input type="checkbox" name="generations" />
              {tr('I’d like to connect across generations', 'J’aimerais créer des liens entre les générations')}
            </label>
            <label className="fit-check">
              <input type="checkbox" name="low" />
              {tr('I prefer lower physical demand', 'Je préfère des tâches moins exigeantes physiquement')}
            </label>

            <div className="fit-form-actions">
              <button className="btn btn-primary" type="submit">{tr('Show my matches', 'Voir mes suggestions')} →</button>
              <button className="btn fit-reset" type="reset">{tr('Start over', 'Recommencer')}</button>
            </div>
          </form>

          <section className="fit-results" aria-live="polite" ref={resultsRef} tabIndex={-1}>
            {results === null ? (
              <>
                <h2>{tr('A small step toward something meaningful.', 'Un petit pas vers une contribution enrichissante.')}</h2>
                <p>{tr('No account or contact details needed. Your answers stay in this page and are not saved.', 'Aucun compte ni coordonnées nécessaires. Vos réponses restent sur cette page et ne sont pas enregistrées.')}</p>
                <ol>
                  <li>{tr('Share your interests and availability.', 'Indiquez vos intérêts et disponibilités.')}</li>
                  <li>{tr('Explore a few suggested role types.', 'Explorez quelques types de rôles suggérés.')}</li>
                  <li>{tr('Ask an organization about opportunities in your community.', 'Renseignez-vous auprès d’un organisme de votre communauté.')}</li>
                </ol>
                <div className="fit-note">{tr(
                  'Guidance, not live vacancies. The organization confirms local availability, screening, training, and access arrangements.',
                  'Il s’agit de conseils, et non de postes disponibles. L’organisme confirme la disponibilité locale, la sélection, la formation et les adaptations.'
                )}</div>
              </>
            ) : (
              <>
                <h2>{tr('Your suggested starting points', 'Vos pistes de départ')}</h2>
                <p>{tr(
                  'Suggestions prioritize your time and participation preferences, then your cause, skills, and interest in connecting generations. Organizations shown in the directory are separate from these role-type suggestions.',
                  'Les suggestions tiennent compte de votre temps et mode de participation, puis de vos intérêts et compétences. Les organismes de l’annuaire sont distincts de ces suggestions de rôles.'
                )}</p>
                {results.length > 0 ? results.map(role => (
                  <article className="fit-result-card" key={role.id}>
                    <span className="eyebrow">{tr('Suggested role type', 'Type de rôle suggéré')}</span>
                    <h3>{fr ? role.fr : role.name}</h3>
                    <p>{fr ? role.descriptionFr : role.description}</p>
                    <p className="fit-meta">
                      {tr(`Around ${role.hours} hour${role.hours > 1 ? 's' : ''} / week`, `Environ ${role.hours} heure${role.hours > 1 ? 's' : ''} / semaine`)}
                      {' · '}
                      {role.locations.map(location => location === 'remote' ? tr('Remote', 'À distance') : tr('In person', 'En personne')).join(' / ')}
                    </p>
                    {role.gen && <span className="fit-badge">{tr('Across generations', 'Entre générations')}</span>}
                  </article>
                )) : (
                  <div className="fit-note">{tr(
                    'No role types meet those constraints. Try allowing more time or remote participation.',
                    'Aucun rôle ne correspond à ces critères. Essayez plus de temps ou la participation à distance.'
                  )}</div>
                )}

                <div className="fit-result-actions">
                  <Link className="btn btn-dark" to={matchingDirectoryUrl(preferences || {})}>
                    {tr('Find organizations in the directory', 'Trouver des organismes dans l’annuaire')} →
                  </Link>
                  <Link className="fit-all-link" to="/organizations">
                    {tr('Browse all organizations', 'Explorer tous les organismes')}
                  </Link>
                </div>
                <p className="fit-results-disclaimer">{tr(
                  'Directory filters use your cause, recognized city, and intergenerational preference. Each approved organization confirms its own current roles and availability.',
                  'Les filtres de l’annuaire utilisent votre domaine d’intérêt, une ville reconnue et votre préférence intergénérationnelle. Chaque organisme approuvé confirme ses rôles et disponibilités.'
                )}</p>
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
