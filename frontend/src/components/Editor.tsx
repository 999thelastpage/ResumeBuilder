"use client";

import React, { useState, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import ResumePreview, { TemplateId } from './ResumePreview';
import { ResumeData, defaultResumeData } from '../types/resume';

/* ─── Donation config — configurable via environment variables ─── */
const KOFI_URL   = process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/yourhandle';
const UPI_ID     = process.env.NEXT_PUBLIC_UPI_ID   || 'yourusername@upi';
const UPI_NAME   = process.env.NEXT_PUBLIC_UPI_NAME || 'CV Modernizer';
const UPI_QR_URL = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&cu=INR`;


/* ─── Color palettes ─── */
const COLOR_PALETTES = [
  { name: 'Slate',    hex: '#475569', desc: 'Neutral & refined' },
  { name: 'Stone',    hex: '#57534e', desc: 'Warm & grounded' },
  { name: 'Charcoal', hex: '#374151', desc: 'Classic dark' },
  { name: 'Steel',    hex: '#4a6fa5', desc: 'Corporate blue' },
  { name: 'Navy',     hex: '#1e3a5f', desc: 'Deep navy' },
  { name: 'Teal',     hex: '#0d6e6e', desc: 'Modern teal' },
  { name: 'Forest',   hex: '#2d5f3f', desc: 'Deep green' },
  { name: 'Sage',     hex: '#6b8f71', desc: 'Soft sage' },
  { name: 'Wine',     hex: '#6b2d42', desc: 'Rich burgundy' },
  { name: 'Plum',     hex: '#5b3a6b', desc: 'Muted purple' },
  { name: 'Rust',     hex: '#9a5535', desc: 'Warm copper' },
  { name: 'Mocha',    hex: '#6f5243', desc: 'Earthy brown' },
];

/* ─── Template definitions ─── */
const TEMPLATES: { id: TemplateId; name: string; desc: string; icon: string }[] = [
  { id: 'minimalist',  name: 'Minimalist',  desc: 'Clean whitespace layout',    icon: '▬' },
  { id: 'modern-tech', name: 'Modern Tech', desc: 'Skills sidebar + experience', icon: '◧' },
  { id: 'executive',   name: 'Executive',   desc: 'Traditional centered',        icon: '▣' },
  { id: 'creative',    name: 'Creative',    desc: 'Bold banner + timeline',      icon: '◫' },
  { id: 'elegant',     name: 'Elegant',     desc: 'Accent stripe + grid',        icon: '▤' },
];

/* ─── UID helper ─── */
const uid = () => Math.random().toString(36).slice(2, 9);

/* ─── Upload Status type ─── */
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export default function Editor() {
  const [data, setData] = useState<ResumeData>(defaultResumeData);
  const [template, setTemplate] = useState<TemplateId>('minimalist');
  const [color, setColor] = useState('#4a6fa5');
  const resumeRef = useRef<HTMLDivElement>(null); // points at the rendered resume card
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  const [exportingPdf, setExportingPdf] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');

  // ── PDF: fetch from backend using Playwright (server-side rendering) ──
  const handleExportPdf = async () => {
    const resumeEl = document.querySelector('.resume-sheet');
    if (!resumeEl) return;
    
    setExportingPdf(true);
    try {
      const styles = Array.from(document.styleSheets)
        .flatMap(sheet => {
          try { return Array.from(sheet.cssRules).map(r => r.cssText); }
          catch { return []; }
        })
        .join('\n');

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${styles}
  </style>
  <style>
    @page { size: auto; margin: 0; }
    @media print {
      @page { size: auto; margin: 0; }
    }
    html, body { margin: 0 !important; padding: 0 !important; background: white !important; height: auto !important; overflow: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; display: block !important; }
    .resume-sheet { box-shadow: none !important; border-radius: 0 !important; width: 210mm !important; min-height: auto !important; height: auto !important; margin: 0 !important; overflow: visible !important; }
  </style>
</head>
<body>${resumeEl.outerHTML}</body>
</html>`;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: fullHtml }),
      });
      
      if (!res.ok) {
        let msg = 'PDF export failed.';
        try { const b = await res.json(); msg = b.detail || msg; } catch {}
        alert(msg);
        return;
      }
      
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${data.bio.name?.replace(/[^\w\s]/g, '').trim() || 'resume'}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not reach the backend. Make sure it is running on port 8000.');
    } finally {
      setExportingPdf(false);
    }
  };

  // ── DOCX: fetch from backend, trigger browser download ──────────
  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/export/docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let msg = 'DOCX export failed.';
        try { const b = await res.json(); msg = b.detail || msg; } catch {}
        alert(msg);
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${data.bio.name?.replace(/[^\w\s]/g, '').trim() || 'resume'}_resume.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not reach the backend. Make sure it is running on port 8000.');
    } finally {
      setExportingDocx(false);
    }
  };

  const openKofi = () => {
    const w = 540, h = 740;
    const left = Math.round((screen.width  - w) / 2);
    const top  = Math.round((screen.height - h) / 2);
    // Keep full browser chrome (toolbar, location bar) so Ko-fi fraud detection doesn't flag it
    window.open(KOFI_URL, 'ko-fi-donate', `width=${w},height=${h},left=${left},top=${top},scrollbars=yes`);
  };

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ──────────── Bio ──────────── */
  const updateBio = (field: string, value: string) =>
    setData(prev => ({ ...prev, bio: { ...prev.bio, [field]: value } }));

  /* ──────────── Experience ──────────── */
  const addExperience = () =>
    setData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: uid(), company: '', role: '', startDate: '', endDate: '', location: '', bullets: [''] },
      ],
    }));

  const removeExperience = (id: string) =>
    setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));

  const moveExperience = (id: string, dir: 'up' | 'down') =>
    setData(prev => {
      const arr = [...prev.experience];
      const idx = arr.findIndex(e => e.id === id);
      const to = dir === 'up' ? idx - 1 : idx + 1;
      if (to < 0 || to >= arr.length) return prev;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return { ...prev, experience: arr };
    });

  const updateExperience = (id: string, field: string, value: string) =>
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));

  const addBullet = (expId: string) =>
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      ),
    }));

  const updateBullet = (expId: string, bIdx: number, value: string) =>
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.map((b, i) => (i === bIdx ? value : b)) }
          : exp
      ),
    }));

  const removeBullet = (expId: string, bIdx: number) =>
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId ? { ...exp, bullets: exp.bullets.filter((_, i) => i !== bIdx) } : exp
      ),
    }));

  /* ──────────── Education ──────────── */
  const addEducation = () =>
    setData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: uid(), institution: '', degree: '', startDate: '', endDate: '' },
      ],
    }));

  const removeEducation = (id: string) =>
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));

  const moveEducation = (id: string, dir: 'up' | 'down') =>
    setData(prev => {
      const arr = [...prev.education];
      const idx = arr.findIndex(e => e.id === id);
      const to = dir === 'up' ? idx - 1 : idx + 1;
      if (to < 0 || to >= arr.length) return prev;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return { ...prev, education: arr };
    });

  const updateEducation = (id: string, field: string, value: string) =>
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }));

  /* ──────────── Skills ──────────── */
  const addSkillGroup = () =>
    setData(prev => ({ ...prev, skills: [...prev.skills, { category: '', items: [''] }] }));

  const removeSkillGroup = (gIdx: number) =>
    setData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== gIdx) }));

  const moveSkillGroup = (gIdx: number, dir: 'up' | 'down') =>
    setData(prev => {
      const arr = [...prev.skills];
      const to = dir === 'up' ? gIdx - 1 : gIdx + 1;
      if (to < 0 || to >= arr.length) return prev;
      [arr[gIdx], arr[to]] = [arr[to], arr[gIdx]];
      return { ...prev, skills: arr };
    });

  const updateSkillCategory = (gIdx: number, value: string) =>
    setData(prev => ({
      ...prev,
      skills: prev.skills.map((g, i) => (i === gIdx ? { ...g, category: value } : g)),
    }));

  const addSkillItem = (gIdx: number) =>
    setData(prev => ({
      ...prev,
      skills: prev.skills.map((g, i) => (i === gIdx ? { ...g, items: [...g.items, ''] } : g)),
    }));

  const updateSkillItem = (gIdx: number, iIdx: number, value: string) =>
    setData(prev => ({
      ...prev,
      skills: prev.skills.map((g, i) =>
        i === gIdx ? { ...g, items: g.items.map((it, ii) => (ii === iIdx ? value : it)) } : g
      ),
    }));

  const removeSkillItem = (gIdx: number, iIdx: number) =>
    setData(prev => ({
      ...prev,
      skills: prev.skills.map((g, i) =>
        i === gIdx ? { ...g, items: g.items.filter((_, ii) => ii !== iIdx) } : g
      ),
    }));

  /* ──────────── Links ──────────── */
  const addLink = () =>
    setData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));

  const removeLink = (lIdx: number) =>
    setData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== lIdx) }));

  const moveLink = (lIdx: number, dir: 'up' | 'down') =>
    setData(prev => {
      const arr = [...prev.links];
      const to = dir === 'up' ? lIdx - 1 : lIdx + 1;
      if (to < 0 || to >= arr.length) return prev;
      [arr[lIdx], arr[to]] = [arr[to], arr[lIdx]];
      return { ...prev, links: arr };
    });

  const updateLink = (lIdx: number, field: 'label' | 'url', value: string) =>
    setData(prev => ({
      ...prev,
      links: prev.links.map((lnk, i) => (i === lIdx ? { ...lnk, [field]: value } : lnk)),
    }));

  /* ──────────── File Upload ──────────── */
  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Client-side type guard
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setUploadStatus('error');
      setUploadMessage('Only PDF or DOCX files are accepted.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage(`Parsing "${file.name}"…`);

    // Helper: extract the most human-readable message from a FastAPI error body
    const parseErrorDetail = (body: Record<string, unknown>, status: number): string => {
      const raw = body?.detail;
      if (typeof raw === 'string') return raw;
      if (Array.isArray(raw)) {
        // Pydantic validation errors — list of { msg, loc } objects
        return raw.map((e: Record<string, unknown>) => String(e.msg ?? e)).join(' · ');
      }
      // Fallback by status code
      const fallbacks: Record<number, string> = {
        400: 'Invalid request. Please check your file and try again.',
        413: 'File is too large. Please reduce its size and try again.',
        422: 'Could not process the file. Make sure it contains valid resume content.',
        429: 'Too many requests. Please wait a few minutes and try again.',
        500: 'An internal server error occurred. Check the backend logs for details.',
        503: 'The backend service is unavailable or misconfigured.',
      };
      return fallbacks[status] ?? `Unexpected error (HTTP ${status}).`;
    };

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/extract`, {
        method: 'POST',
        body: formData,
      });

      // Always read the body — both success and error responses are JSON
      let body: Record<string, unknown> = {};
      try {
        body = await res.json();
      } catch {
        // Non-JSON body (e.g. a proxy HTML error page)
        body = {};
      }

      if (!res.ok) {
        setUploadStatus('error');
        setUploadMessage(parseErrorDetail(body, res.status));
        return;
      }

      if (body.resume_data) {
        setData(body.resume_data as ResumeData);
        setUploadStatus('done');
        setUploadMessage(`✓ Imported from "${file.name}". Review and adjust below.`);
      } else {
        setUploadStatus('error');
        setUploadMessage('Backend returned an unexpected response. Check the backend logs.');
      }
    } catch {
      // Network-level failure (backend unreachable, CORS, etc.)
      setUploadStatus('error');
      setUploadMessage('Cannot reach the backend. Make sure it is running on port 8000.');
    }
  }, []);


  const onDropZoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  /* ──────────── Render ──────────── */
  return (
    <div className={`editor-layout ${activeView === 'preview' ? 'show-preview' : 'show-editor'}`}>
      {/* ══════ Sidebar ══════ */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="brand-name">CV Modernizer</h1>
            <p className="brand-sub">AI-Powered Resume Builder</p>
          </div>
        </div>

        <div className="sidebar-scroll">

          {/* ── Upload Zone ── */}
          <div className="panel">
            <div className="panel-label">Import Existing Resume</div>
            <div
              className={`upload-zone ${isDragging ? 'dragging' : ''} ${uploadStatus === 'done' ? 'done' : ''} ${uploadStatus === 'error' ? 'error' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                style={{ display: 'none' }}
                onChange={onDropZoneChange}
              />
              {uploadStatus === 'idle' && (
                <>
                  <div className="upload-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="upload-text">Drop your PDF or DOCX here</p>
                  <p className="upload-sub">or click to browse</p>
                </>
              )}
              {uploadStatus === 'uploading' && (
                <>
                  <div className="upload-spinner" />
                  <p className="upload-text">{uploadMessage}</p>
                </>
              )}
              {uploadStatus === 'done' && (
                <>
                  <div className="upload-icon success">✓</div>
                  <p className="upload-text upload-success">{uploadMessage}</p>
                  <button
                    className="upload-reset"
                    onClick={e => { e.stopPropagation(); setUploadStatus('idle'); setUploadMessage(''); }}
                  >Upload another</button>
                </>
              )}
              {uploadStatus === 'error' && (
                <>
                  <div className="upload-icon error-icon">⚠</div>
                  <p className="upload-text upload-error">{uploadMessage}</p>
                  <button
                    className="upload-reset"
                    onClick={e => { e.stopPropagation(); setUploadStatus('idle'); setUploadMessage(''); }}
                  >Try again</button>
                </>
              )}
            </div>
          </div>

          {/* ── Template Selector ── */}
          <div className="panel">
            <div className="panel-label">Template</div>
            <div className="template-grid">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className={`tpl-card ${template === t.id ? 'active' : ''}`}
                  onClick={() => setTemplate(t.id)}
                  title={t.desc}
                >
                  <span className="tpl-icon">{t.icon}</span>
                  <span className="tpl-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Brand Color ── */}
          <div className="panel">
            <div className="panel-label">Brand Color</div>
            <div className="color-grid">
              {COLOR_PALETTES.map(c => (
                <button
                  key={c.hex}
                  className={`color-swatch ${color === c.hex ? 'active' : ''}`}
                  style={{ '--swatch': c.hex } as React.CSSProperties}
                  onClick={() => setColor(c.hex)}
                  title={`${c.name} — ${c.desc}`}
                >
                  <span className="swatch-dot" />
                  {color === c.hex && <span className="swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ── Accordion Sections ── */}
          <div className="accordion-stack">

            {/* Bio */}
            <details className="acc" open>
              <summary className="acc-trigger">
                <span className="acc-icon">👤</span>
                <span>Bio & Contact</span>
              </summary>
              <div className="acc-body">
                <div className="field">
                  <label>Full Name</label>
                  <input value={data.bio.name} onChange={e => updateBio('name', e.target.value)} placeholder="John Doe" />
                </div>
                <div className="field">
                  <label>Job Title</label>
                  <input value={data.bio.title} onChange={e => updateBio('title', e.target.value)} placeholder="Software Engineer" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Email</label>
                    <input value={data.bio.email} onChange={e => updateBio('email', e.target.value)} placeholder="you@email.com" />
                  </div>
                  <div className="field">
                    <label>Phone</label>
                    <input value={data.bio.phone} onChange={e => updateBio('phone', e.target.value)} placeholder="+1 234 567 890" />
                  </div>
                </div>
                <div className="field">
                  <label>Location</label>
                  <input value={data.bio.location} onChange={e => updateBio('location', e.target.value)} placeholder="San Francisco, CA" />
                </div>
                <div className="field">
                  <label>Professional Summary</label>
                  <textarea rows={4} value={data.bio.summary} onChange={e => updateBio('summary', e.target.value)} placeholder="A brief overview of your career and expertise…" />
                </div>
                
                {/* Links Section */}
                <div className="links-section" style={{ marginTop: '32px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', display: 'block' }}>
                    Social & Profile Links
                  </label>
                  
                  {data.links.map((link, lIdx) => (
                    <div key={lIdx} className="sub-card">
                      <div className="sub-card-head">
                        <span className="sub-card-num">{lIdx + 1}</span>
                        <span className="sub-card-title">{link.label || 'New Link'}</span>
                        <div className="sub-card-actions">
                          <button className="btn-icon btn-move" onClick={() => moveLink(lIdx, 'up')} disabled={lIdx === 0} title="Move up">↑</button>
                          <button className="btn-icon btn-move" onClick={() => moveLink(lIdx, 'down')} disabled={lIdx === data.links.length - 1} title="Move down">↓</button>
                          <button className="btn-icon btn-danger" onClick={() => removeLink(lIdx)} title="Remove link">×</button>
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>Label</label>
                          <input value={link.label} onChange={e => updateLink(lIdx, 'label', e.target.value)} placeholder="e.g. LinkedIn" />
                        </div>
                        <div className="field">
                          <label>URL</label>
                          <input value={link.url} onChange={e => updateLink(lIdx, 'url', e.target.value)} placeholder="https://..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button className="btn-add-section" onClick={addLink}>
                    <span>+</span> Add Link
                  </button>
                </div>
              </div>
            </details>

            {/* Experience */}
            <details className="acc">
              <summary className="acc-trigger">
                <span className="acc-icon">💼</span>
                <span>Experience</span>
                <span className="acc-badge">{data.experience.length}</span>
              </summary>
              <div className="acc-body">
                {data.experience.map((exp, expIdx) => (
                  <div key={exp.id} className="sub-card">
                    <div className="sub-card-head">
                      <span className="sub-card-num">{expIdx + 1}</span>
                      <span className="sub-card-title">{exp.role || 'New Role'}</span>
                      <div className="sub-card-actions">
                        <button className="btn-icon btn-move" onClick={() => moveExperience(exp.id, 'up')} disabled={expIdx === 0} title="Move up">↑</button>
                        <button className="btn-icon btn-move" onClick={() => moveExperience(exp.id, 'down')} disabled={expIdx === data.experience.length - 1} title="Move down">↓</button>
                        <button className="btn-icon btn-danger" onClick={() => removeExperience(exp.id)} title="Remove entry">×</button>
                      </div>
                    </div>
                    <div className="field">
                      <label>Role / Title</label>
                      <input value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="e.g. Software Engineer" />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Company</label>
                        <input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="e.g. Stripe" />
                      </div>
                      <div className="field">
                        <label>Location</label>
                        <input value={exp.location} onChange={e => updateExperience(exp.id, 'location', e.target.value)} placeholder="e.g. NYC" />
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Start</label>
                        <input value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2021" />
                      </div>
                      <div className="field">
                        <label>End</label>
                        <input value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" />
                      </div>
                    </div>
                    <div className="field">
                      <label>Bullets</label>
                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="bullet-row">
                          <span className="bullet-marker">•</span>
                          <input value={bullet} onChange={e => updateBullet(exp.id, bIdx, e.target.value)} placeholder="Describe an achievement…" />
                          <button className="btn-icon btn-danger" onClick={() => removeBullet(exp.id, bIdx)} title="Remove">×</button>
                        </div>
                      ))}
                      <button className="btn-add" onClick={() => addBullet(exp.id)}>+ Add bullet</button>
                    </div>
                  </div>
                ))}
                <button className="btn-add-section" onClick={addExperience}>
                  <span>+</span> Add Experience
                </button>
              </div>
            </details>

            {/* Education */}
            <details className="acc">
              <summary className="acc-trigger">
                <span className="acc-icon">🎓</span>
                <span>Education</span>
                <span className="acc-badge">{data.education.length}</span>
              </summary>
              <div className="acc-body">
                {data.education.map((edu, eduIdx) => (
                  <div key={edu.id} className="sub-card">
                    <div className="sub-card-head">
                      <span className="sub-card-num">{eduIdx + 1}</span>
                      <span className="sub-card-title">{edu.degree || 'New Degree'}</span>
                      <div className="sub-card-actions">
                        <button className="btn-icon btn-move" onClick={() => moveEducation(edu.id, 'up')} disabled={eduIdx === 0} title="Move up">↑</button>
                        <button className="btn-icon btn-move" onClick={() => moveEducation(edu.id, 'down')} disabled={eduIdx === data.education.length - 1} title="Move down">↓</button>
                        <button className="btn-icon btn-danger" onClick={() => removeEducation(edu.id)} title="Remove entry">×</button>
                      </div>
                    </div>
                    <div className="field">
                      <label>Degree</label>
                      <input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="e.g. B.S. Computer Science" />
                    </div>
                    <div className="field">
                      <label>Institution</label>
                      <input value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} placeholder="e.g. MIT" />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>Start</label>
                        <input value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} placeholder="2018" />
                      </div>
                      <div className="field">
                        <label>End</label>
                        <input value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} placeholder="2022" />
                      </div>
                    </div>
                  </div>
                ))}
                <button className="btn-add-section" onClick={addEducation}>
                  <span>+</span> Add Education
                </button>
              </div>
            </details>

            {/* Skills */}
            <details className="acc">
              <summary className="acc-trigger">
                <span className="acc-icon">⚡</span>
                <span>Skills</span>
                <span className="acc-badge">{data.skills.reduce((a, g) => a + g.items.length, 0)}</span>
              </summary>
              <div className="acc-body">
                {data.skills.map((group, gIdx) => (
                  <div key={gIdx} className="sub-card">
                    <div className="sub-card-head">
                      <span className="sub-card-num">{gIdx + 1}</span>
                      <span className="sub-card-title">{group.category || 'New Category'}</span>
                      <div className="sub-card-actions">
                        <button className="btn-icon btn-move" onClick={() => moveSkillGroup(gIdx, 'up')} disabled={gIdx === 0} title="Move up">↑</button>
                        <button className="btn-icon btn-move" onClick={() => moveSkillGroup(gIdx, 'down')} disabled={gIdx === data.skills.length - 1} title="Move down">↓</button>
                        <button className="btn-icon btn-danger" onClick={() => removeSkillGroup(gIdx)} title="Remove group">×</button>
                      </div>
                    </div>
                    <div className="field">
                      <label>Category Name</label>
                      <input value={group.category} onChange={e => updateSkillCategory(gIdx, e.target.value)} placeholder="e.g. Languages" />
                    </div>
                    <div className="field">
                      <label>Skills</label>
                      <div className="skill-chips-edit">
                        {group.items.map((item, iIdx) => (
                          <div key={iIdx} className="chip-edit">
                            <input value={item} onChange={e => updateSkillItem(gIdx, iIdx, e.target.value)} placeholder="Skill name" />
                            <button className="btn-icon btn-danger" onClick={() => removeSkillItem(gIdx, iIdx)} title="Remove">×</button>
                          </div>
                        ))}
                      </div>
                      <button className="btn-add" onClick={() => addSkillItem(gIdx)}>+ Add skill</button>
                    </div>
                  </div>
                ))}
                <button className="btn-add-section" onClick={addSkillGroup}>
                  <span>+</span> Add Skill Group
                </button>
              </div>
            </details>

          </div>
        </div>

        {/* Support section */}
        <div className="support-section">
          <div className="support-divider">
            <span>Support this project</span>
          </div>
          <div className="support-buttons">
            {/* Ko-fi — popup with full browser chrome to pass security checks */}
            <button
              className="btn-support btn-kofi"
              onClick={openKofi}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 9.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682-.284-1.682-.284V5.645c.334-.086 3.996-.118 4.062 2.561.066 2.679-2.38 4.731-2.38 4.731z"/>
              </svg>
              Ko-fi
            </button>

            {/* UPI — India */}
            <button
              className={`btn-support btn-upi ${showUpiQr ? 'active' : ''}`}
              onClick={() => setShowUpiQr(v => !v)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h2v2h-2zM18 14h3M18 18v3M14 18h2v3"/>
              </svg>
              UPI (India)
            </button>
          </div>

          {/* UPI QR panel */}
          {showUpiQr && (
            <div className="upi-qr-panel">
              <QRCodeSVG
                value={UPI_QR_URL}
                size={160}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                level="M"
                includeMargin={true}
                style={{ borderRadius: 6 }}
              />
              <p className="upi-qr-id">{UPI_ID}</p>
              <p className="upi-qr-name">{UPI_NAME}</p>
              <p className="upi-qr-hint">Scan with any UPI app · GPay / PhonePe / Paytm</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sidebar-actions">
          <button id="btn-download-pdf" className="btn btn-primary" onClick={handleExportPdf} disabled={exportingPdf}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {exportingPdf ? 'Exporting…' : 'Download PDF'}
          </button>
          <button id="btn-export-docx" className="btn btn-outline" onClick={handleExportDocx} disabled={exportingDocx}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            {exportingDocx ? 'Exporting…' : 'Export DOCX'}
          </button>
        </div>
      </aside>

      {/* ══════ Preview Pane ══════ */}
      <main className="preview-pane">
        <div className="preview-bar">
          <div className="preview-bar-left">
            <span className="preview-label">Live Preview</span>
            <span className="preview-meta">
              {TEMPLATES.find(t => t.id === template)?.name}
              {' · '}
              {COLOR_PALETTES.find(c => c.hex === color)?.name}
            </span>
          </div>
        </div>
        <div className="preview-canvas" ref={resumeRef}>
          <ResumePreview data={data} templateId={template} primaryColor={color} />
        </div>
      </main>

      {/* ══════ Mobile View Toggle ══════ */}
      <div className="mobile-toggle">
        <button
          className={`toggle-btn ${activeView === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveView('editor')}
        >
          <span>✏️</span> Editor
        </button>
        <button
          className={`toggle-btn ${activeView === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveView('preview')}
        >
          <span>👁️</span> Preview
        </button>
      </div>
    </div>
  );
}
