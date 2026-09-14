import React, { useRef, useState } from 'react';
import { defaultPalette } from './palettes.js';
import { SuggestionStyles } from './SuggestionStyles.jsx';
import { leverageData, leverageDrafts } from './leverage-data.js';

const Arrow = ({ open }) => <span className={'sample-chevron' + (open ? ' sample-chevron-up' : '')} aria-hidden="true" />;
const asset = name => '/assets/leverage-loop/' + name + '.png';
const contactActions = [
  { key: 'email', name: 'Ethan Jacks', channel: 'email' },
  { key: 'sms', name: 'Ethan Jacks', channel: 'sms' },
  { key: 'katelyn-email', name: 'Katelyn Gallanty', channel: 'email' },
  { key: 'katelyn-sms', name: 'Katelyn Gallanty', channel: 'sms' }
];

export const LeverageLoop = () => {
  const [data, setData] = useState(leverageData);
  const [editing, setEditing] = useState(false);
  const [editingPerson, setEditingPerson] = useState(false);
  const [open, setOpen] = useState({ main: true, actions: false, rebekah: false, bilawal: false });
  const [notes, setNotes] = useState({ rebekah: '', bilawal: '' });
  const [activeDraft, setActiveDraft] = useState(null);
  const [introStep, setIntroStep] = useState('katelyn');
  const [drafts, setDrafts] = useState(leverageDrafts);
  const [copyStatus, setCopyStatus] = useState('');
  const triggerRef = useRef(null);
  const draftKey = activeDraft === 'intro' ? introStep : activeDraft;
  const draft = drafts[draftKey];
  const draftContact = contactActions.find(action => action.key === activeDraft);
  const toggle = key => setOpen(previous => ({ ...previous, [key]: !previous[key] }));
  const edit = (text, save, enabled = editing) => ({ children: text, contentEditable: enabled ? 'plaintext-only' : false, suppressContentEditableWarning: true, onBlur: event => { if (enabled) save(event.currentTarget.textContent); } });
  const setField = (key, value) => setData(previous => ({ ...previous, [key]: value }));
  const editPerson = (key, value) => setData(previous => ({ ...previous, person: { ...previous.person, [key]: value } }));
  const openDraft = (type, event) => { triggerRef.current = event.currentTarget; setActiveDraft(type); setCopyStatus(''); };
  const closeDraft = () => { setActiveDraft(null); setCopyStatus(''); triggerRef.current?.focus(); };
  const toggleActions = () => { if (open.actions && activeDraft && activeDraft !== 'intro') { setActiveDraft(null); setCopyStatus(''); } toggle('actions'); };
  const setDraft = (key, value) => { setDrafts(previous => ({ ...previous, [draftKey]: { ...previous[draftKey], [key]: value } })); setCopyStatus(''); };
  const copyDraft = async () => {
    try { await navigator.clipboard.writeText((draft.subject ? 'Subject: ' + draft.subject + '\n\n' : '') + draft.message); setCopyStatus('Draft copied.'); }
    catch { const message = document.getElementById('loop-message'); message?.focus(); message?.select(); setCopyStatus('Message selected. Press ⌘C or Ctrl+C to copy.'); }
  };
  return <div className="sample-suggestion-workspace not-prose">
    <SuggestionStyles />
    <style>{`
      #orbiter-moonshot .loop-context { display:flex; align-items:center; gap:10px; padding:2px 4px 14px; }
      #orbiter-moonshot .loop-context img { width:32px; height:32px; object-fit:cover; border-radius:50%; border:1px solid var(--orb-border); }
      #orbiter-moonshot .loop-context p { color:var(--orb-muted); font-size:13px; line-height:20px; }
      #orbiter-moonshot .loop-context strong { color:var(--orb-text); font-weight:600; }
      #orbiter-moonshot img.orb-avatar, #orbiter-moonshot img.orb-logo { background:none; object-fit:cover; border:1px solid #34415b; }
      #orbiter-moonshot .loop-bio > span { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
      #orbiter-moonshot .loop-bio > span[contenteditable="plaintext-only"] { display:block; overflow:visible; }
      #orbiter-moonshot .loop-other-content { padding:4px 16px 16px; }
      #orbiter-moonshot .loop-other-person { display:flex; align-items:center; gap:10px; margin-bottom:12px; font-size:14px; }
      #orbiter-moonshot .loop-other-content .orb-notes { padding:0; }
      #orbiter-moonshot .loop-draft-stages { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
      #orbiter-moonshot .loop-draft-stages button { border:1px solid #354668; border-radius:5px; background:#0e1727; color:var(--orb-muted); padding:7px 11px; font-size:12px; }
      #orbiter-moonshot .loop-draft-stages button[aria-pressed="true"] { color:var(--orb-action-accent); border-color:var(--orb-action-border); background:var(--orb-action); }
      #orbiter-moonshot .loop-draft-hint { color:var(--orb-muted); font-size:13px; line-height:20px; }
      #orbiter-moonshot button:focus-visible { outline:2px solid var(--orb-why-accent); outline-offset:3px; }
      #orbiter-moonshot input:focus-visible, #orbiter-moonshot textarea:focus-visible { outline:2px solid var(--orb-why-accent); outline-offset:2px; }
      @media(max-width:700px) { #orbiter-moonshot .loop-context { align-items:flex-start; padding:2px 2px 12px; } }
    `}</style>
    <div className="sample-suggestion-toolbar" aria-label="Leverage Loop design controls">
      <span className="sample-palette-name">Palette: {defaultPalette.name}</span>
      <a href="http://localhost:3002/" target="_blank" rel="noreferrer">Outcome design</a>
      <button type="button" aria-pressed={editing} onClick={() => { setEditing(!editing); setEditingPerson(false); }}>{editing ? 'Done editing' : 'Edit content'}</button>
    </div>
    <div id="orbiter-moonshot" style={defaultPalette.colors} aria-label="Leverage Loop suggestion board"><div className="orb-frame">
      <div className="loop-context"><img src={asset('katelyn')} alt="Katelyn Gallanty" /><p>Find people in my network to introduce to <strong>Katelyn Gallanty</strong></p></div>
      <article className="orb-opportunity">
        <header className="orb-header">
          <span className="orb-badge"><span aria-hidden="true">⟳</span> LEVERAGE LOOP</span>
          <h2 className="orb-heading" {...edit(data.title, value => setField('title', value))} />
          <button className="orb-collapse" type="button" aria-expanded={open.main} aria-controls="loop-main" aria-label={(open.main ? 'Collapse' : 'Expand') + ' Ethan Jacks match'} onClick={() => { if (open.main) setActiveDraft(null); toggle('main'); }}><Arrow open={open.main} /></button>
        </header>
        <div className="sample-content" id="loop-main" hidden={!open.main}>
          <article className="orb-person" aria-label="Ethan Jacks profile">
            <div className="orb-person-head">
              <img className="orb-avatar" src={asset('ethan')} alt="Ethan Jacks" />
              <div className="orb-person-copy"><h3 {...edit(data.person.name, value => editPerson('name', value), editing || editingPerson)} /><p className="orb-role" {...edit(data.person.role, value => editPerson('role', value), editing || editingPerson)} /></div>
              <img className="orb-logo" src={asset('mediabridge')} alt="MediaBridge Capital Advisors" />
            </div>
            <p className="orb-bio loop-bio"><span {...edit(data.person.bio, value => editPerson('bio', value), editing || editingPerson)} /></p>
            <button className="orb-more" type="button" aria-label={(editing || editingPerson ? 'Finish editing' : 'Edit') + ' Ethan Jacks profile'} aria-pressed={editing || editingPerson} onClick={() => { const enabled = editing || editingPerson; setEditing(false); setEditingPerson(!enabled); }}>{editing || editingPerson ? '✓' : '•••'}</button>
          </article>
          <section className="orb-section sample-why-section" aria-labelledby="sample-why">
            <h3 className="orb-section-title" id="sample-why"><span className="sample-label-icon" aria-hidden="true">✧</span> WHY</h3>
            <div className="orb-why-box"><h4 className="orb-why-headline" {...edit(data.headline, value => setField('headline', value))} />{data.why.map((paragraph, index) => <p key={index} {...edit(paragraph, value => setData(previous => ({ ...previous, why: previous.why.map((item, position) => position === index ? value : item) })))} />)}</div>
          </section>
          <section className="orb-section sample-action-section" aria-labelledby="loop-action">
            <h3 className="orb-section-title" id="loop-action"><span className="sample-label-icon" aria-hidden="true">⊙</span> ACTION</h3>
            <div className="orb-actions"><div className="orb-action-group">
              <div className="orb-action"><p {...edit(data.action, value => setField('action', value))} /><div className="orb-action-controls">
                <button className="orb-draft-button" type="button" aria-label="Make introduction" aria-expanded={activeDraft === 'intro'} aria-controls="loop-composer" onClick={event => openDraft('intro', event)}>MAKE INTRO</button>
                <button className="orb-collapse orb-action-toggle" type="button" aria-label={(open.actions ? 'Hide' : 'Show') + ' more actions for Ethan Jacks'} aria-expanded={open.actions} aria-controls="loop-action-options" onClick={toggleActions}><Arrow open={open.actions} /></button>
              </div></div>
              <div className="orb-action-options" id="loop-action-options" hidden={!open.actions}>
                {contactActions.map(action => <div className="orb-action orb-action-option" key={action.key}>
                  <p>{action.channel === 'sms' ? 'Text' : 'Email'} {action.name}</p>
                  <button className="orb-draft-button" type="button" aria-label={'Draft ' + (action.channel === 'sms' ? 'SMS' : 'email') + ' to ' + action.name} aria-expanded={activeDraft === action.key} aria-controls="loop-composer" onClick={event => openDraft(action.key, event)}>{action.channel === 'sms' ? 'DRAFT SMS' : 'DRAFT EMAIL'}</button>
                </div>)}
              </div>
            </div></div>
            {activeDraft && <section className="orb-composer" id="loop-composer" aria-labelledby="loop-composer-title" onKeyDown={event => { if (event.key === 'Escape') closeDraft(); }}>
              <div className="orb-composer-heading"><h3 id="loop-composer-title">{activeDraft === 'intro' ? 'Double opt-in introduction' : (draftContact.channel === 'sms' ? 'SMS' : 'Email') + ' to ' + draftContact.name}</h3><button className="orb-close" type="button" aria-label="Close draft" onClick={closeDraft}>×</button></div>
              {activeDraft === 'intro' && <><div className="loop-draft-stages" role="group" aria-label="Introduction drafts">{[['katelyn', '1. Ask Katelyn'], ['ethan', '2. Ask Ethan'], ['introduction', '3. Introduction']].map(([key, label]) => <button type="button" key={key} aria-pressed={introStep === key} onClick={() => { setIntroStep(key); setCopyStatus(''); }}>{label}</button>)}</div><p className="loop-draft-hint">{introStep === 'introduction' ? 'Use this introduction after both Katelyn and Ethan agree to connect.' : 'Check with each person before making the introduction.'}</p></>}
              <div key={draftKey}>
                {draft.subject !== undefined && <><label htmlFor="loop-subject">Subject</label><input id="loop-subject" autoFocus value={draft.subject} onChange={event => setDraft('subject', event.target.value)} /></>}
                <label htmlFor="loop-message">Message</label><textarea id="loop-message" autoFocus={draft.subject === undefined} value={draft.message} onChange={event => setDraft('message', event.target.value)} />
              </div>
              <div className="orb-composer-footer"><button className="orb-copy" type="button" onClick={copyDraft}>Copy draft</button><span className="orb-copy-status" role="status" aria-live="polite">{copyStatus}</span></div>
            </section>}
          </section>
        </div>
        <button className="orb-more" type="button" aria-label={editing ? 'Finish editing match' : 'Edit match'} aria-pressed={editing} onClick={() => { setEditing(!editing); setEditingPerson(false); }}>{editing ? '✓' : '•••'}</button>
      </article>
      {data.otherMatches.map(item => <section className="orb-collapsed" key={item.id} aria-label={item.name + ' match'}>
        <button className="orb-summary" type="button" aria-expanded={open[item.id]} aria-controls={'loop-' + item.id} onClick={() => toggle(item.id)}><span>{item.title}</span><span className="sample-arrow-circle"><Arrow open={open[item.id]} /></span></button>
        <div className="loop-other-content" id={'loop-' + item.id} hidden={!open[item.id]}><div className="loop-other-person"><img className="orb-avatar" src={asset(item.id)} alt={item.name} /><strong>{item.name}</strong></div><div className="orb-notes"><label htmlFor={'loop-notes-' + item.id}>Match notes</label><textarea id={'loop-notes-' + item.id} rows={3} placeholder={'Add the WHY for introducing ' + item.name + ' to Katelyn…'} value={notes[item.id]} onChange={event => setNotes(previous => ({ ...previous, [item.id]: event.target.value }))} /></div></div>
        <button className="orb-more" type="button" aria-label={'Edit ' + item.name + ' notes'} onClick={() => setOpen(previous => ({ ...previous, [item.id]: true }))}>•••</button>
      </section>)}
    </div></div>
  </div>;
};
