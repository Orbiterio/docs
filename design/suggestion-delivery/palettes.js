const palette = (id, name, description, sections) => ({
  id, name, description, sections,
  colors: Object.fromEntries(Object.entries(sections).flatMap(([section, values]) => [
    ['--orb-' + section, values.background],
    ['--orb-' + section + '-border', values.border],
    ['--orb-' + section + '-accent', values.accent],
    ...(section === 'action' ? [
      ['--orb-action-button', values.button],
      ['--orb-action-option', values.option]
    ] : [])
  ]))
});

export const palettes = [
  palette('midnight', 'Midnight', 'Indigo, plum, amber, and petrol. The selected design palette.', {
    why: { background:'#172440', border:'#7899da', accent:'#adc9ff' },
    trajectory: { background:'#271f32', border:'#5c466a', accent:'#ceb5e0' },
    sequencing: { background:'#292316', border:'#635334', accent:'#d8bb7a' },
    action: { background:'#14323b', border:'#3e7380', accent:'#b0dce3', button:'#1a424b', option:'#10252c' }
  }),
  palette('mineral', 'Mineral', 'Ocean blue, forest, aubergine, and bronze. Earthy and restrained.', {
    why: { background:'#122b42', border:'#72a4cf', accent:'#a9d3f5' },
    trajectory: { background:'#182c25', border:'#476a58', accent:'#add0b9' },
    sequencing: { background:'#2b2233', border:'#655072', accent:'#d1b9de' },
    action: { background:'#372b20', border:'#89704c', accent:'#ead0a6', button:'#493a29', option:'#282119' }
  }),
  palette('dusk', 'Dusk', 'Violet, slate, terracotta, and sage. Softer, with a warmer balance.', {
    why: { background:'#24233f', border:'#9891d5', accent:'#cdc7ff' },
    trajectory: { background:'#1c2d36', border:'#496979', accent:'#adcbd9' },
    sequencing: { background:'#30251f', border:'#765643', accent:'#dfb79d' },
    action: { background:'#23382b', border:'#678369', accent:'#c3dec5', button:'#304b39', option:'#1a2a20' }
  }),
  palette('afterhours', 'After Hours', 'Cobalt, cocoa, steel, and orchid. Crisp contrast with quiet supporting panels.', {
    why: { background:'#142746', border:'#72a8ee', accent:'#b0d2ff' },
    trajectory: { background:'#2c231f', border:'#685247', accent:'#d2b9aa' },
    sequencing: { background:'#222d32', border:'#526c79', accent:'#b1ccd8' },
    action: { background:'#342544', border:'#8566a5', accent:'#dfc8f4', button:'#47325d', option:'#261c32' }
  })
];

export const defaultPalette = palettes.find(palette => palette.id === 'midnight');
