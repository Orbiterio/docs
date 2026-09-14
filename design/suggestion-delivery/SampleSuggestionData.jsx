import React, { useState } from 'react';
import { defaultPalette } from './palettes.js';
import { sampleDrafts } from './sample-drafts.js';
import { SuggestionStyles } from './SuggestionStyles.jsx';
import { RecipientFields } from './RecipientFields.jsx';
import { selectedContactOption } from './sample-contacts.js';

export const SampleSuggestionData = ({ palette = defaultPalette, showControls = true } = {}) => {
  const [editing, setEditing] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [version, setVersion] = useState('earlier');
  const [open, setOpen] = useState({ main: true, seth: false, lighthouse: false, aila: false, archived: false, trajectory: false, sequencing: false });
  const [notes, setNotes] = useState({ seth: '', lighthouse: '', aila: '' });
  const [data, setData] = useState({
    title: 'Ryan Reynolds / Maximum Effort',
    people: [
      { id:'ryan', name:'Ryan Reynolds', role:'Co-Founder @ Maximum Effort', logo:'maximum', company:'Maximum Effort', bio:'Ryan Reynolds is an actor and entrepreneur with three decades of experience in film and television. Recognized by The Wall Street Journal for building a…' },
      { id:'charlie', name:'Charlie Anderson', role:'Head Of Frame.io Partnerships @ Adobe', logo:'adobe', company:'Adobe', bio:'Charlie Anderson is Head of Frame.io Partnerships & Developer Experience at Adobe, where he leads the Partnerships team covering DevX, Partner Success, an…' },
      { id:'kyle', name:'Kyle Jackson', role:'Founder @ Being Human', logo:'being', company:'Being Human', bio:'Kyle Jackson currently serves as Founder at Being Human.' }
    ],
    why: {
      headline: 'Orbiter.io can turn Maximum Effort’s relationships across film, brands, and sports into its next deal.',
      current: ['Ryan Reynolds perfectly embodies the "Networked Operator" profile: he\'s built a $14+ billion business empire across seven industries and three continents. His 70+ million social media following and systematic approach to digital relationship building could provide unprecedented visibility for Orbiter.io\'s success stories.'],
      earlier: [
        "Maximum Effort is a relationship business wearing a production company's clothes. A small team in New York operates across film and TV development, brand marketing, sports, and adtech simultaneously: a Paramount first-look studio slate, campaign work for Aviation Gin, Mint Mobile and Match, Welcome to Wrexham, and an ongoing services relationship with MNTN, where Reynolds remains chief creative officer.",
        "Every one of those bets was sourced through people, and the value compounds when someone spots that a brand client, a streaming partner, and a talent relationship can be pointed at the same deal. That context currently lives in inboxes, phones, and a handful of heads. Orbiter makes it queryable, surfacing the non-obvious path between a Wrexham sponsor, a Paramount executive, and a portfolio founder before the opportunity closes.",
        "They are also the sharpest possible stress test: if the graph holds across entertainment, consumer, sports, and venture in one org, it holds anywhere. And a Maximum Effort reference converts the entire media-operator ICP."
      ]
    },
    trajectory: [
      { id:'charlie', title:'Charlie Anderson', text:'All three Orbiter.io founders have close relationships with Charlie Anderson, the cinematographer for Ryan Reynolds’s Mint Mobile commercials produced by Maximum Effort. Charlie’s work with Ryan creates an opening to show how Orbiter.io could help the team connect opportunities across its relationships. Start by giving Charlie a walkthrough and asking whether he would be comfortable introducing the product to Ryan.' },
      { id:'kyle', title:'Kyle Jackson', text:'Kyle Jackson provides a separate route through his relationship at Maximum Effort. Ask Kyle who on the team is best placed to explore Orbiter.io and whether he can make an introduction. This route can open a conversation about how the company manages relationships across brand campaigns, entertainment, and sports.' }
    ],
    sequencing: [
      { id:'charlie-first', title:'Start with Charlie', text:'Charlie’s direct work with Ryan and close relationships with all three founders make him the strongest first conversation. Give him a short walkthrough, get his read on the fit, and ask whether he would be comfortable introducing Orbiter.io to Ryan.' },
      { id:'kyle-next', title:'Bring Kyle in with context', text:'After speaking with Charlie, ask Kyle who at Maximum Effort would be best placed to evaluate Orbiter.io. Share what is already in motion. If Charlie cannot make an introduction or the timing is uncertain, explore Kyle’s connection as the next route.' },
      { id:'coordinate', title:'Coordinate one introduction', text:'Agree on who will make the introduction and whether the first demo should be for Ryan or a member of the Maximum Effort team. Follow up through that connector and keep the other informed, so both relationships support one coordinated approach.' }
    ],
    actions: ['Reach out to Charlie Anderson about showing Ryan', 'Reach out to Kyle Jackson about Maximum Effort']
  });
  const [activeDraft, setActiveDraft] = useState(null);
  const [openActions, setOpenActions] = useState({ charlie:false, kyle:false });
  const [copyStatus, setCopyStatus] = useState('');
  const [recipientSelections, setRecipientSelections] = useState({});
  const [drafts, setDrafts] = useState(sampleDrafts);
  const draftKey = activeDraft ? activeDraft.personId + '-' + activeDraft.channel : null;
  const draftPerson = activeDraft ? data.people.find(person => person.id === activeDraft.personId) : null;
  const draftTitle = activeDraft ? (activeDraft.channel === 'sms' ? 'SMS to ' : 'Email to ') + draftPerson.name : '';
  const toggle = key => setOpen(previous => ({ ...previous, [key]: !previous[key] }));
  const edit = (text, save, enabled = editing) => ({ children:text, contentEditable:enabled ? 'plaintext-only' : false, suppressContentEditableWarning:true, onBlur:event => { if(enabled) save(event.currentTarget.textContent); } });
  const setField = (key, value) => setData(previous => ({ ...previous, [key]:value }));
  const setPerson = (id, key, value) => setData(previous => ({ ...previous, people:previous.people.map(person => person.id === id ? { ...person, [key]:value } : person) }));
  const arrow = expanded => <span className={'sample-chevron' + (expanded ? ' sample-chevron-up' : '')} aria-hidden="true" />;
  const personCard = person => {
    const enabled = editing || editingCard === person.id;
    return <article className="orb-person" key={person.id} aria-label={person.name + ' profile'}>
      <div className="orb-person-head">
        <span className={'orb-avatar orb-' + person.id} role="img" aria-label={person.name} />
        <div className="orb-person-copy"><h3 {...edit(person.name, value => setPerson(person.id,'name',value), enabled)} /><p className="orb-role" {...edit(person.role, value => setPerson(person.id,'role',value), enabled)} /></div>
        <span className={'orb-logo orb-' + person.logo} role="img" aria-label={person.company + ' logo'} />
      </div>
      <p className="orb-bio" {...edit(person.bio, value => setPerson(person.id,'bio',value), enabled)} />
      <button className="orb-more" type="button" aria-label={(enabled ? 'Finish editing ' : 'Edit ') + person.name + ' profile'} aria-pressed={enabled} onClick={() => { if(editing) setEditing(false); setEditingCard(enabled ? null : person.id); }}>{enabled ? '✓' : '•••'}</button>
    </article>;
  };
  const setDraft = (key, value) => setDrafts(previous => ({ ...previous, [draftKey]:{ ...previous[draftKey], [key]:value } }));
  const openDraft = (personId, channel) => { setActiveDraft({ personId, channel }); setCopyStatus(''); };
  const closeDraft = () => { const trigger = document.getElementById('sample-draft-' + draftKey); setActiveDraft(null); setCopyStatus(''); if(trigger) trigger.focus(); };
  const toggleActions = personId => {
    if(openActions[personId] && activeDraft?.personId === personId && activeDraft.channel !== 'email') {
      setActiveDraft(null);
      setCopyStatus('');
    }
    setOpenActions(previous => ({ ...previous, [personId]:!previous[personId] }));
  };
  const copyDraft = async () => {
    const draft = drafts[draftKey];
    const recipient = selectedContactOption(activeDraft.personId, activeDraft.channel, recipientSelections);
    try { await navigator.clipboard.writeText('To: ' + recipient + '\n' + (activeDraft.channel === 'email' ? 'Subject: ' + draft.subject + '\n' : '') + '\n' + draft.message); setCopyStatus('Draft copied.'); }
    catch { const field = document.getElementById('sample-message'); if(field) { field.focus(); field.select(); } setCopyStatus('Message selected. Press ⌘C or Ctrl+C to copy.'); }
  };
  return <div className="sample-suggestion-workspace not-prose">
    <SuggestionStyles />
    {showControls && <div className="sample-suggestion-toolbar" aria-label="Sample design controls">{palette && <span className="sample-palette-name">Palette: {palette.name}</span>}<a href="/palettes.html" target="_blank" rel="noreferrer">Palette options</a><label>Why copy <select aria-label="Why copy" value={version} onChange={event => setVersion(event.target.value)}><option value="earlier">Updated copy</option><option value="current">Original UI</option></select></label><button type="button" aria-pressed={editing} onClick={() => { setEditing(!editing); setEditingCard(null); }}>{editing ? 'Done editing' : 'Edit content'}</button></div>}
    <div id="orbiter-moonshot" style={palette?.colors} aria-label="Sample suggestion board"><div className="orb-frame">
      <article className="orb-opportunity">
        <header className="orb-header"><span className="orb-badge"><span aria-hidden="true">♧</span> MOONSHOT</span><h2 className="orb-heading" {...edit(data.title,value => setField('title',value))} /><button className="orb-collapse" type="button" aria-expanded={open.main} aria-controls="sample-main" aria-label={(open.main ? 'Collapse' : 'Expand') + ' Ryan Reynolds opportunity'} onClick={() => toggle('main')}>{arrow(open.main)}</button></header>
        <div className="sample-content" id="sample-main" hidden={!open.main}>
          {personCard(data.people[0])}
          <section className="orb-section sample-why-section" aria-labelledby="sample-why"><h3 className="orb-section-title" id="sample-why"><span className="sample-label-icon" aria-hidden="true">✧</span> WHY</h3><div className="orb-why-box"><h4 className="orb-why-headline" {...edit(data.why.headline,value => setData(previous => ({ ...previous, why:{ ...previous.why, headline:value } })))} />{data.why[version].map((paragraph,index) => <p key={version + index} {...edit(paragraph,value => setData(previous => ({ ...previous, why:{ ...previous.why, [version]:previous.why[version].map((item,position) => position === index ? value : item) } })))} />)}</div></section>
          <section className="orb-trajectory-section" aria-labelledby="sample-trajectory">
            <h3 className="orb-section-title" id="sample-trajectory"><span className="sample-label-icon" aria-hidden="true">⌁</span> TRAJECTORY</h3>
            <div className="orb-trajectory-panel">
              <button className={open.trajectory ? 'orb-collapse orb-trajectory-toggle' : 'orb-trajectory-summary'} type="button" aria-expanded={open.trajectory} aria-controls="sample-trajectory-content" aria-label={(open.trajectory ? 'Collapse trajectory' : 'Expand trajectory: ' + data.trajectory.map(route => route.title).join(' & '))} onClick={() => toggle('trajectory')}>
                {!open.trajectory && <span>{data.trajectory.map(route => route.title).join(' & ')}</span>}
                <span className={open.trajectory ? undefined : 'sample-arrow-circle'}>{arrow(open.trajectory)}</span>
              </button>
              <div id="sample-trajectory-content" hidden={!open.trajectory}>
                <div className="orb-trajectory-note">
                  {data.trajectory.map(route => <section className="orb-trajectory-route" key={route.id} aria-labelledby={'sample-route-' + route.id}>
                    <h4 id={'sample-route-' + route.id} {...edit(route.title,value => setData(previous => ({ ...previous, trajectory:previous.trajectory.map(item => item.id === route.id ? { ...item, title:value } : item) })))} />
                    <p {...edit(route.text,value => setData(previous => ({ ...previous, trajectory:previous.trajectory.map(item => item.id === route.id ? { ...item, text:value } : item) })))} />
                  </section>)}
                </div>
                <div className="orb-connections">{data.people.slice(1).map(personCard)}</div>
              </div>
            </div>
          </section>
          <section className="orb-section sample-sequencing-section" aria-labelledby="sample-sequencing">
            <h3 className="orb-section-title" id="sample-sequencing"><span className="sample-label-icon" aria-hidden="true">↳</span> SUGGESTED SEQUENCING</h3>
            <div className="orb-sequencing-panel" data-expanded={open.sequencing}>
              <button className="orb-collapse orb-sequencing-toggle" type="button" aria-expanded={open.sequencing} aria-controls="sample-sequencing-content" aria-label={(open.sequencing ? 'Collapse' : 'Expand') + ' suggested sequencing'} onClick={() => toggle('sequencing')}>{arrow(open.sequencing)}</button>
              <ol className="orb-sequencing-list" id="sample-sequencing-content">
                {data.sequencing.map((step,index) => <li key={step.id} hidden={!open.sequencing && index > 0}>
                  <h4 {...edit(step.title,value => setData(previous => ({ ...previous, sequencing:previous.sequencing.map(item => item.id === step.id ? { ...item, title:value } : item) })))} />
                  <p hidden={!open.sequencing} {...edit(step.text,value => setData(previous => ({ ...previous, sequencing:previous.sequencing.map(item => item.id === step.id ? { ...item, text:value } : item) })))} />
                </li>)}
              </ol>
            </div>
          </section>
          <section className="orb-section sample-action-section" aria-labelledby="sample-action">
            <h3 className="orb-section-title" id="sample-action"><span className="sample-label-icon" aria-hidden="true">⊙</span> ACTION</h3>
            <div className="orb-actions">
              {data.people.slice(1).map((person,index) => <div className="orb-action-group" key={person.id}>
                <div className="orb-action">
                  <p {...edit(data.actions[index],value => setField('actions',data.actions.map((item,position) => position === index ? value : item)))} />
                  <div className="orb-action-controls">
                    <button className="orb-draft-button" type="button" id={'sample-draft-' + person.id + '-email'} aria-label={'Draft email to ' + person.name} aria-expanded={draftKey === person.id + '-email'} aria-controls="sample-composer" onClick={() => openDraft(person.id,'email')}>DRAFT EMAIL</button>
                    <button className="orb-collapse orb-action-toggle" type="button" aria-label={(openActions[person.id] ? 'Hide' : 'Show') + ' more actions for ' + person.name} aria-expanded={openActions[person.id]} aria-controls={'sample-actions-' + person.id} onClick={() => toggleActions(person.id)}>{arrow(openActions[person.id])}</button>
                  </div>
                </div>
                <div className="orb-action-options" id={'sample-actions-' + person.id} hidden={!openActions[person.id]}>
                  <div className="orb-action orb-action-option">
                    <p>Text {person.name}</p>
                    <button className="orb-draft-button" type="button" id={'sample-draft-' + person.id + '-sms'} aria-label={'Draft SMS to ' + person.name} aria-expanded={draftKey === person.id + '-sms'} aria-controls="sample-composer" onClick={() => openDraft(person.id,'sms')}>DRAFT SMS</button>
                  </div>
                </div>
              </div>)}
            </div>
            {activeDraft && <section className="orb-composer" key={draftKey} id="sample-composer" aria-labelledby="sample-composer-title" onKeyDown={event => { if(event.key === 'Escape') closeDraft(); }}>
              <div className="orb-composer-heading"><h3 id="sample-composer-title">{draftTitle}</h3><button type="button" className="orb-close" aria-label="Close draft" onClick={closeDraft}>×</button></div>
              <RecipientFields personIds={[activeDraft.personId]} channel={activeDraft.channel} selections={recipientSelections} onSelect={(key, value) => { setRecipientSelections(previous => ({ ...previous, [key]: value })); setCopyStatus(''); }} />
              {activeDraft.channel === 'email' && <><label htmlFor="sample-subject">Subject</label><input id="sample-subject" autoFocus value={drafts[draftKey].subject} onChange={event => setDraft('subject',event.target.value)} /></>}
              <label htmlFor="sample-message">Message</label>
              <textarea id="sample-message" autoFocus={activeDraft.channel !== 'email'} value={drafts[draftKey].message} onChange={event => setDraft('message',event.target.value)} />
              <div className="orb-composer-footer"><button className="orb-copy" type="button" onClick={copyDraft}>Copy draft</button><span className="orb-copy-status" role="status" aria-live="polite">{copyStatus}</span></div>
            </section>}
          </section>
        </div>
        <button className="orb-more" type="button" aria-label={editing ? 'Finish editing opportunity' : 'Edit opportunity'} aria-pressed={editing} onClick={() => { setEditing(!editing); setEditingCard(null); }}>{editing ? '✓' : '•••'}</button>
      </article>
      {[{ id:'seth', name:'Seth Rogen / Point Grey Pictures' },{ id:'lighthouse', name:'The Lighthouse' },{ id:'aila', name:'AI LA' }].map(item => <section className="orb-collapsed" key={item.id} aria-label={item.name + ' opportunity'}><button className="orb-summary" type="button" aria-expanded={open[item.id]} aria-controls={'sample-' + item.id} onClick={() => toggle(item.id)}><span>{item.name}</span><span className="sample-arrow-circle">{arrow(open[item.id])}</span></button><div className="orb-notes" id={'sample-' + item.id} hidden={!open[item.id]}><label htmlFor={'sample-notes-' + item.id}>Opportunity notes</label><textarea id={'sample-notes-' + item.id} rows={3} placeholder={'Add notes for ' + item.name + '…'} value={notes[item.id]} onChange={event => setNotes(previous => ({ ...previous, [item.id]:event.target.value }))} /></div><button className="orb-more" type="button" aria-label={'Edit ' + item.name + ' notes'} onClick={() => setOpen(previous => ({ ...previous,[item.id]:true }))}>•••</button></section>)}
      <button className="sample-archive" type="button" aria-expanded={open.archived} aria-controls="sample-archived" onClick={() => toggle('archived')}>{arrow(open.archived)} ARCHIVED <span className="sample-archive-count">1</span><span className="sample-archive-line" /></button><p className="sample-empty" id="sample-archived" hidden={!open.archived}>No archived sample provided.</p>
    </div></div>
  </div>;
};
