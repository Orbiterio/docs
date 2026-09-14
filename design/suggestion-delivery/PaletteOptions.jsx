import React from 'react';
import { palettes } from './palettes.js';

const Chevron = () => <span className="palette-chevron" aria-hidden="true" />;

export const PaletteOptions = () => <div className="palette-workspace">
  <style>{`
    .palette-workspace { --page:#080a0b; color:#edf0f8; max-width:1280px; margin:0 auto; padding:26px 20px 40px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif; }
    .palette-workspace * { box-sizing:border-box; }
    .palette-page-header { margin-bottom:24px; display:flex; align-items:flex-end; justify-content:space-between; gap:24px; }
    .palette-eyebrow { margin:0 0 10px; color:#98a7bc; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; }
    .palette-page-header h1 { margin:0 0 8px; font-size:30px; line-height:1.2; font-weight:650; letter-spacing:-.7px; }
    .palette-page-header p:last-child { margin:0; color:#b4bfce; font-size:14px; line-height:1.6; max-width:690px; }
    .palette-back { flex:none; color:#b7c8e4; font-size:13px; text-decoration:none; border-bottom:1px solid #40506a; padding:5px 0; }
    .palette-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }
    .palette-card { min-width:0; background:#0d1015; border:1px solid #2a303b; border-radius:13px; overflow:hidden; }
    .palette-card-header { display:flex; align-items:flex-start; gap:12px; padding:20px 20px 17px; }
    .palette-number { color:#8d9ab0; border:1px solid #333c4b; border-radius:7px; padding:6px; font-size:11px; letter-spacing:1px; }
    .palette-card h2 { margin:0 0 5px; color:#f1f3f8; font-size:18px; line-height:21px; font-weight:650; }
    .palette-description { margin:0; color:#aeb8c9; font-size:12px; line-height:18px; }
    .palette-sample { padding:0 20px 20px; }
    .palette-section + .palette-section { margin-top:12px; }
    .palette-label { display:flex; align-items:center; gap:6px; margin:0 0 6px; color:#c9d0dc; font-size:9px; line-height:13px; letter-spacing:1.5px; font-weight:700; }
    .palette-dot { width:5px; height:5px; border-radius:50%; background:var(--section-accent); }
    .palette-why { --section-accent:var(--orb-why-accent); }
    .palette-trajectory { --section-accent:var(--orb-trajectory-accent); }
    .palette-sequencing { --section-accent:var(--orb-sequencing-accent); }
    .palette-action { --section-accent:var(--orb-action-accent); }
    .palette-why-box { min-height:142px; padding:16px; background:var(--orb-why); border:2px solid var(--orb-why-border); border-radius:6px; }
    .palette-headline { margin:0; color:#f1f3f8; font-size:15px; line-height:21px; font-weight:700; }
    .palette-headline::after { content:''; display:block; width:30px; height:2px; margin-top:9px; background:var(--orb-why-accent); }
    .palette-why-copy { margin:10px 0 0; color:#e5e9f3; font-size:12px; line-height:18px; }
    .palette-bar { min-height:39px; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 13px; border:1px solid; border-radius:5px; color:#e5e9f3; font-size:12px; line-height:18px; }
    .palette-trajectory .palette-bar { background:var(--orb-trajectory); border-color:var(--orb-trajectory-border); }
    .palette-sequencing .palette-bar { background:var(--orb-sequencing); border-color:var(--orb-sequencing-border); }
    .palette-action .palette-bar { background:var(--orb-action); border-color:var(--orb-action-border); padding:7px 12px; }
    .palette-action .palette-bar + .palette-bar { margin-top:5px; }
    .palette-bar strong { font-weight:600; }
    .palette-chevron { display:block; flex:none; width:5px; height:5px; border-right:1px solid var(--section-accent); border-bottom:1px solid var(--section-accent); transform:rotate(45deg); margin:0 3px 3px; }
    .palette-action-controls { display:flex; align-items:center; gap:12px; flex:none; }
    .palette-email { display:block; font-size:8px; letter-spacing:.65px; padding:3px 6px; border:1px solid var(--orb-action-border); background:var(--orb-action-button); color:var(--orb-action-accent); border-radius:3px; line-height:13px; }
    .palette-footer { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:14px 20px; border-top:1px solid #252b35; }
    .palette-swatches { display:flex; gap:6px; }
    .palette-swatch { display:block; width:19px; height:19px; border-radius:50%; border:1px solid; }
    .palette-preview { color:#e0e8f6; text-decoration:none; font-size:12px; font-weight:600; padding:8px 10px; border:1px solid #435069; border-radius:5px; background:#17202e; }
    .palette-preview:hover { background:#223049; border-color:#829abc; }
    .palette-workspace a:focus-visible { outline:2px solid #adc9ff; outline-offset:4px; }
    @media(max-width:900px) { .palette-workspace { padding:20px 8px 32px; } .palette-grid { gap:14px; } .palette-card-header { padding:16px 14px; } .palette-sample { padding:0 14px 16px; } .palette-action .palette-bar { flex-wrap:wrap; gap:6px; } .palette-action-controls { margin-left:auto; } .palette-footer { padding:12px 14px; } }
    @media(max-width:680px) { .palette-grid { grid-template-columns:1fr; } .palette-page-header { align-items:flex-start; flex-direction:column; gap:12px; } .palette-page-header h1 { font-size:26px; } }
  `}</style>
  <header className="palette-page-header">
    <div><p className="palette-eyebrow">Suggestion delivery · color study</p><h1>Four palettes. One clear hierarchy.</h1><p>WHY leads with a heavier outline. Trajectory, sequencing, and actions each get their own hue. Compare the same suggestion below, then open a full preview.</p></div>
    <a className="palette-back" href="/">Current design ↗</a>
  </header>
  <div className="palette-grid">
    {palettes.map((palette,index) => <article className="palette-card" style={palette.colors} key={palette.id} aria-labelledby={'palette-' + palette.id}>
      <header className="palette-card-header"><span className="palette-number">0{index + 1}</span><div><h2 id={'palette-' + palette.id}>{palette.name}</h2><p className="palette-description">{palette.description}</p></div></header>
      <div className="palette-sample" aria-label="Compact suggestion preview">
        <section className="palette-section palette-why"><h3 className="palette-label"><span className="palette-dot" />WHY</h3><div className="palette-why-box"><p className="palette-headline">Orbiter.io can turn Maximum Effort’s relationships across film, brands, and sports into its next deal.</p><p className="palette-why-copy">Connect a brand client, a streaming partner, and a talent relationship before the opportunity closes.</p></div></section>
        <section className="palette-section palette-trajectory"><h3 className="palette-label"><span className="palette-dot" />TRAJECTORY</h3><div className="palette-bar"><strong>Charlie Anderson &amp; Kyle Jackson</strong><Chevron /></div></section>
        <section className="palette-section palette-sequencing"><h3 className="palette-label"><span className="palette-dot" />SUGGESTED SEQUENCING</h3><div className="palette-bar"><strong>Start with Charlie</strong><Chevron /></div></section>
        <section className="palette-section palette-action"><h3 className="palette-label"><span className="palette-dot" />ACTION</h3>{['Charlie Anderson','Kyle Jackson'].map(name => <div className="palette-bar" key={name}><span>Reach out to {name}</span><span className="palette-action-controls"><span className="palette-email">DRAFT EMAIL</span><Chevron /></span></div>)}</section>
      </div>
      <footer className="palette-footer"><div className="palette-swatches" aria-label="Section colors">{Object.entries(palette.sections).map(([section,colors]) => <span className="palette-swatch" key={section} title={section + ': ' + colors.background} style={{background:colors.background,borderColor:colors.border}} />)}</div><a className="palette-preview" href={'/?palette=' + palette.id} target="_blank" rel="noreferrer" aria-label={'Preview ' + palette.name + ' in full design'}>Preview full design ↗</a></footer>
    </article>)}
  </div>
</div>;
