import { useSite } from '../lib/store.jsx';

// Reference entry; used until the CMS has at least one experience row.
const FALLBACK = [
  {
    company: 'Kanchize Design Studio',
    role: 'Graphic Design Intern',
    summary: 'worked on branding, visual communication and design deliverables.',
    timeline: '2025',
    mode: 'Internship',
    responsibilities:
      'Created visual identities and brand communication assets across design projects.\nWorked on branding, publication design, typography, packaging and digital sketching.\nCollaborated with the team to develop design deliverables for both digital and print media.',
  },
];

export default function AboutExperience() {
  const { settings } = useSite();
  const rows = Array.isArray(settings.experience) ? settings.experience : [];
  const items = rows.length ? rows : FALLBACK;

  return (
    <section className="about-exp" aria-label="Experience">
      {items.map((e, i) => {
        const duties = String(e.responsibilities || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

        return (
          <article className="exp-entry" key={`${e.company || 'role'}-${i}`}>
            <div className="exp-left">
              <h2 className="exp-company">{e.company}</h2>
              <p className="exp-summary">
                {e.role}
                {e.summary ? ` - ${e.summary}` : ''}
              </p>
              <dl className="exp-meta">
                <div>
                  <dt>Role</dt>
                  <dd>{e.role}</dd>
                </div>
                <div>
                  <dt>Company</dt>
                  <dd>{e.company}</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>{e.timeline}</dd>
                </div>
                <div>
                  <dt>Work Mode</dt>
                  <dd>{e.mode}</dd>
                </div>
              </dl>
            </div>
            {duties.length > 0 && (
              <div className="exp-right">
                <p className="exp-resp-label">Responsibilities</p>
                <ul className="exp-resp">
                  {duties.map((line, k) => (
                    <li key={k}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
