import { useSite } from '../lib/store.jsx';
import { initialSkillTiles, skillTileLabel, skillTileMark } from '../lib/skillTiles.js';

const FALLBACK = {
  coreTools: 'Adobe Creative Suite | Blender | Figma | AI Tools',
  design:
    'Brand Identity · Visual Communication · Typography · Publication Design · Packaging · Layout & Composition · UI/UX Fundamentals · Motion Graphics · 3D Visualization',
  creative:
    'Concept Development · Visual Storytelling · Ideation · Design Research · Creative Problem-Solving · Art Direction · AI-Assisted Creative Workflows · Trend Exploration',
  professional:
    'Creative Collaboration · Client Communication · Presentation Skills · Time Management · Adaptability · Attention to Detail',
};

function AppMark({ mark }) {
  return (
    <svg className="skill-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
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
        {mark}
      </text>
    </svg>
  );
}

function SkillIcon({ tile }) {
  if (tile.iconUrl) {
    return <img className="skill-logo" src={tile.iconUrl} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />;
  }
  return <AppMark mark={skillTileMark(tile)} />;
}

function SkillTile({ tile }) {
  const label = skillTileLabel(tile);
  return (
    <span
      className="skill-tile"
      role="img"
      aria-label={label}
      title={label}
    >
      <SkillIcon tile={tile} />
    </span>
  );
}

function SkillTileSet({ tiles, clone = false }) {
  return (
    <div className="skill-set" aria-hidden={clone || undefined}>
      {tiles.map((tile) => (
        <SkillTile key={clone ? `${tile.key}-clone` : tile.key} tile={tile} />
      ))}
    </div>
  );
}

export default function AboutSkills() {
  const { settings } = useSite();
  const s = settings.skills || {};
  const coreTools = (s.coreTools || FALLBACK.coreTools).trim();
  const design = (s.design || FALLBACK.design).trim();
  const creative = (s.creative || FALLBACK.creative).trim();
  const professional = (s.professional || FALLBACK.professional).trim();
  const tiles = initialSkillTiles(s.tiles);
  const marqueeStyle = { '--marquee-duration': `${Math.max(28, tiles.length * 4)}s` };

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
            {tiles.length > 0 && (
              <div className="skill-marquee" style={marqueeStyle}>
                <div className="skill-track">
                  <SkillTileSet tiles={tiles} />
                  {tiles.length > 1 && <SkillTileSet tiles={tiles} clone />}
                </div>
              </div>
            )}
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

