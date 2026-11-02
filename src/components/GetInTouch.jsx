import { useState } from 'react';
import { useSite } from '../lib/store.jsx';

const KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const FALLBACK_PHONE = '+91 9518595037';

// "handle@Platform" when the social URL carries a username, otherwise the label.
const GENERIC_SEGMENTS = new Set([
  'home', 'in', 'feed', 'explore', 'login', 'accounts', 'profile', 'company', 'pub', 'dir', 'posts',
]);

function socialText(label, url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const last = (parts[parts.length - 1] || '').replace(/^@/, '');
    const valid = /^[a-zA-Z0-9._-]{2,}$/.test(last) && !GENERIC_SEGMENTS.has(last.toLowerCase());
    return valid ? `${last}@${label}` : label;
  } catch {
    return label;
  }
}

export default function GetInTouch() {
  const { settings } = useSite();
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  const phone = (settings.about?.phone || FALLBACK_PHONE).trim();
  const email = (settings.contactEmail || '').trim();
  const socials = (Array.isArray(settings.socials) ? settings.socials : []).filter(
    (x) => (x.url || '').trim(),
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!KEY) {
      setStatus('error');
      setError('Form is not configured yet. Please try email instead.');
      return;
    }
    setStatus('sending');
    setError('');
    const formData = new FormData(e.target);
    formData.append('access_key', KEY);
    formData.append('subject', 'New inquiry — Deepak Roshan');
    formData.append('from_name', 'Deepak Roshan');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        e.target.reset();
      } else {
        setStatus('error');
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setError('Network error. Check your connection and try again.');
    }
  };

  return (
    <section className="git">
      <div className="git-inner">
        <div className="git-grid">
          <div className="git-left">
            <h2 className="git-title">Get in touch</h2>
            <div className="git-details">
              {phone && <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>}
              {email && <a href={`mailto:${email}`}>{email}</a>}
              {socials.map((s, i) => (
                <a key={`${s.label}-${i}`} href={s.url} target="_blank" rel="noreferrer">
                  {socialText(s.label || 'Link', s.url)}
                </a>
              ))}
            </div>
          </div>
          <form className="git-form" onSubmit={onSubmit}>
            <div className="cf-row">
              <label className="cf-field">
                <span className="cf-label">Full Name</span>
                <input type="text" name="name" placeholder="Your full name" required autoComplete="name" />
              </label>
              <label className="cf-field">
                <span className="cf-label">Email</span>
                <input type="email" name="email" placeholder="you@email.com" required autoComplete="email" />
              </label>
            </div>
            <label className="cf-field">
              <span className="cf-label">Message</span>
              <textarea name="message" placeholder="Tell me about your project…" rows={3} required />
            </label>
            <input type="checkbox" name="botcheck" className="cf-honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <button type="submit" className="cf-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Submit'}
            </button>
            {status === 'success' && (
              <p className="cf-note ok" role="status">
                Thanks — your message is on its way. I&apos;ll get back to you soon.
              </p>
            )}
            {status === 'error' && (
              <p className="cf-note err" role="alert">{error}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
