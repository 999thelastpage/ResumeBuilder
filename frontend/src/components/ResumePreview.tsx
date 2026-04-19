import React from 'react';
import { ResumeData } from '../types/resume';
import '../app/resume.css';

export type TemplateId = 'minimalist' | 'modern-tech' | 'executive' | 'creative' | 'elegant';

interface ResumePreviewProps {
  data: ResumeData;
  templateId: TemplateId;
  primaryColor: string;
}

/* ───────────── Shared Helpers ───────────── */
const ContactRow = ({ data, separator = '·' }: { data: ResumeData; separator?: string }) => {
  const items = [data.bio.email, data.bio.phone, data.bio.location].filter(Boolean);
  return (
    <div className="contact-row">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <span>{item}</span>
          {idx < items.length - 1 && <span className="sep">{separator}</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

const LinkRow = ({ links, className = '' }: { links: ResumeData['links']; className?: string }) => (
  <div className={`link-row ${className}`}>
    {links.map((link, idx) => (
      <a key={idx} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
    ))}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="section-title">{children}</h3>
);

const ExperienceBlock = ({ exp }: { exp: ResumeData['experience'][0] }) => (
  <div className="exp-block">
    <div className="exp-top">
      <div>
        <h4 className="exp-role">{exp.role}</h4>
        <span className="exp-company">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</span>
      </div>
      <span className="exp-date">{exp.startDate} – {exp.endDate}</span>
    </div>
    <ul className="exp-bullets">
      {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  </div>
);

const EducationBlock = ({ edu }: { edu: ResumeData['education'][0] }) => (
  <div className="edu-block">
    <div className="edu-top">
      <div>
        <h4 className="edu-degree">{edu.degree}</h4>
        <span className="edu-inst">{edu.institution}</span>
      </div>
      <span className="edu-date">{edu.startDate} – {edu.endDate}</span>
    </div>
  </div>
);

const SkillsInline = ({ skills }: { skills: ResumeData['skills'] }) => (
  <div className="skills-inline">
    {skills.map((g, i) => (
      <div key={i} className="skill-line">
        <strong>{g.category}:</strong> {g.items.join(' · ')}
      </div>
    ))}
  </div>
);

const SkillsPills = ({ skills }: { skills: ResumeData['skills'] }) => (
  <div className="skills-pills-wrap">
    {skills.map((g, i) => (
      <div key={i} className="pill-group">
        <div className="pill-cat">{g.category}</div>
        <div className="pill-list">
          {g.items.map((item, j) => <span key={j} className="pill">{item}</span>)}
        </div>
      </div>
    ))}
  </div>
);

const SkillsBars = ({ skills }: { skills: ResumeData['skills'] }) => (
  <div className="skills-bars-wrap">
    {skills.map((g, i) => (
      <div key={i} className="bar-group">
        <div className="bar-cat">{g.category}</div>
        {g.items.map((item, j) => (
          <div key={j} className="bar-item">
            <span className="bar-label">{item}</span>
            <div className="bar-track"><div className="bar-fill" /></div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

/* ──────────────── TEMPLATES ──────────────── */

/* 1 ─ Minimalist: Clean, lots of whitespace */
const Minimalist = ({ data }: { data: ResumeData }) => (
  <div className="tpl tpl-minimalist">
    <header>
      <h1 className="name">{data.bio.name}</h1>
      <h2 className="title">{data.bio.title}</h2>
      <ContactRow data={data} />
      <LinkRow links={data.links} />
    </header>
    {data.bio.summary && <section><SectionTitle>Summary</SectionTitle><p className="summary-text">{data.bio.summary}</p></section>}
    {data.experience.length > 0 && <section><SectionTitle>Experience</SectionTitle>{data.experience.map(e => <ExperienceBlock key={e.id} exp={e} />)}</section>}
    {data.education.length > 0 && <section><SectionTitle>Education</SectionTitle>{data.education.map(e => <EducationBlock key={e.id} edu={e} />)}</section>}
    {data.skills.length > 0 && <section><SectionTitle>Skills</SectionTitle><SkillsInline skills={data.skills} /></section>}
  </div>
);

/* 2 ─ Modern Tech: Split-view — Left sidebar (skills/contact/education), Right main (experience) */
const ModernTech = ({ data }: { data: ResumeData }) => (
  <div className="tpl tpl-modern">
    <div className="mod-sidebar">
      <div className="mod-avatar-area">
        <h1 className="name">{data.bio.name}</h1>
        <h2 className="title">{data.bio.title}</h2>
      </div>
      <div className="mod-section">
        <h3 className="mod-heading">Contact</h3>
        <div className="mod-contact-list">
          {data.bio.email && <div className="mod-contact-item"><span className="mod-icon">✉</span>{data.bio.email}</div>}
          {data.bio.phone && <div className="mod-contact-item"><span className="mod-icon">☎</span>{data.bio.phone}</div>}
          {data.bio.location && <div className="mod-contact-item"><span className="mod-icon">⌖</span>{data.bio.location}</div>}
        </div>
        <LinkRow links={data.links} className="mod-links" />
      </div>
      {data.skills.length > 0 && (
        <div className="mod-section">
          <h3 className="mod-heading">Skills</h3>
          <SkillsPills skills={data.skills} />
        </div>
      )}
      {data.education.length > 0 && (
        <div className="mod-section">
          <h3 className="mod-heading">Education</h3>
          {data.education.map(e => (
            <div key={e.id} className="mod-edu">
              <strong>{e.degree}</strong>
              <div>{e.institution}</div>
              <div className="mod-edu-date">{e.startDate} – {e.endDate}</div>
            </div>
          ))}
        </div>
      )}
    </div>
    <div className="mod-main">
      {data.bio.summary && (
        <section className="mod-main-section">
          <h3 className="mod-main-heading">Profile</h3>
          <p className="summary-text">{data.bio.summary}</p>
        </section>
      )}
      {data.experience.length > 0 && (
        <section className="mod-main-section">
          <h3 className="mod-main-heading">Experience</h3>
          {data.experience.map(e => (
            <div key={e.id} className="mod-exp">
              <div className="mod-exp-top">
                <div>
                  <h4 className="mod-exp-role">{e.role}</h4>
                  <span className="mod-exp-company">{e.company}{e.location ? ` · ${e.location}` : ''}</span>
                </div>
                <span className="mod-exp-date">{e.startDate} – {e.endDate}</span>
              </div>
              <ul className="mod-exp-bullets">
                {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  </div>
);

/* 3 ─ Executive: Traditional, centered header, serif accents */
const Executive = ({ data }: { data: ResumeData }) => (
  <div className="tpl tpl-executive">
    <header className="exec-header">
      <h1 className="name">{data.bio.name}</h1>
      <div className="exec-divider" />
      <h2 className="title">{data.bio.title}</h2>
      <ContactRow data={data} separator="|" />
      <LinkRow links={data.links} />
    </header>
    {data.bio.summary && <section><SectionTitle>Professional Summary</SectionTitle><p className="summary-text">{data.bio.summary}</p></section>}
    {data.experience.length > 0 && <section><SectionTitle>Professional Experience</SectionTitle>{data.experience.map(e => <ExperienceBlock key={e.id} exp={e} />)}</section>}
    {data.education.length > 0 && <section><SectionTitle>Education</SectionTitle>{data.education.map(e => <EducationBlock key={e.id} edu={e} />)}</section>}
    {data.skills.length > 0 && <section><SectionTitle>Core Competencies</SectionTitle><SkillsInline skills={data.skills} /></section>}
  </div>
);

/* 4 ─ Creative: Bold banner + timeline */
const Creative = ({ data }: { data: ResumeData }) => (
  <div className="tpl tpl-creative">
    <div className="cr-banner">
      <h1 className="name">{data.bio.name}</h1>
      <h2 className="title">{data.bio.title}</h2>
      <ContactRow data={data} />
      <LinkRow links={data.links} className="cr-links" />
    </div>
    <div className="cr-body">
      {data.bio.summary && <section><SectionTitle>About Me</SectionTitle><p className="summary-text">{data.bio.summary}</p></section>}
      <div className="cr-grid">
        <div className="cr-main-col">
          {data.experience.length > 0 && (
            <section>
              <SectionTitle>Experience</SectionTitle>
              <div className="cr-timeline">
                {data.experience.map(e => (
                  <div key={e.id} className="cr-tl-item">
                    <div className="cr-tl-dot" />
                    <div className="cr-tl-content">
                      <h4>{e.role}</h4>
                      <span className="cr-tl-company">{e.company}</span>
                      <span className="cr-tl-date">{e.startDate} – {e.endDate}</span>
                      <ul>{e.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <div className="cr-side-col">
          {data.skills.length > 0 && <section><SectionTitle>Skills</SectionTitle><SkillsPills skills={data.skills} /></section>}
          {data.education.length > 0 && (
            <section>
              <SectionTitle>Education</SectionTitle>
              {data.education.map(e => (
                <div key={e.id} className="cr-edu">
                  <strong>{e.degree}</strong>
                  <div>{e.institution}</div>
                  <div className="cr-edu-date">{e.startDate} – {e.endDate}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  </div>
);

/* 5 ─ Elegant: Top accent stripe, subtle layout with skill bars */
const Elegant = ({ data }: { data: ResumeData }) => (
  <div className="tpl tpl-elegant">
    <div className="el-stripe" />
    <header className="el-header">
      <h1 className="name">{data.bio.name}</h1>
      <h2 className="title">{data.bio.title}</h2>
      <ContactRow data={data} />
      <LinkRow links={data.links} />
    </header>
    <div className="el-grid">
      <div className="el-main">
        {data.bio.summary && <section><SectionTitle>Profile</SectionTitle><p className="summary-text">{data.bio.summary}</p></section>}
        {data.experience.length > 0 && <section><SectionTitle>Experience</SectionTitle>{data.experience.map(e => <ExperienceBlock key={e.id} exp={e} />)}</section>}
      </div>
      <div className="el-side">
        {data.skills.length > 0 && <section><SectionTitle>Skills</SectionTitle><SkillsBars skills={data.skills} /></section>}
        {data.education.length > 0 && (
          <section>
            <SectionTitle>Education</SectionTitle>
            {data.education.map(e => (
              <div key={e.id} className="el-edu">
                <strong>{e.degree}</strong>
                <div>{e.institution}</div>
                <div className="el-edu-date">{e.startDate} – {e.endDate}</div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  </div>
);

/* ───────────── Main Export ───────────── */
export default function ResumePreview({ data, templateId, primaryColor }: ResumePreviewProps) {
  const vars = { '--brand': primaryColor } as React.CSSProperties;
  const templates: Record<TemplateId, React.ReactNode> = {
    'minimalist': <Minimalist data={data} />,
    'modern-tech': <ModernTech data={data} />,
    'executive': <Executive data={data} />,
    'creative': <Creative data={data} />,
    'elegant': <Elegant data={data} />,
  };

  return (
    <div className="resume-sheet" style={vars}>
      {templates[templateId]}
    </div>
  );
}
