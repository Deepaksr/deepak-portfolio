import { useEffect, useMemo, useState } from 'react';
import { useSite } from '../lib/store.jsx';
import { isCloudinaryConfigured, uploadToCloudinary } from '../lib/cloudinary.js';
import {
  cleanSkillTiles,
  createSkillTile,
  initialSkillTiles,
  skillTileLabel,
  skillTileMark,
} from '../lib/skillTiles.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const muted = { color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 };
const IMG_MAX_MB = 10;
const SVG_MAX_KB = 200;
const OK_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const INFO_CAP = 12; // mosaic map has exactly 12 position slots
const ikey = () => `g-${Math.random().toString(36).slice(2, 8)}`;

export default function AboutAdmin() {
  const s = useSite();
  const [home, setHome] = useState(s.settings.home);
  const [about, setAbout] = useState(s.settings.about);
  const [expertise, setExpertise] = useState(s.settings.expertise || []);
  const [experience, setExperience] = useState(s.settings.experience || []);
  const [skills, setSkills] = useState(s.settings.skills || {});
  const [socials, setSocials] = useState(s.settings.socials || []);
  const [contactEmail, setEmail] = useState(s.settings.contactEmail || '');
  const [location, setLocation] = useState(s.settings.location || '');
  const [infoGrid, setInfoGrid] = useState(s.settings.infoGrid || []);
  const [footerImages, setFooterImages] = useState(s.settings.footerImages || []);
  const [skillTiles, setSkillTiles] = useState(() => initialSkillTiles(s.settings.skills?.tiles));
  const [tileBusy, setTileBusy] = useState('');
  const [tileErr, setTileErr] = useState('');
  const [infoBusy, setInfoBusy] = useState(false);
  const [infoErr, setInfoErr] = useState('');
  const [footBusy, setFootBusy] = useState(false);
  const [footErr, setFootErr] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);

  // Follow live data until the admin starts editing locally.
  useEffect(() => {
    if (dirty) return;
    setHome(s.settings.home);
    setAbout(s.settings.about);
    setExpertise(s.settings.expertise || []);
    setExperience(s.settings.experience || []);
    setSkills(s.settings.skills || {});
    setSkillTiles(initialSkillTiles(s.settings.skills?.tiles));
    setSocials(s.settings.socials || []);
    setEmail(s.settings.contactEmail || '');
    setLocation(s.settings.location || '');
    setInfoGrid(s.settings.infoGrid || []);
    setFooterImages(s.settings.footerImages || []);
  }, [s.settings, dirty]);

  const touch = (setter) => (v) => {
    setDirty(true);
    setSavedTick(false);
    setter(v);
  };
  const setHomeD = touch(setHome);
  const setAboutD = touch(setAbout);
  const setExpertiseD = touch(setExpertise);
  const setExperienceD = touch(setExperience);
  const setSkillsD = touch(setSkills);
  const setSocialsD = touch(setSocials);
  const setEmailD = touch(setEmail);
  const setLocationD = touch(setLocation);
  const setSkillTilesDirty = (updater) => {
    setDirty(true);
    setSavedTick(false);
    setSkillTiles((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  };

  const updateSkillTile = (index, patch) => {
    setSkillTilesDirty((prev) => prev.map((tile, i) => (i === index ? { ...tile, ...patch } : tile)));
  };
  const moveSkillTile = (index, dir) => {
    setSkillTilesDirty((prev) => {
      const j = index + dir;
      if (index < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };
  const deleteSkillTile = (index) => {
    if (!askDelete('app tile')) return;
    setSkillTilesDirty((prev) => prev.filter((_, i) => i !== index));
  };
  const addSkillTile = () => setSkillTilesDirty((prev) => [...prev, createSkillTile()]);
  const resetSkillIcon = (index) => updateSkillTile(index, { iconUrl: '', iconPublicId: null });

  const uploadSkillIcon = async (index, file) => {
    if (!file) return;
    setTileErr('');
    if (!isCloudinaryConfigured) {
      setTileErr('SVG uploads aren’t working right now. Contact your developer.');
      return;
    }
    const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name || '');
    if (!isSvg) {
      setTileErr(`${file.name || 'File'}: only SVG files, please.`);
      return;
    }
    if (file.size > SVG_MAX_KB * 1024) {
      setTileErr(`${file.name}: bigger than ${SVG_MAX_KB}KB — please use a smaller SVG.`);
      return;
    }

    setTileBusy(skillTiles[index]?.key || String(index));
    try {
      const text = await file.text();
      if (!/<svg[\s>]/i.test(text)) throw new Error('that file does not look like an SVG.');
      if (/<script\b|<foreignObject\b|\son[a-z]+\s*=/i.test(text)) {
        throw new Error('remove embedded scripts or active content, then try again.');
      }
      const uploaded = await uploadToCloudinary(file, 'deepak-roshan/skills');
      updateSkillTile(index, { iconUrl: uploaded.url, iconPublicId: uploaded.publicId || null });
    } catch (e) {
      setTileErr(`${file.name || 'SVG'}: ${e?.message || 'upload failed.'}`);
    } finally {
      setTileBusy('');
    }
  };

  const askDelete = (what) => confirm(`Remove this ${what}? This goes live when you save.`);

  // Every project photo/cover/thumbnail, deduped — the pick source for both cards.
  const library = useMemo(() => {
    const seen = new Set();
    const out = [];
    const push = (url, publicId, name) => {
      if (!url || seen.has(url)) return;
      seen.add(url);
      out.push({ url, publicId: publicId || null, name: name || '' });
    };
    (s.publishedProjects || []).forEach((p) => {
      (p.media || []).forEach((m) => {
        if (m.type !== 'video') push(m.url, m.publicId, m.name || m.caption);
      });
      if (p.cover) push(p.cover, null, '');
      if (p.thumbnail?.url) push(p.thumbnail.url, p.thumbnail.publicId, '');
    });
    return out;
  }, [s.publishedProjects]);

  const uploadInto = async (files, list, setList, setBusyF, setErrF, cap) => {
    setErrF('');
    const arr = [...(files || [])];
    if (!arr.length) return;
    if (!isCloudinaryConfigured) {
      setErrF('Photo uploads aren\u2019t working right now. Contact your developer.');
      return;
    }
    if (cap && list.length + arr.length > cap) {
      setErrF(`The grid holds max ${cap} photos. Remove one to add another.`);
      return;
    }
    setBusyF(true);
    const errs = [];
    const done = [];
    try {
      for (const f of arr) {
        if (!OK_IMAGE_TYPES.includes(f.type)) {
          errs.push(`${f.name || 'File'}: only JPG, PNG, WebP or GIF, please.`);
          continue;
        }
        if (f.size > IMG_MAX_MB * 1024 * 1024) {
          errs.push(`${f.name}: bigger than ${IMG_MAX_MB}MB — please use a smaller photo.`);
          continue;
        }
        try {
          const u = await uploadToCloudinary(f);
          done.push({ key: ikey(), url: u.url, publicId: u.publicId, name: u.originalFilename || f.name || '' });
        } catch (e) {
          errs.push(`${f.name}: ${e?.message || 'upload failed.'}`);
        }
      }
      if (done.length) {
        setDirty(true);
        setSavedTick(false);
        setList((prev) => [...prev, ...done]);
      }
    } finally {
      setBusyF(false);
      setErrF(errs.join(' '));
    }
  };

  const pickInto = (item, list, setList, cap) => {
    if (cap && list.length >= cap) return;
    if (list.some((x) => x.url === item.url)) return;
    setDirty(true);
    setSavedTick(false);
    setList((prev) => [...prev, { key: ikey(), url: item.url, publicId: item.publicId || null, name: item.name || '' }]);
  };

  const moveImg = (list, setList, i, dir) => {
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    setDirty(true);
    setSavedTick(false);
    const a = [...list];
    [a[i], a[j]] = [a[j], a[i]];
    setList(a);
  };

  const delImg = (list, setList, i, what) => {
    if (!askDelete(what)) return;
    setDirty(true);
    setSavedTick(false);
    setList(list.filter((_, k) => k !== i));
  };

  const photoRows = (list, setList, numbered) => list.map((x, i) => (
    <div key={x.key || i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0', alignItems: 'center' }}>
      <img src={x.url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8 }} loading="lazy" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{numbered ? `Position ${i + 1}` : `Photo ${i + 1}`}</div>
        <div style={{ color: 'var(--muted)', fontSize: '.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={x.name || x.url}>{x.name || 'Untitled file'}</div>
      </div>
      <button className="btn ghost" onClick={() => moveImg(list, setList, i, -1)} aria-label="Move up">↑</button>
      <button className="btn ghost" onClick={() => moveImg(list, setList, i, 1)} aria-label="Move down">↓</button>
      <button className="btn danger" onClick={() => delImg(list, setList, i, 'photo')}>✕</button>
    </div>
  ));

  const libraryBrowser = (list, setList, cap) => {
    const full = cap && list.length >= cap;
    if (!library.length) return <p style={muted}>No project photos yet — add products first, or upload below.</p>;
    return (
      <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {library.map((item) => {
          const added = list.some((x) => x.url === item.url);
          return (
            <button
              key={item.url}
              type="button"
              className="btn ghost"
              disabled={added || full}
              onClick={() => pickInto(item, list, setList, cap)}
              title={added ? 'Already added' : `Use ${item.name || 'this photo'}`}
              style={{ padding: 4, lineHeight: 0 }}
            >
              <img src={item.url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, opacity: added || full ? 0.4 : 1 }} loading="lazy" />
            </button>
          );
        })}
      </div>
    );
  };

  const save = async () => {
    if (contactEmail.trim() && !EMAIL_RE.test(contactEmail.trim())) {
      alert('That email address doesn\u2019t look right. Please check it.');
      return;
    }
    const expertiseClean = expertise
      .filter((e) => (e.title || '').trim() || (e.text || '').trim())
      .map((e, i) => ({ n: String(e.n || `${i + 1}`), title: (e.title || '').trim(), text: (e.text || '').trim() }));
    const experienceClean = experience
      .filter((e) => (e.company || '').trim() || (e.role || '').trim())
      .map((e) => ({
        company: (e.company || '').trim(),
        role: (e.role || '').trim(),
        summary: (e.summary || '').trim(),
        timeline: (e.timeline || '').trim(),
        mode: (e.mode || '').trim(),
        responsibilities: (e.responsibilities || '').trim(),
      }));
    const skillsClean = {
      coreTools: (skills.coreTools || '').trim(),
      design: (skills.design || '').trim(),
      creative: (skills.creative || '').trim(),
      professional: (skills.professional || '').trim(),
      tiles: cleanSkillTiles(skillTiles),
    };
    const aboutClean = {
      ...about,
      name: (about.name || '').trim(),
      intro: (about.intro || '').trim(),
      role: (about.role || '').trim(),
      country: (about.country || '').trim(),
      experience: (about.experience || '').trim(),
      workMode: (about.workMode || '').trim(),
      resumeUrl: (about.resumeUrl || '').trim(),
      phone: (about.phone || '').trim(),
    };
    const socialsClean = socials
      .filter((x) => (x.label || '').trim() || (x.url || '').trim())
      .map((x) => ({ label: (x.label || '').trim(), url: (x.url || '').trim() }));
    const cleanImgs = (arr) => arr
      .filter((x) => (x.url || '').trim())
      .map((x, i) => ({ key: String(x.key || ikey()), url: x.url.trim(), publicId: x.publicId || null, name: String(x.name || ''), order: i }));
    const infoGridClean = cleanImgs(infoGrid).slice(0, INFO_CAP);
    const footerClean = cleanImgs(footerImages);
    setSaving(true);
    try {
      await s.saveSettings({
        home,
        about: aboutClean,
        expertise: expertiseClean,
        experience: experienceClean,
        skills: skillsClean,
        socials: socialsClean,
        infoGrid: infoGridClean,
        footerImages: footerClean,
        contactEmail: contactEmail.trim(),
        location: location.trim(),
      });
      setAbout(aboutClean);
      setExpertise(expertiseClean);
      setExperience(experienceClean);
      setSkills(skillsClean);
      setSkillTiles(initialSkillTiles(skillsClean.tiles));
      setSocials(socialsClean);
      setInfoGrid(infoGridClean);
      setFooterImages(footerClean);
      setDirty(false);
      setSavedTick(true);
    } catch (e) {
      alert(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (s.loading) return <p>Loading…</p>;

  return (
    <>
      <h1 style={{ marginTop: 0 }}>Website texts</h1>
      <p style={muted}>Everything written on the website, in one place. Saving puts it live immediately.</p>
      <div className="card">
        <b>Home page intro</b>
        <p style={muted}>Shows on: home page, next to DEEPAK ROSHAN.</p>
        <label>Intro text</label><textarea rows={3} value={home.blurb} onChange={(e) => setHomeD({ ...home, blurb: e.target.value })} />
      </div>
      <div className="card">
        <b>About profile</b>
        <p style={muted}>Shows on: Info page, under the photo mosaic. Leave a field blank to keep the sample text.</p>
        <label>Name (max 120)</label>
        <input value={about.name || ''} onChange={(e) => setAboutD({ ...about, name: e.target.value })} maxLength={120} placeholder="Deepak Roshan" />
        <label>Intro paragraph (max 600)</label>
        <textarea rows={4} value={about.intro || ''} onChange={(e) => setAboutD({ ...about, intro: e.target.value })} maxLength={600} />
        <div className="row">
          <div style={{ flex: 1 }}><label>Role (max 80)</label><input value={about.role || ''} onChange={(e) => setAboutD({ ...about, role: e.target.value })} maxLength={80} placeholder="Communication Designer" /></div>
          <div style={{ flex: 1 }}><label>Country (max 120)</label><input value={about.country || ''} onChange={(e) => setAboutD({ ...about, country: e.target.value })} maxLength={120} placeholder="Mumbai, Maharashtra, India" /></div>
        </div>
        <div className="row">
          <div style={{ flex: 1 }}><label>Experience areas (max 120)</label><input value={about.experience || ''} onChange={(e) => setAboutD({ ...about, experience: e.target.value })} maxLength={120} placeholder="Graphic Design, Branding & Visual Communication" /></div>
          <div style={{ flex: 1 }}><label>Work mode (max 80)</label><input value={about.workMode || ''} onChange={(e) => setAboutD({ ...about, workMode: e.target.value })} maxLength={80} placeholder="Open to opportunities" /></div>
        </div>
        <label>Resume link</label>
        <input value={about.resumeUrl || ''} onChange={(e) => setAboutD({ ...about, resumeUrl: e.target.value })} maxLength={300} placeholder="https://…/resume.pdf" />
        <p style={muted}>Leave blank to use the built-in sample PDF. A direct PDF URL overrides it.</p>
      </div>
      <div className="card">
        <b>Expertise section ({expertise.length})</b>
        <p style={muted}>Shows on: bottom of the home page, next to “Our Expertise”. Number, name and one-line description per row.</p>
        <label>Intro text</label>
        <textarea rows={3} value={about.lede || ''} onChange={(e) => setAboutD({ ...about, lede: e.target.value })} maxLength={400} />
        {expertise.map((e, i) => (
          <div key={i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <div><label>Number</label><input style={{ maxWidth: 60 }} value={e.n} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, n: ev.target.value } : x)))} maxLength={8} /></div>
            <div style={{ flex: 1 }}><label>Service name (max 80)</label><input value={e.title} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, title: ev.target.value } : x)))} maxLength={80} /></div>
            <div style={{ flex: 3 }}><label>Description (max 300)</label><input value={e.text} onChange={(ev) => setExpertiseD(expertise.map((x, k) => (k === i ? { ...x, text: ev.target.value } : x)))} maxLength={300} /></div>
            <button className="btn danger" onClick={() => { if (askDelete('service')) setExpertiseD(expertise.filter((_, k) => k !== i)); }}>✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setExpertiseD([...expertise, { n: `${expertise.length + 1}`, title: 'New service', text: 'Describe it…' }])}>+ Add service</button>
        </div>
      </div>
      <div className="card">
        <b>Experience ({experience.length})</b>
        <p style={muted}>Shows on: Info page, as the ruled list under the intro. Leave the list empty to keep the sample entry. Responsibilities go one per line.</p>
        {experience.map((x, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '8px 0 14px' }}>
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}><label>Company (max 120)</label><input value={x.company || ''} onChange={(e) => setExperienceD(experience.map((y, k) => (k === i ? { ...y, company: e.target.value } : y)))} maxLength={120} /></div>
              <div style={{ flex: 1 }}><label>Timeline</label><input value={x.timeline || ''} onChange={(e) => setExperienceD(experience.map((y, k) => (k === i ? { ...y, timeline: e.target.value } : y)))} maxLength={40} placeholder="2025" /></div>
              <button className="btn danger" onClick={() => { if (askDelete('experience entry')) setExperienceD(experience.filter((_, k) => k !== i)); }}>✕</button>
            </div>
            <div className="row">
              <div style={{ flex: 1 }}><label>Role (max 120)</label><input value={x.role || ''} onChange={(e) => setExperienceD(experience.map((y, k) => (k === i ? { ...y, role: e.target.value } : y)))} maxLength={120} /></div>
              <div style={{ flex: 1 }}><label>Work mode</label><input value={x.mode || ''} onChange={(e) => setExperienceD(experience.map((y, k) => (k === i ? { ...y, mode: e.target.value } : y)))} maxLength={60} placeholder="Internship" /></div>
            </div>
            <label>Summary</label>
            <input value={x.summary || ''} onChange={(e) => setExperienceD(experience.map((y, k) => (k === i ? { ...y, summary: e.target.value } : y)))} maxLength={300} placeholder="worked on branding, visual communication and design deliverables." />
            <label>Responsibilities (one per line)</label>
            <textarea rows={3} value={x.responsibilities || ''} onChange={(e) => setExperienceD(experience.map((y, k) => (k === i ? { ...y, responsibilities: e.target.value } : y)))} maxLength={1200} />
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setExperienceD([...experience, { company: 'Company name', role: 'Role', summary: '', timeline: '', mode: '', responsibilities: '' }])}>+ Add experience</button>
        </div>
      </div>
      <div className="card">
        <b>Skills</b>
        <p style={muted}>Shows on: Info page. Separate items with ·. Leave a field blank to keep the sample text.</p>
        <label>Core tools (max 200)</label>
        <input value={skills.coreTools || ''} onChange={(e) => setSkillsD({ ...skills, coreTools: e.target.value })} maxLength={200} placeholder="Adobe Creative Suite | Blender | Figma | AI Tools" />
        <label>Design (max 400)</label>
        <textarea rows={2} value={skills.design || ''} onChange={(e) => setSkillsD({ ...skills, design: e.target.value })} maxLength={400} />
        <label>Creative (max 400)</label>
        <textarea rows={2} value={skills.creative || ''} onChange={(e) => setSkillsD({ ...skills, creative: e.target.value })} maxLength={400} />
        <label>Professional (max 400)</label>
        <textarea rows={2} value={skills.professional || ''} onChange={(e) => setSkillsD({ ...skills, professional: e.target.value })} maxLength={400} />
      </div>
      <div className="card">
        <b>Skill app tiles ({skillTiles.length})</b>
        <p style={muted}>Shows on: Info page skills. Upload any SVG up to {SVG_MAX_KB}KB, including colour and transparent artwork. It displays at the current tile size with its original colours. If the SVG includes a background, that background will also show. Row order is the marquee order.</p>
        {tileErr && <p style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{tileErr}</p>}
        {skillTiles.map((tile, i) => {
          return (
            <div key={tile.key || i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '10px 0', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span
                className="skill-tile"
                role="img"
                aria-label={skillTileLabel(tile)}
                title={skillTileLabel(tile)}
                style={{ flex: '0 0 auto' }}
              >
                {tile.iconUrl
                  ? <img className="skill-logo" src={tile.iconUrl} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
                  : <span style={{ fontFamily: 'Archivo, Arial, sans-serif', fontSize: '1rem', fontWeight: 700, letterSpacing: '-.055em' }}>{skillTileMark(tile)}</span>}
              </span>
              <div style={{ width: 72 }}>
                <label>Mark</label>
                <input value={tile.code || ''} onChange={(e) => updateSkillTile(i, { code: e.target.value.slice(0, 4) })} maxLength={4} placeholder="Ae" aria-label="Fallback mark" />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label>App name</label>
                <input value={tile.label || ''} onChange={(e) => updateSkillTile(i, { label: e.target.value })} maxLength={120} placeholder="Adobe After Effects" aria-label="App name" />
              </div>
              <label className="btn ghost" style={{ cursor: tileBusy ? 'wait' : 'pointer', opacity: tileBusy ? 0.6 : 1 }} aria-busy={tileBusy === (tile.key || String(i))}>
                {tileBusy === (tile.key || String(i)) ? 'Uploading…' : 'Upload SVG'}
                <input hidden type="file" accept=".svg,image/svg+xml" disabled={!!tileBusy} aria-label={`Upload SVG for ${skillTileLabel(tile)}`} onChange={(e) => { uploadSkillIcon(i, e.target.files?.[0]); e.target.value = ''; }} />
              </label>
              {tile.iconUrl && <button type="button" className="btn ghost" onClick={() => resetSkillIcon(i)} aria-label="Reset icon to letter mark">Reset</button>}
              <button type="button" className="btn ghost" onClick={() => moveSkillTile(i, -1)} aria-label="Move app up">↑</button>
              <button type="button" className="btn ghost" onClick={() => moveSkillTile(i, 1)} aria-label="Move app down">↓</button>
              <button type="button" className="btn danger" onClick={() => deleteSkillTile(i)} aria-label="Remove app">✕</button>
            </div>
          );
        })}
        {skillTiles.length === 0 && <p style={muted}>No app tiles yet. Add at least one app to show the marquee.</p>}
        <div className="row" style={{ marginTop: 8 }}>
          <button type="button" className="btn ghost" onClick={addSkillTile}>+ Add app</button>
        </div>
      </div>
      <div className="card">
        <b>Social links ({socials.length})</b>
        <p style={muted}>Shows on: top bar and bottom of the website. Full addresses starting with https://</p>
        {socials.map((x, i) => (
          <div key={i} className="row" style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
            <div style={{ flex: 1 }}><label>Link name (max 40)</label><input value={x.label} onChange={(e) => setSocialsD(socials.map((y, k) => (k === i ? { ...y, label: e.target.value } : y)))} placeholder="Instagram" maxLength={40} /></div>
            <div style={{ flex: 3 }}><label>Address</label><input value={x.url} onChange={(e) => setSocialsD(socials.map((y, k) => (k === i ? { ...y, url: e.target.value } : y)))} placeholder="https://…" maxLength={300} /></div>
            <button className="btn danger" onClick={() => { if (askDelete('link')) setSocialsD(socials.filter((_, k) => k !== i)); }}>✕</button>
          </div>
        ))}
        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn ghost" onClick={() => setSocialsD([...socials, { label: 'Instagram', url: 'https://' }])}>+ Add link</button>
        </div>
      </div>
      <div className="card">
        <b>Info page photos ({infoGrid.length}/{INFO_CAP})</b>
        <p style={muted}>Shows on: Info page photo mosaic, positions 1–12 in the order below.</p>
        {photoRows(infoGrid, setInfoGrid, true)}
        {infoGrid.length >= INFO_CAP
          ? <p style={muted}>The grid is full (12 photos). Remove one to add another.</p>
          : <>
              <label>Upload photos</label>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { uploadInto(e.target.files, infoGrid, setInfoGrid, setInfoBusy, setInfoErr, INFO_CAP); e.target.value = ''; }} disabled={infoBusy} />
            </>}
        {infoBusy && <p>Uploading…</p>}
        {infoErr && <p style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{infoErr}</p>}
        <label style={{ marginTop: 8 }}>Or pick from your products</label>
        {libraryBrowser(infoGrid, setInfoGrid, INFO_CAP)}
      </div>
      <div className="card">
        <b>Footer photos ({footerImages.length})</b>
        <p style={muted}>Shows on: footer background, rotating in the order below.</p>
        {photoRows(footerImages, setFooterImages, false)}
        <label>Upload photos</label>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { uploadInto(e.target.files, footerImages, setFooterImages, setFootBusy, setFootErr, 0); e.target.value = ''; }} disabled={footBusy} />
        {footBusy && <p>Uploading…</p>}
        {footErr && <p style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{footErr}</p>}
        <label style={{ marginTop: 8 }}>Or pick from your products</label>
        {libraryBrowser(footerImages, setFooterImages, 0)}
      </div>
      <div className="card">
        <b>Contact</b>
        <p style={muted}>Shows on: top bar, Info page contact details and footer.</p>
        <label>Email</label><input value={contactEmail} onChange={(e) => setEmailD(e.target.value)} maxLength={120} />
        <label>Phone</label><input value={about.phone || ''} onChange={(e) => setAboutD({ ...about, phone: e.target.value })} maxLength={40} placeholder="+91 9518595037" />
        <label>Location</label><input value={location} onChange={(e) => setLocationD(e.target.value)} maxLength={120} />
      </div>
      <div className="row" style={{ alignItems: 'center' }}>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save all changes'}</button>
        {savedTick && !dirty && <span style={{ color: 'var(--success)', fontWeight: 600 }}>Saved ✓ live on the website</span>}
      </div>
    </>
  );
}
