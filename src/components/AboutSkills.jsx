import { useSite } from '../lib/store.jsx';

const FALLBACK = {
  coreTools: 'Adobe Creative Suite | Blender | Figma | AI Tools',
  design:
    'Brand Identity · Visual Communication · Typography · Publication Design · Packaging · Layout & Composition · UI/UX Fundamentals · Motion Graphics · 3D Visualization',
  creative:
    'Concept Development · Visual Storytelling · Ideation · Design Research · Creative Problem-Solving · Art Direction · AI-Assisted Creative Workflows · Trend Exploration',
  professional:
    'Creative Collaboration · Client Communication · Presentation Skills · Time Management · Adaptability · Attention to Detail',
};

const APPS = [
  { code: 'Ae', label: 'Adobe After Effects' },
  { code: 'Ds', label: 'Adobe Substance 3D Designer' },
  { code: 'St', label: 'Adobe Substance 3D Stager' },
  { code: 'Lr', label: 'Adobe Lightroom' },
  { code: 'Ps', label: 'Adobe Photoshop' },
  { code: 'Ai', label: 'Adobe Illustrator' },
  { code: 'An', label: 'Adobe Animate' },
  { code: 'Id', label: 'Adobe InDesign' },
  { code: 'Pr', label: 'Adobe Premiere Pro' },
];

function AppMark({ code }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontFamily="Archivo, Arial, sans-serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="-.055em"
        fill="currentColor"
      >
        {code}
      </text>
    </svg>
  );
}

export default function AboutSkills() {
  const { settings } = useSite();
  const s = settings.skills || {};
  const coreTools = (s.coreTools || FALLBACK.coreTools).trim();
  const design = (s.design || FALLBACK.design).trim();
  const creative = (s.creative || FALLBACK.creative).trim();
  const professional = (s.professional || FALLBACK.professional).trim();

  return (
    <section className="about-skills" aria-label="Skills">
      <div className="about-skills-inner">
        <div className="about-skills-grid">
          <div className="skills-left">
            <h2 className="skills-title">Skills</h2>
            <p className="skills-core">
              <b>Core Tool - </b>
              {coreTools}
            </p>
            <div className="skill-tiles">
              {APPS.map((app) => (
                <span
                  className="skill-tile"
                  key={app.code}
                  role="img"
                  aria-label={app.label}
                  title={app.label}
                >
                  <AppMark code={app.code} />
                </span>
              ))}
            </div>
          </div>
          <div className="skills-groups">
            <p>
              <b>Design:</b> {design}
            </p>
            <p>
              <b>Creative:</b> {creative}
            </p>
            <p>
              <b>Professional:</b> {professional}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
