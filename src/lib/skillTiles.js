// Shared defaults and cleanup for CMS-managed skill app tiles.
const APP_DEFAULTS = [
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

export const DEFAULT_SKILL_TILES = APP_DEFAULTS.map((app, index) => ({
  key: `default-skill-${index}`,
  code: app.code,
  label: app.label,
  iconUrl: '',
  iconPublicId: null,
}));

export const createSkillTile = (label = 'New app', code = '') => ({
  key: `tile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
  code: String(code || '').trim().slice(0, 4),
  label: String(label || '').trim(),
  iconUrl: '',
  iconPublicId: null,
});

export const safeIconUrl = (url) => {
  const value = String(url || '').trim();
  return /^https:\/\/[^\s"'()<>]+$/i.test(value) ? value : '';
};

const fallbackInitials = (label) => {
  const words = String(label || '').trim().match(/[A-Za-z0-9]+/g);
  if (!words?.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const skillTileMark = (tile = {}) => String(tile.code || '').trim() || fallbackInitials(tile.label);
export const skillTileLabel = (tile = {}) => String(tile.label || tile.code || '').trim() || 'Skill app';

const sanitizeTile = (tile = {}, index = 0) => ({
  key: String(tile.key || `tile-${index}`),
  code: String(tile.code || '').trim().slice(0, 4),
  label: String(tile.label || '').trim().slice(0, 120),
  iconUrl: safeIconUrl(tile.iconUrl),
  iconPublicId: tile.iconPublicId ? String(tile.iconPublicId) : null,
});

export const cleanSkillTiles = (tiles) => {
  if (!Array.isArray(tiles)) return [];
  return tiles
    .map(sanitizeTile)
    .filter((tile) => tile.label || tile.code || tile.iconUrl);
};

// `tiles: null`/`undefined` means “use the nine built-in apps”.
// An array, including an empty one, is the editor’s intentional list.
export const initialSkillTiles = (tiles) => {
  if (!Array.isArray(tiles)) return DEFAULT_SKILL_TILES.map((tile) => ({ ...tile }));
  return tiles.map(sanitizeTile).filter((tile) => tile.label || tile.code || tile.iconUrl);
};
