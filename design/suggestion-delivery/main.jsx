import React from 'react';
import { createRoot } from 'react-dom/client';
import { SampleSuggestionData } from './SampleSuggestionData.jsx';
import { PaletteOptions } from './PaletteOptions.jsx';
import { palettes } from './palettes.js';

const isPalettePage = window.location.pathname === '/palettes.html';
const palette = palettes.find(item => item.id === new URLSearchParams(window.location.search).get('palette'));
document.title = isPalettePage ? 'Suggestion Delivery — Palette Options' : 'Suggestion Delivery — ' + (palette ? palette.name + ' Preview' : 'Design');
createRoot(document.getElementById('root')).render(isPalettePage ? <PaletteOptions /> : <SampleSuggestionData palette={palette} />);
