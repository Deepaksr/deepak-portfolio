import { useSite } from '../lib/store.jsx';

// Copy shown when the CMS fields are empty, so the page always renders the
// reference layout. Everything here can be overridden in CMS → About.
const FALLBACK = {
  name: 'DEEPAK ROSHAN',
  intro:
    "A Communication Designer who loves telling stories through visuals. I enjoy creating designs inspired by everyday moments and objects around me. I'm passionate about turning ideas into eye-catching graphics that help brands connect better with people.",
  role: 'Communication Designer',
  country: 'Mumbai, Maharashtra, India',
  experience: 'Graphic Design, Branding & Visual Communication',
  workMode: 'Open to opportunities',
};

function ArrowDownRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M1 1l14 14M15 6v9H6" />
    </svg>
  );
}

export default function AboutIntro() {
  const { settings } = useSite();
  const a = settings.about || {};
  const name = (a.name || FALLBACK.name).trim();
  const intro = (a.intro || FALLBACK.intro).trim();
  const role = (a.role || FALLBACK.role).trim();
  const country = (a.country || FALLBACK.country).trim();
  const experience = (a.experience || FALLBACK.experience).trim();
  const workMode = (a.workMode || FALLBACK.workMode).trim();
  const resume = (a.resumeUrl || '').trim();

  return (
    <section className="about-intro">
      <div className="about-intro-head">
        <p className="about-eyebrow">HI THIS IS</p>
        <h1 className="about-name">{name}</h1>
      </div>
      <div className="about-intro-grid">
        <div className="about-intro-left">
          <p className="about-copy">{intro}</p>
          {resume ? (
            <a className="resume-btn" href={resume} target="_blank" rel="noreferrer">
              <span>Download the resume</span>
              <ArrowDownRight />
            </a>
          ) : (
            <span className="resume-btn is-disabled" aria-disabled="true" title="Add a resume link in the CMS">
              <span>Download the resume</span>
              <ArrowDownRight />
            </span>
          )}
        </div>
        <dl className="about-facts">
          <div className="about-fact">
            <dt>Role</dt>
            <dd>{role}</dd>
          </div>
          <div className="about-fact">
            <dt>Country</dt>
            <dd>{country}</dd>
          </div>
          <div className="about-fact">
            <dt>Experience</dt>
            <dd>{experience}</dd>
          </div>
          <div className="about-fact">
            <dt>Work Mode</dt>
            <dd>{workMode}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
