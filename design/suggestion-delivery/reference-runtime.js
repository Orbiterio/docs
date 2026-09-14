// Plain JavaScript for the exported HTML. Drafts are local and are never sent.
(() => {
  const board = document.getElementById('orbiter-moonshot');
  let activeDraft = null;
  let draftTrigger = null;
  const arrow = expanded => {
    const span = document.createElement('span');
    span.className = 'sample-chevron' + (expanded ? ' sample-chevron-up' : '');
    span.setAttribute('aria-hidden', 'true');
    return span;
  };
  const closeDraft = (restoreFocus = true) => {
    document.getElementById('sample-composer')?.remove();
    if (draftTrigger) {
      draftTrigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) draftTrigger.focus();
    }
    activeDraft = null;
    draftTrigger = null;
  };
  const openDraft = button => {
    closeDraft(false);
    const key = button.id.replace('sample-draft-', '');
    const [personId, channel] = key.split('-');
    const draft = referenceDrafts[key];
    const name = board.querySelector('.orb-' + personId).closest('.orb-person').querySelector('h3').textContent;
    activeDraft = key;
    draftTrigger = button;
    button.setAttribute('aria-expanded', 'true');
    const composer = document.createElement('section');
    composer.id = 'sample-composer';
    composer.className = 'orb-composer';
    composer.setAttribute('aria-labelledby', 'sample-composer-title');
    composer.innerHTML = '<div class="orb-composer-heading"><h3 id="sample-composer-title"></h3><button class="orb-close" type="button" aria-label="Close draft">×</button></div>';
    composer.querySelector('h3').textContent = (channel === 'sms' ? 'SMS to ' : 'Email to ') + name;
    composer.querySelector('button').addEventListener('click', () => closeDraft());
    const recipients = createReferenceRecipients([personId], channel);
    composer.append(recipients.element);
    const addField = (labelText, field, tag) => {
      const label = document.createElement('label');
      label.htmlFor = 'sample-' + field;
      label.textContent = labelText;
      const input = document.createElement(tag);
      input.id = label.htmlFor;
      input.value = draft[field] || '';
      input.addEventListener('input', () => { draft[field] = input.value; });
      composer.append(label, input);
    };
    if (channel === 'email') addField('Subject', 'subject', 'input');
    addField('Message', 'message', 'textarea');
    const footer = document.createElement('div');
    footer.className = 'orb-composer-footer';
    footer.innerHTML = '<button class="orb-copy" type="button">Copy draft</button><span class="orb-copy-status" role="status" aria-live="polite"></span>';
    footer.querySelector('button').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('To: ' + recipients.values().join(', ') + '\n' + (channel === 'email' ? 'Subject: ' + draft.subject + '\n' : '') + '\n' + draft.message);
        footer.querySelector('span').textContent = 'Draft copied.';
      } catch {
        composer.querySelector('textarea').focus();
        composer.querySelector('textarea').select();
        footer.querySelector('span').textContent = 'Message selected. Press ⌘C or Ctrl+C to copy.';
      }
    });
    composer.append(footer);
    board.querySelector('.sample-action-section').append(composer);
    composer.querySelector('#sample-subject, #sample-message').focus();
  };
  const togglePanel = button => {
    const id = button.getAttribute('aria-controls');
    const panel = document.getElementById(id);
    if (!panel) return;
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.querySelector('.sample-chevron')?.classList.toggle('sample-chevron-up', expanded);
    if (id === 'sample-sequencing-content') {
      panel.parentElement.dataset.expanded = String(expanded);
      Array.from(panel.children).forEach((li, index) => {
        li.hidden = !expanded && index > 0;
        li.querySelector('p').hidden = !expanded;
      });
      button.setAttribute('aria-label', (expanded ? 'Collapse' : 'Expand') + ' suggested sequencing');
      return;
    }
    panel.hidden = !expanded;
    if (id === 'sample-trajectory-content') {
      const names = Array.from(panel.querySelectorAll('.orb-trajectory-route h4')).map(el => el.textContent).join(' & ');
      button.className = expanded ? 'orb-collapse orb-trajectory-toggle' : 'orb-trajectory-summary';
      button.replaceChildren();
      if (!expanded) {
        const label = document.createElement('span');
        label.textContent = names;
        button.append(label);
      }
      const icon = document.createElement('span');
      if (!expanded) icon.className = 'sample-arrow-circle';
      icon.append(arrow(expanded));
      button.append(icon);
      button.setAttribute('aria-label', expanded ? 'Collapse trajectory' : 'Expand trajectory: ' + names);
    } else if (id.startsWith('sample-actions-')) {
      button.setAttribute('aria-label', button.getAttribute('aria-label').replace(/^(Show|Hide)/, expanded ? 'Hide' : 'Show'));
      if (!expanded && activeDraft === id.replace('sample-actions-', '') + '-sms') closeDraft(false);
    } else if (id === 'sample-main') {
      button.setAttribute('aria-label', (expanded ? 'Collapse' : 'Expand') + ' Ryan Reynolds opportunity');
    }
  };
  board.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.classList.contains('orb-draft-button')) return openDraft(button);
    if (button.hasAttribute('aria-controls')) return togglePanel(button);
    if (!button.classList.contains('orb-more')) return;
    const notes = button.closest('.orb-collapsed');
    if (notes) {
      const toggle = notes.querySelector('.orb-summary');
      if (toggle.getAttribute('aria-expanded') !== 'true') togglePanel(toggle);
      notes.querySelector('textarea').focus();
      return;
    }
    const container = button.closest('.orb-person') || button.closest('.orb-opportunity');
    const editing = button.getAttribute('aria-pressed') !== 'true';
    container.querySelectorAll('[contenteditable]').forEach(el => { el.contentEditable = editing ? 'plaintext-only' : 'false'; });
    button.setAttribute('aria-pressed', String(editing));
    button.textContent = editing ? '✓' : '•••';
    button.setAttribute('aria-label', button.getAttribute('aria-label').replace(/^(Edit|Finish editing)/, editing ? 'Finish editing' : 'Edit'));
  });
  board.addEventListener('keydown', event => {
    if (event.key === 'Escape' && event.target.closest('.orb-composer')) closeDraft();
  });
})();
