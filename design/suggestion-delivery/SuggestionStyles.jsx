import React from 'react';

// Shared by Outcome and Leverage Loop so the prototypes stay visually aligned.
export const SuggestionStyles = () => <style>{`  #orbiter-moonshot {
    --orb-page: #080a0b;
    --orb-panel: #0e1420;
    --orb-border: #202d47;
    --orb-text: #f1f3f8;
    --orb-muted: #bfc3ce;
    --orb-why: #14213c;
    --orb-why-border: #456394;
    --orb-why-accent: #8bb4ff;
    --orb-trajectory: #122326;
    --orb-trajectory-border: #2c494c;
    --orb-trajectory-accent: #9dc8c4;
    --orb-sequencing: #211e19;
    --orb-sequencing-border: #4b4131;
    --orb-sequencing-accent: #d5ba89;
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
  #orbiter-moonshot .orb-why-box { padding: 24px 22px; background: var(--orb-why); border: 1px solid var(--orb-why-border); border-radius: calc(var(--orb-radius) - 2px); color: #e5e9f3; line-height: 23px; }
  #orbiter-moonshot .orb-why-box p + p { margin-top: 22px; }
  #orbiter-moonshot .orb-trajectory-section { margin-top: 12px; }
  #orbiter-moonshot .orb-trajectory-note { padding: 12px 14px; background: var(--orb-trajectory); border: 1px solid var(--orb-trajectory-border); border-radius: calc(var(--orb-radius) - 2px); color: #dce8e7; font-size: 14px; line-height: 20px; }
  #orbiter-moonshot .orb-connections { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 20px; margin-top: 10px; }
  #orbiter-moonshot .orb-actions { display: grid; gap: 5px; }
  #orbiter-moonshot .orb-action { min-height: 39px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 6px 14px; background: var(--orb-action); border: 1px solid var(--orb-action-border, #2a5477); border-radius: calc(var(--orb-radius) - 2px); font-size: 14px; line-height: 20px; }
  #orbiter-moonshot .orb-draft-button { flex: none; color: var(--orb-action-accent, #cbd5ec); border: 1px solid var(--orb-action-border, #364872); background: var(--orb-action-button, #1e2b47); padding: 4px 11px; border-radius: 4px; font-size: 10px; line-height: 15px; letter-spacing: 1px; font-weight: 700; }
  #orbiter-moonshot .orb-draft-button:hover, #orbiter-moonshot .orb-draft-button[aria-expanded="true"] { background: var(--orb-action-button, #2b3c61); border-color: var(--orb-action-accent, #6685b7); }
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
      #orbiter-moonshot .orb-recipient-fields { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr)); gap:10px; margin-bottom:10px; }
      #orbiter-moonshot .orb-composer .orb-recipient-field label { margin-top:0; }
      #orbiter-moonshot .orb-recipient-field select { width:100%; border:1px solid #354668; border-radius:6px; background:#111a2b; color:var(--orb-text); padding:10px 12px; font:inherit; font-size:15px; line-height:1.55; }
      #orbiter-moonshot .orb-recipient-field input[readonly] { color:#c6d0e4; }
      #orbiter-moonshot .orb-recipient-field select:focus-visible { outline:2px solid #a8c5ff; outline-offset:2px; }
      @media(max-width:580px) { #orbiter-moonshot .orb-recipient-field select { font-size:16px; } }
      .sample-suggestion-workspace { width:100%; }
      .sample-suggestion-toolbar { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:12px; margin-bottom:12px; font-size:13px; }
      .sample-suggestion-toolbar label { display:flex; align-items:center; gap:8px; }
      .sample-suggestion-toolbar select, .sample-suggestion-toolbar button, .sample-suggestion-toolbar a { background:#101929; color:#e8efff; border:1px solid #364b70; border-radius:6px; padding:7px 10px; font:inherit; cursor:pointer; text-decoration:none; }
      .sample-palette-name { color:#bfc3ce; margin-right:auto; }
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
      #orbiter-moonshot #sample-why .sample-label-icon { color:var(--orb-why-accent); }
      #orbiter-moonshot .orb-why-box { padding:16px 18px; font-size:14px; line-height:22px; border-radius:5px; }
      #orbiter-moonshot .orb-why-headline { margin:0 0 16px; color:#f1f3f8; font-size:16px; line-height:24px; font-weight:700; }
      #orbiter-moonshot .orb-why-headline::after { content:''; display:block; width:34px; height:2px; margin-top:9px; background:var(--orb-why-accent); }
      #orbiter-moonshot .sample-why-section, #orbiter-moonshot .orb-trajectory-section, #orbiter-moonshot .sample-sequencing-section, #orbiter-moonshot .sample-action-section { margin-top:10px; }
      #orbiter-moonshot .orb-trajectory-section .orb-section-title { margin-bottom:7px; }
      #orbiter-moonshot .orb-trajectory-section .sample-label-icon { color:var(--orb-trajectory-accent); }
      #orbiter-moonshot .sample-sequencing-section .sample-label-icon { color:var(--orb-sequencing-accent); }
      #orbiter-moonshot .sample-action-section .sample-label-icon { color:var(--orb-action-accent, #a5bcff); }
      #orbiter-moonshot .orb-trajectory-note { padding:10px 14px; font-size:13px; line-height:20px; border-radius:5px; }
      #orbiter-moonshot .orb-trajectory-panel { position:relative; }
      #orbiter-moonshot .orb-trajectory-summary { display:flex; align-items:center; justify-content:space-between; gap:14px; width:100%; padding:12px 14px; color:#dce8e7; background:var(--orb-trajectory); border:1px solid var(--orb-trajectory-border); border-radius:5px; text-align:left; font-size:14px; line-height:22px; font-weight:700; }
      #orbiter-moonshot .orb-trajectory-summary .sample-arrow-circle { flex:none; }
      #orbiter-moonshot .orb-trajectory-summary .sample-arrow-circle, #orbiter-moonshot .orb-trajectory-toggle { color:var(--orb-trajectory-accent); border-color:var(--orb-trajectory-border); }
      #orbiter-moonshot .orb-trajectory-summary:hover, #orbiter-moonshot .orb-trajectory-toggle:hover { border-color:var(--orb-trajectory-accent); }
      #orbiter-moonshot .orb-trajectory-toggle { position:absolute; top:10px; right:14px; }
      #orbiter-moonshot .orb-trajectory-toggle::before { content:''; position:absolute; inset:-8px; }
      #orbiter-moonshot .orb-trajectory-summary:focus-visible, #orbiter-moonshot .orb-trajectory-toggle:focus-visible { outline:2px solid #a8c5ff; outline-offset:3px; }
      #orbiter-moonshot .orb-trajectory-route:first-child h4 { padding-right:42px; }
      #orbiter-moonshot .orb-trajectory-route + .orb-trajectory-route { margin-top:18px; }
      #orbiter-moonshot .orb-trajectory-route h4 { margin:0 0 12px; color:#dce8e7; font-size:14px; line-height:20px; font-weight:700; }
      #orbiter-moonshot .orb-trajectory-route h4::after { content:''; display:block; width:34px; height:2px; margin-top:9px; background:var(--orb-trajectory-border); }
      #orbiter-moonshot .orb-connections { align-items:stretch; }
      #orbiter-moonshot .orb-sequencing-panel { position:relative; }
      #orbiter-moonshot .orb-sequencing-toggle { position:absolute; top:13px; right:14px; width:24px; height:24px; color:var(--orb-sequencing-accent); border-color:var(--orb-sequencing-border); }
      #orbiter-moonshot .orb-sequencing-toggle:hover { border-color:var(--orb-sequencing-accent); }
      #orbiter-moonshot .orb-sequencing-toggle::before { content:''; position:absolute; inset:-10px; }
      #orbiter-moonshot .orb-sequencing-list { margin:0; padding:16px 54px 16px 38px; background:var(--orb-sequencing); border:1px solid var(--orb-sequencing-border); border-radius:5px; color:#e5dfd5; font-size:14px; line-height:22px; }
      #orbiter-moonshot .orb-sequencing-panel[data-expanded="false"] .orb-sequencing-list { list-style:none; padding:13px 54px 13px 18px; }
      #orbiter-moonshot .orb-sequencing-panel[data-expanded="false"] .orb-sequencing-list li { padding-left:0; }
      #orbiter-moonshot .orb-sequencing-panel[data-expanded="false"] .orb-sequencing-list h4 { margin:0; }
      #orbiter-moonshot .orb-sequencing-list li { padding-left:4px; }
      #orbiter-moonshot .orb-sequencing-list li + li { margin-top:16px; }
      #orbiter-moonshot .orb-sequencing-list li::marker { color:var(--orb-sequencing-accent); font-weight:700; }
      #orbiter-moonshot .orb-sequencing-list h4 { margin:0 0 4px; color:#ede3d3; font-size:14px; line-height:22px; font-weight:700; }
      #orbiter-moonshot .sample-action-section .orb-section-title { margin-bottom:6px; }
      #orbiter-moonshot .orb-actions { gap:6px; }
      #orbiter-moonshot .orb-action { padding:7px 14px; min-height:38px; font-size:13px; border-radius:5px; }
      #orbiter-moonshot .orb-draft-button { padding:3px 8px; font-size:10px; font-weight:400; line-height:15px; letter-spacing:.5px; border-radius:3px; }
      #orbiter-moonshot .orb-action-controls { display:flex; align-items:center; gap:14px; flex:none; margin-left:auto; }
      #orbiter-moonshot .orb-action-toggle { color:var(--orb-action-accent, #b7d0e6); border-color:var(--orb-action-border, #38566b); position:relative; }
      #orbiter-moonshot .orb-action-toggle::before { content:''; position:absolute; inset:-6px; }
      #orbiter-moonshot .orb-action-toggle:hover { background:var(--orb-action-button, #284b5c); border-color:var(--orb-action-accent, #729ab7); }
      #orbiter-moonshot .orb-action-toggle:focus-visible { outline:2px solid #a8c5ff; outline-offset:3px; }
      #orbiter-moonshot .orb-action-options { display:grid; gap:5px; margin:5px 0 8px 18px; padding-left:10px; border-left:1px solid var(--orb-action-border, #2a5477); }
      #orbiter-moonshot .orb-action-option { background:var(--orb-action-option, #102630); border-color:var(--orb-action-border, #274352); padding-right:52px; }
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
    `}</style>;
