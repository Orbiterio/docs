import React, { useState } from 'react';

export const SampleSuggestionData = () => {
  const [editing, setEditing] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [version, setVersion] = useState('earlier');
  const [open, setOpen] = useState({ main: true, lighthouse: false, aila: false, archived: false });
  const [notes, setNotes] = useState({ lighthouse: '', aila: '' });
  const [data, setData] = useState({
    title: 'Ryan Reynolds / Maximum Effort',
    people: [
      { id:'ryan', name:'Ryan Reynolds', role:'Co-Founder @ Maximum Effort', logo:'maximum', company:'Maximum Effort', bio:'Ryan Reynolds is an actor and entrepreneur with three decades of experience in film and television. Recognized by The Wall Street Journal for building a…' },
      { id:'charlie', name:'Charlie Anderson', role:'Head Of Frame.io Partnerships @ Adobe', logo:'adobe', company:'Adobe', bio:'Charlie Anderson is Head of Frame.io Partnerships & Developer Experience at Adobe, where he leads the Partnerships team covering DevX, Partner Success, an…' },
      { id:'kyle', name:'Kyle Jackson', role:'Founder @ Being Human', logo:'being', company:'Being Human', bio:'Kyle Jackson currently serves as Founder at Being Human.' }
    ],
    why: {
      headline: 'Orbiter can turn Maximum Effort’s relationships across film, brands, and sports into its next deal.',
      current: ['Ryan Reynolds perfectly embodies the "Networked Operator" profile: he\'s built a $14+ billion business empire across seven industries and three continents. His 70+ million social media following and systematic approach to digital relationship building could provide unprecedented visibility for Orbiter.io\'s success stories.'],
      earlier: [
        "Maximum Effort is a relationship business wearing a production company's clothes. A small team in New York operates across film and TV development, brand marketing, sports, and adtech simultaneously: a Paramount first-look studio slate, campaign work for Aviation Gin, Mint Mobile and Match, Welcome to Wrexham, and an ongoing services relationship with MNTN, where Reynolds remains chief creative officer.",
        "Every one of those bets was sourced through people, and the value compounds when someone spots that a brand client, a streaming partner, and a talent relationship can be pointed at the same deal. That context currently lives in inboxes, phones, and a handful of heads. Orbiter makes it queryable, surfacing the non-obvious path between a Wrexham sponsor, a Paramount executive, and a portfolio founder before the opportunity closes.",
        "They are also the sharpest possible stress test: if the graph holds across entertainment, consumer, sports, and venture in one org, it holds anywhere. And a Maximum Effort reference converts the entire media-operator ICP."
      ]
    },
    trajectory: 'All three Orbiter.io Founders have close relationships with Charlie Anderson who has collaborated with Ryan many times. Kyle Jackson has relationship at Maximum Effort',
    actions: ['Reach out to Charlie Anderson about showing Ryan', 'Reach out to Kyle Jackson about Maximum Effort']
  });
  const [activeDraft, setActiveDraft] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [drafts, setDrafts] = useState({
    charlie: { subject:'Showing Orbiter to Ryan', message:'Hey Charlie,\n\nWe’ve been thinking about how Orbiter could help the Maximum Effort team connect the dots across their relationships in entertainment, brands, and sports.\n\nGiven your work with Ryan, we’d love your take on whether it would be useful to show him what we’re building. Would you be up for a quick walkthrough first?\n\nThanks!' },
    kyle: { subject:'Orbiter × Maximum Effort', message:'Hey Kyle,\n\nWe’re exploring how Orbiter could help Maximum Effort surface opportunities across the team’s relationships—from brand partnerships to entertainment and sports.\n\nI’d love your perspective on the fit and who at Maximum Effort would be best to speak with. Would you have time for a quick conversation?\n\nThanks!' }
  });
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
  const setDraft = (key, value) => setDrafts(previous => ({ ...previous, [activeDraft]:{ ...previous[activeDraft], [key]:value } }));
  const closeDraft = () => { const trigger = document.getElementById('sample-draft-' + activeDraft); setActiveDraft(null); setCopyStatus(''); if(trigger) trigger.focus(); };
  const copyDraft = async () => {
    try { await navigator.clipboard.writeText('Subject: ' + drafts[activeDraft].subject + '\n\n' + drafts[activeDraft].message); setCopyStatus('Draft copied.'); }
    catch { const field = document.getElementById('sample-message'); if(field) { field.focus(); field.select(); } setCopyStatus('Message selected. Press ⌘C or Ctrl+C to copy.'); }
  };
  return <div className="sample-suggestion-workspace not-prose">
    <style>{`  #orbiter-moonshot {
    --orb-page: #080a0b;
    --orb-panel: #0e1420;
    --orb-border: #202d47;
    --orb-text: #f1f3f8;
    --orb-muted: #bfc3ce;
    --orb-why: #10182e;
    --orb-trajectory: #252f52;
    --orb-action: #193b48;
    --orb-radius: 10px;
    --orb-section-gap: 44px;
    --orb-font-size: 15px;
    --orb-reference: none;
    color-scheme: dark;
    background: var(--orb-page);
    color: var(--orb-text);
    padding: 11px 12px 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    font-size: var(--orb-font-size);
    line-height: 1.5;
    width: 100%;
    box-sizing: border-box;
  }
  #orbiter-moonshot *, #orbiter-moonshot *::before, #orbiter-moonshot *::after { box-sizing: border-box; }
  #orbiter-moonshot [hidden] { display: none !important; }
  #orbiter-moonshot button, #orbiter-moonshot input, #orbiter-moonshot textarea { font: inherit; }
  #orbiter-moonshot button { cursor: pointer; }
  #orbiter-moonshot h1, #orbiter-moonshot h2, #orbiter-moonshot h3, #orbiter-moonshot p { margin: 0; }
  #orbiter-moonshot .orb-frame { border: 1px solid #23262a; border-radius: 19px 19px 0 0; padding: 14px 14px 13px; }
  #orbiter-moonshot .orb-opportunity { background: var(--orb-panel); border: 1px solid var(--orb-border); border-radius: calc(var(--orb-radius) + 3px); position: relative; padding: 12px; }
  #orbiter-moonshot .orb-header { display: flex; align-items: center; gap: 12px; min-height: 26px; padding: 0 4px; }
  #orbiter-moonshot .orb-badge { color: #a8c5ff; border: 1px solid #2e416b; background: #1b2844; padding: 4px 10px; border-radius: 4px; display: inline-flex; align-items: center; gap: 7px; flex: none; font-size: 11px; line-height: 16px; letter-spacing: 1.1px; font-weight: 750; }
  #orbiter-moonshot .orb-badge svg { width: 12px; height: 12px; }
  #orbiter-moonshot .orb-heading { font-size: 16px; line-height: 1.4; font-weight: 700; flex: 1; min-width: 0; }
  #orbiter-moonshot .orb-collapse { color: #c5cfdf; background: transparent; border: 1px solid #293a5a; border-radius: 50%; width: 26px; height: 26px; padding: 5px; flex: none; display: grid; place-items: center; }
  #orbiter-moonshot .orb-collapse svg { width: 13px; height: 13px; transition: transform .18s ease; }
  #orbiter-moonshot .orb-collapse[aria-expanded="true"] svg { transform: rotate(180deg); }
  #orbiter-moonshot .orb-hero-card { margin-top: 12px; }
  #orbiter-moonshot .orb-person { width: 366px; max-width: 100%; padding: 12px 10px 14px; border: 1px solid var(--orb-border); border-radius: var(--orb-radius); background: var(--orb-panel); position: relative; }
  #orbiter-moonshot .orb-person-head { display: flex; align-items: flex-start; gap: 10px; min-width: 0; }
  #orbiter-moonshot .orb-avatar, #orbiter-moonshot .orb-logo { background-image: var(--orb-reference); background-repeat: no-repeat; background-size: 1186px 1161px; flex: none; display: block; }
  #orbiter-moonshot .orb-avatar { width: 54px; height: 54px; border-radius: 50%; }
  #orbiter-moonshot .orb-logo { width: 52px; height: 52px; border-radius: 6px; margin-left: auto; }
  #orbiter-moonshot .orb-ryan { background-position: -51px -90px; }
  #orbiter-moonshot .orb-charlie { background-position: -51px -711px; }
  #orbiter-moonshot .orb-kyle { background-position: -437px -711px; }
  #orbiter-moonshot .orb-maximum { background-position: -343px -90px; }
  #orbiter-moonshot .orb-adobe { background-position: -343px -711px; }
  #orbiter-moonshot .orb-being { background-position: -729px -711px; }
  #orbiter-moonshot .orb-person-copy { min-width: 0; padding-top: 2px; }
  #orbiter-moonshot .orb-person h3 { font-size: 16px; line-height: 22px; font-weight: 700; }
  #orbiter-moonshot .orb-role { font-size: 11.5px; line-height: 18px; color: var(--orb-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  #orbiter-moonshot .orb-bio { color: #d0d2d9; font-size: 14px; line-height: 19px; margin-top: 15px; overflow-wrap: anywhere; }
  #orbiter-moonshot .orb-more { position: absolute; bottom: -7px; right: 20px; width: 29px; height: 13px; border: 0; border-radius: 9px; background: #fcfcff; color: #293554; padding: 0; display: grid; place-items: center; }
  #orbiter-moonshot .orb-more::before { content: ""; position: absolute; inset: -8px -4px; }
  #orbiter-moonshot .orb-more svg { width: 19px; height: 12px; }
  #orbiter-moonshot .orb-section { margin-top: var(--orb-section-gap); }
  #orbiter-moonshot .orb-section-title { display: flex; align-items: center; gap: 9px; padding-left: 12px; font-size: 11px; line-height: 18px; letter-spacing: 2.5px; font-weight: 750; margin-bottom: 10px; }
  #orbiter-moonshot .orb-section-title svg { width: 12px; height: 12px; color: #b6c6e8; flex: none; }
  #orbiter-moonshot .orb-why-box { padding: 24px 22px; background: var(--orb-why); border: 1px solid #304373; border-radius: calc(var(--orb-radius) - 2px); color: #e5e9f3; line-height: 23px; }
  #orbiter-moonshot .orb-why-box p + p { margin-top: 22px; }
  #orbiter-moonshot .orb-trajectory-section { margin-top: 12px; }
  #orbiter-moonshot .orb-trajectory-note { padding: 12px 14px; background: var(--orb-trajectory); border: 1px solid #2e3c64; border-radius: calc(var(--orb-radius) - 2px); color: #eef0fb; font-size: 14px; line-height: 20px; }
  #orbiter-moonshot .orb-connections { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 20px; margin-top: 10px; }
  #orbiter-moonshot .orb-actions { display: grid; gap: 5px; }
  #orbiter-moonshot .orb-action { min-height: 39px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 6px 14px; background: var(--orb-action); border: 1px solid #2a5477; border-radius: calc(var(--orb-radius) - 2px); font-size: 14px; line-height: 20px; }
  #orbiter-moonshot .orb-draft-button { flex: none; color: #cbd5ec; border: 1px solid #364872; background: #1e2b47; padding: 4px 11px; border-radius: 4px; font-size: 10px; line-height: 15px; letter-spacing: 1px; font-weight: 700; }
  #orbiter-moonshot .orb-draft-button:hover, #orbiter-moonshot .orb-draft-button[aria-expanded="true"] { background: #2b3c61; border-color: #6685b7; }
  #orbiter-moonshot .orb-opportunity > .orb-more { right: 24px; }
  #orbiter-moonshot .orb-collapsed { margin-top: 24px; background: var(--orb-panel); border: 1px solid var(--orb-border); border-radius: var(--orb-radius); position: relative; }
  #orbiter-moonshot .orb-summary { width: 100%; padding: 8px 20px; min-height: 36px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 0; background: transparent; border-radius: inherit; color: var(--orb-text); text-align: left; font-size: 14px; line-height: 20px; font-weight: 700; }
  #orbiter-moonshot .orb-summary svg { width: 14px; height: 14px; color: #b7c0d1; }
  #orbiter-moonshot .orb-summary[aria-expanded="true"] svg { transform: rotate(180deg); }
  #orbiter-moonshot .orb-collapsed > .orb-more { right: 46px; background: #29395d; color: #b7c2de; }
  #orbiter-moonshot .orb-notes { padding: 4px 20px 18px; }
  #orbiter-moonshot .orb-notes label { color: var(--orb-muted); font-size: 12px; display: block; margin-bottom: 6px; }
  #orbiter-moonshot .orb-notes textarea, #orbiter-moonshot .orb-composer input, #orbiter-moonshot .orb-composer textarea { width: 100%; border: 1px solid #354668; border-radius: 6px; background: #111a2b; color: var(--orb-text); padding: 10px 12px; resize: vertical; font-size: 15px; line-height: 1.55; }
  #orbiter-moonshot .orb-composer { background: #111b2c; border: 1px solid #3e557c; border-radius: var(--orb-radius); padding: 18px; margin-top: 12px; }
  #orbiter-moonshot .orb-composer-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  #orbiter-moonshot .orb-composer-heading h3 { font-size: 15px; font-weight: 700; }
  #orbiter-moonshot .orb-close { background: transparent; border: 0; padding: 5px; color: #bdc9e0; display: grid; place-items: center; }
  #orbiter-moonshot .orb-close svg { width: 18px; height: 18px; }
  #orbiter-moonshot .orb-composer label { display: block; margin-top: 10px; margin-bottom: 5px; color: #c6d0e4; font-size: 12px; }
  #orbiter-moonshot .orb-composer textarea { min-height: 230px; }
  #orbiter-moonshot .orb-composer-footer { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
  #orbiter-moonshot .orb-copy { border: 1px solid #48608b; background: #263859; color: #edf3ff; font-size: 13px; padding: 7px 12px; border-radius: 5px; }
  #orbiter-moonshot .orb-copy-status { color: #b8c7df; font-size: 12px; }
  #orbiter-moonshot [contenteditable="plaintext-only"] { outline: 1px dashed #6685b7; outline-offset: 3px; border-radius: 2px; cursor: text; }
  #orbiter-moonshot [contenteditable="plaintext-only"]:focus { outline: 2px solid #a8c5ff; }
  #orbiter-moonshot .orb-role[contenteditable="plaintext-only"] { white-space: normal; overflow: visible; }
  @media (max-width: 810px) {
    #orbiter-moonshot .orb-connections { gap: 16px; }
    #orbiter-moonshot .orb-connections .orb-person { width: calc(50% - 8px); }
    #orbiter-moonshot .orb-connections .orb-role { white-space: normal; }
    #orbiter-moonshot .orb-connections .orb-person h3 { font-size: 15px; }
    #orbiter-moonshot .orb-connections .orb-logo { width: 42px; height: 42px; background-size: 957.923px 937.731px; }
    #orbiter-moonshot .orb-connections .orb-adobe { background-position: -277.038px -574.269px; }
    #orbiter-moonshot .orb-connections .orb-being { background-position: -588.808px -574.269px; }
  }
  @media (max-width: 580px) {
    #orbiter-moonshot { padding: 6px; }
    #orbiter-moonshot .orb-frame { padding: 8px; border-radius: 14px; }
    #orbiter-moonshot .orb-opportunity { padding: 12px 10px; }
    #orbiter-moonshot .orb-header { flex-wrap: wrap; gap: 9px; padding: 0; }
    #orbiter-moonshot .orb-heading { order: 3; flex-basis: 100%; font-size: 16px; }
    #orbiter-moonshot .orb-collapse { margin-left: auto; }
    #orbiter-moonshot .orb-hero-card { margin-top: 15px; }
    #orbiter-moonshot .orb-person, #orbiter-moonshot .orb-connections .orb-person { width: 100%; }
    #orbiter-moonshot .orb-role { white-space: normal; }
    #orbiter-moonshot .orb-person-head { gap: 8px; }
    #orbiter-moonshot .orb-person h3 { font-size: 15px; }
    #orbiter-moonshot .orb-section { margin-top: calc(var(--orb-section-gap) * .7); }
    #orbiter-moonshot .orb-trajectory-section { margin-top: 16px; }
    #orbiter-moonshot .orb-why-box { padding: 18px 15px; }
    #orbiter-moonshot .orb-action { flex-wrap: wrap; gap: 9px; padding: 12px; }
    #orbiter-moonshot .orb-action p { flex-basis: 100%; }
    #orbiter-moonshot .orb-draft-button { margin-left: auto; padding: 7px 10px; }
    #orbiter-moonshot .orb-composer { padding: 12px; }
    #orbiter-moonshot .orb-composer input, #orbiter-moonshot .orb-composer textarea, #orbiter-moonshot .orb-notes textarea { font-size: 16px; }
    #orbiter-moonshot .orb-copy-status { overflow-wrap: anywhere; }
  }
  @media (pointer: coarse) {
    #orbiter-moonshot .orb-summary, #orbiter-moonshot .orb-draft-button, #orbiter-moonshot .orb-copy { min-height: 44px; }
    #orbiter-moonshot .orb-more::before { inset: -15px -7px; }
    #orbiter-moonshot .orb-collapse { width: 36px; height: 36px; }
  }
  @media (prefers-reduced-motion: reduce) { #orbiter-moonshot * { transition: none !important; } }
      .sample-suggestion-workspace { width:100%; }
      .sample-suggestion-toolbar { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:12px; font-size:13px; }
      .sample-suggestion-toolbar label { display:flex; align-items:center; gap:8px; }
      .sample-suggestion-toolbar select, .sample-suggestion-toolbar button { background:#101929; color:#e8efff; border:1px solid #364b70; border-radius:6px; padding:7px 10px; font:inherit; cursor:pointer; }
      #orbiter-moonshot { --orb-reference:url('/images/suggestion-delivery/current-ui.png'); padding:0; }
      #orbiter-moonshot .orb-frame { padding:12px; border-radius:24px 24px 0 0; }
      #orbiter-moonshot .orb-opportunity { background:var(--orb-page); padding:0; border-radius:11px; }
      #orbiter-moonshot .orb-header { display:grid; grid-template-columns:1fr auto; padding:10px 16px 12px; min-height:46px; background:var(--orb-panel); border-radius:10px 10px 0 0; border-bottom:1px solid #1b2537; gap:9px 11px; }
      #orbiter-moonshot .orb-heading { grid-column:1 / -1; grid-row:2; font-size:16px; font-weight:600; }
      #orbiter-moonshot .orb-header .orb-badge { justify-self:start; }
      #orbiter-moonshot .orb-header .orb-collapse { grid-column:2; grid-row:1; }
      #orbiter-moonshot .orb-badge { font-size:12px; font-weight:650; padding:4px 7px; line-height:18px; border-radius:8px; letter-spacing:1px; }
      #orbiter-moonshot .orb-collapse { width:24px; height:24px; }
      #orbiter-moonshot .sample-content { padding:10px 10px 11px; }
      #orbiter-moonshot .orb-person { width:367px; min-height:147px; padding:0; }
      #orbiter-moonshot .orb-person-head { padding:8px; min-height:73px; border-bottom:1px solid #282c36; }
      #orbiter-moonshot .orb-person h3 { font-size:14px; line-height:22px; font-weight:600; }
      #orbiter-moonshot .orb-person-copy { padding:0; }
      #orbiter-moonshot .orb-role { font-size:11px; line-height:18px; margin:0; }
      #orbiter-moonshot .orb-bio { margin:0; padding:9px 8px 10px; font-size:13px; line-height:18px; }
      #orbiter-moonshot .orb-avatar, #orbiter-moonshot .orb-logo, #orbiter-moonshot .orb-connections .orb-logo { width:52px; height:52px; background-size:1214px 1013px; }
      #orbiter-moonshot .orb-ryan { background-position:-43px -92px; }
      #orbiter-moonshot .orb-charlie { background-position:-43px -477px; }
      #orbiter-moonshot .orb-kyle { background-position:-431px -477px; }
      #orbiter-moonshot .orb-maximum { background-position:-340px -92px; }
      #orbiter-moonshot .orb-adobe, #orbiter-moonshot .orb-connections .orb-adobe { background-position:-340px -477px; }
      #orbiter-moonshot .orb-being, #orbiter-moonshot .orb-connections .orb-being { background-position:-726px -477px; }
      #orbiter-moonshot .orb-section-title { padding-left:0; gap:5px; font-size:10px; letter-spacing:1.7px; line-height:18px; font-weight:600; }
      #orbiter-moonshot .sample-label-icon { color:#a5bcff; font-size:13px; letter-spacing:0; }
      #orbiter-moonshot .orb-why-box { padding:16px 18px; font-size:14px; line-height:22px; border-radius:5px; }
      #orbiter-moonshot .orb-why-headline { margin:0 0 16px; color:#f1f3f8; font-size:16px; line-height:24px; font-weight:700; }
      #orbiter-moonshot .orb-why-headline::after { content:''; display:block; width:34px; height:2px; margin-top:9px; background:#344b80; }
      #orbiter-moonshot .orb-trajectory-section { margin-top:10px; }
      #orbiter-moonshot .orb-trajectory-section .orb-section-title { margin-bottom:7px; }
      #orbiter-moonshot .orb-trajectory-note { padding:10px 14px; font-size:13px; line-height:20px; border-radius:5px; }
      #orbiter-moonshot .orb-connections { align-items:stretch; }
      #orbiter-moonshot .sample-action-section .orb-section-title { margin-bottom:6px; }
      #orbiter-moonshot .orb-actions { gap:6px; }
      #orbiter-moonshot .orb-action { padding:7px 14px; min-height:38px; font-size:13px; border-radius:5px; }
      #orbiter-moonshot .orb-draft-button { padding:3px 8px; font-size:10px; font-weight:400; line-height:15px; letter-spacing:.5px; border-radius:3px; }
      #orbiter-moonshot .orb-more { width:37px; border:1px solid #293957; background:var(--orb-panel); color:#f5f7fc; font-size:10px; line-height:11px; letter-spacing:3px; padding:0 0 1px 3px; }
      #orbiter-moonshot .orb-opportunity>.orb-more, #orbiter-moonshot .orb-collapsed>.orb-more { right:22px; background:#1d2944; }
      #orbiter-moonshot .orb-summary { padding:11px 16px; min-height:47px; font-weight:600; }
      #orbiter-moonshot .sample-arrow-circle { display:grid; place-items:center; width:24px; height:24px; border:1px solid #2a3d60; border-radius:50%; color:#aabddc; }
      #orbiter-moonshot .sample-chevron { display:block; width:5px; height:5px; border-right:1px solid currentColor; border-bottom:1px solid currentColor; transform:translateY(-1px) rotate(45deg); }
      #orbiter-moonshot .sample-chevron-up { transform:translateY(1px) rotate(225deg); }
      #orbiter-moonshot .sample-archive { display:flex; align-items:center; gap:10px; width:100%; margin-top:16px; border:0; padding:0 8px 4px; background:transparent; color:#a7c6ff; font-size:11px; font-weight:650; letter-spacing:1.5px; }
      #orbiter-moonshot .sample-archive .sample-chevron { transform:rotate(-45deg); margin-right:3px; }
      #orbiter-moonshot .sample-archive .sample-chevron-up { transform:rotate(45deg); }
      #orbiter-moonshot .sample-archive-count { background:#18191c; border-radius:5px; padding:2px 6px; color:#9a9da6; font-size:11px; line-height:15px; letter-spacing:0; }
      #orbiter-moonshot .sample-archive-line { flex:1; height:1px; background:#151719; }
      #orbiter-moonshot .sample-empty { padding:16px 8px; font-size:13px; color:var(--orb-muted); }
      #orbiter-moonshot .orb-close { font-size:20px; }
      @media(max-width:700px) { #orbiter-moonshot .orb-connections .orb-person { width:367px; } #orbiter-moonshot .orb-person { max-width:100%; } #orbiter-moonshot .orb-frame { padding:8px; } #orbiter-moonshot .orb-header { padding:9px 10px; } #orbiter-moonshot .sample-content { padding:10px 8px; } #orbiter-moonshot .orb-role { white-space:normal; } #orbiter-moonshot .orb-action { flex-wrap:wrap; padding:10px; } #orbiter-moonshot .orb-action p { flex-basis:100%; } #orbiter-moonshot .orb-draft-button { margin-left:auto; padding:6px 9px; } }
    `}</style>
    <div className="sample-suggestion-toolbar" aria-label="Sample design controls"><label>Why copy <select aria-label="Why copy" value={version} onChange={event => setVersion(event.target.value)}><option value="earlier">Updated copy</option><option value="current">Original UI</option></select></label><button type="button" aria-pressed={editing} onClick={() => { setEditing(!editing); setEditingCard(null); }}>{editing ? 'Done editing' : 'Edit content'}</button></div>
    <div id="orbiter-moonshot" aria-label="Sample suggestion board"><div className="orb-frame">
      <article className="orb-opportunity">
        <header className="orb-header"><span className="orb-badge"><span aria-hidden="true">♧</span> MOONSHOT</span><h2 className="orb-heading" {...edit(data.title,value => setField('title',value))} /><button className="orb-collapse" type="button" aria-expanded={open.main} aria-controls="sample-main" aria-label={(open.main ? 'Collapse' : 'Expand') + ' Ryan Reynolds opportunity'} onClick={() => toggle('main')}>{arrow(open.main)}</button></header>
        <div className="sample-content" id="sample-main" hidden={!open.main}>
          {personCard(data.people[0])}
          <section className="orb-section" aria-labelledby="sample-why"><h3 className="orb-section-title" id="sample-why"><span className="sample-label-icon" aria-hidden="true">✧</span> WHY</h3><div className="orb-why-box"><h4 className="orb-why-headline" {...edit(data.why.headline,value => setData(previous => ({ ...previous, why:{ ...previous.why, headline:value } })))} />{data.why[version].map((paragraph,index) => <p key={version + index} {...edit(paragraph,value => setData(previous => ({ ...previous, why:{ ...previous.why, [version]:previous.why[version].map((item,position) => position === index ? value : item) } })))} />)}</div></section>
          <section className="orb-trajectory-section" aria-labelledby="sample-trajectory"><h3 className="orb-section-title" id="sample-trajectory"><span className="sample-label-icon" aria-hidden="true">⌁</span> TRAJECTORY</h3><p className="orb-trajectory-note" {...edit(data.trajectory,value => setField('trajectory',value))} /><div className="orb-connections">{data.people.slice(1).map(personCard)}</div></section>
          <section className="orb-section sample-action-section" aria-labelledby="sample-action"><h3 className="orb-section-title" id="sample-action"><span className="sample-label-icon" aria-hidden="true">⊙</span> ACTION</h3><div className="orb-actions">{['charlie','kyle'].map((id,index) => <div className="orb-action" key={id}><p {...edit(data.actions[index],value => setField('actions',data.actions.map((item,position) => position === index ? value : item)))} /><button className="orb-draft-button" type="button" id={'sample-draft-' + id} aria-expanded={activeDraft === id} aria-controls="sample-composer" onClick={() => { setActiveDraft(id); setCopyStatus(''); }}>DRAFT EMAIL</button></div>)}</div>
            {activeDraft && <section className="orb-composer" id="sample-composer" aria-labelledby="sample-composer-title" onKeyDown={event => { if(event.key === 'Escape') closeDraft(); }}><div className="orb-composer-heading"><h3 id="sample-composer-title">Draft to {activeDraft === 'charlie' ? 'Charlie Anderson' : 'Kyle Jackson'}</h3><button type="button" className="orb-close" aria-label="Close email draft" onClick={closeDraft}>×</button></div><label htmlFor="sample-subject">Subject</label><input id="sample-subject" value={drafts[activeDraft].subject} onChange={event => setDraft('subject',event.target.value)} /><label htmlFor="sample-message">Message</label><textarea id="sample-message" value={drafts[activeDraft].message} onChange={event => setDraft('message',event.target.value)} /><div className="orb-composer-footer"><button className="orb-copy" type="button" onClick={copyDraft}>Copy draft</button><span className="orb-copy-status" role="status" aria-live="polite">{copyStatus}</span></div></section>}
          </section>
        </div>
        <button className="orb-more" type="button" aria-label={editing ? 'Finish editing opportunity' : 'Edit opportunity'} aria-pressed={editing} onClick={() => { setEditing(!editing); setEditingCard(null); }}>{editing ? '✓' : '•••'}</button>
      </article>
      {[{ id:'lighthouse', name:'The Lighthouse' },{ id:'aila', name:'AI LA' }].map(item => <section className="orb-collapsed" key={item.id} aria-label={item.name + ' opportunity'}><button className="orb-summary" type="button" aria-expanded={open[item.id]} aria-controls={'sample-' + item.id} onClick={() => toggle(item.id)}><span>{item.name}</span><span className="sample-arrow-circle">{arrow(open[item.id])}</span></button><div className="orb-notes" id={'sample-' + item.id} hidden={!open[item.id]}><label htmlFor={'sample-notes-' + item.id}>Opportunity notes</label><textarea id={'sample-notes-' + item.id} rows={3} placeholder={'Add notes for ' + item.name + '…'} value={notes[item.id]} onChange={event => setNotes(previous => ({ ...previous, [item.id]:event.target.value }))} /></div><button className="orb-more" type="button" aria-label={'Edit ' + item.name + ' notes'} onClick={() => setOpen(previous => ({ ...previous,[item.id]:true }))}>•••</button></section>)}
      <button className="sample-archive" type="button" aria-expanded={open.archived} aria-controls="sample-archived" onClick={() => toggle('archived')}>{arrow(open.archived)} ARCHIVED <span className="sample-archive-count">1</span><span className="sample-archive-line" /></button><p className="sample-empty" id="sample-archived" hidden={!open.archived}>No archived sample provided.</p>
    </div></div>
  </div>;
};
