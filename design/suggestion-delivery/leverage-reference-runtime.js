// Plain JavaScript for the exported reference. All drafts stay local.
(() => {
  const board = document.getElementById('orbiter-moonshot');
  let activeDraft = null;
  let draftTrigger = null;
  let introStep = 'katelyn';
  const closeDraft = (restoreFocus = true) => {
    document.getElementById('loop-composer')?.remove();
    if (draftTrigger) {
      draftTrigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus) draftTrigger.focus();
    }
    activeDraft = null;
    draftTrigger = null;
  };
  const renderComposer = () => {
    document.getElementById('loop-composer')?.remove();
    const draftKey = activeDraft === 'intro' ? introStep : activeDraft;
    const draft = referenceDrafts[draftKey];
    const action = referenceActions.find(item => item.key === activeDraft);
    const composer = document.createElement('section');
    composer.id = 'loop-composer';
    composer.className = 'orb-composer';
    composer.setAttribute('aria-labelledby', 'loop-composer-title');
    composer.innerHTML = '<div class="orb-composer-heading"><h3 id="loop-composer-title"></h3><button class="orb-close" type="button" aria-label="Close draft">×</button></div>';
    composer.querySelector('h3').textContent = activeDraft === 'intro' ? 'Double opt-in introduction' : (action.channel === 'sms' ? 'SMS' : 'Email') + ' to ' + action.name;
    composer.querySelector('button').addEventListener('click', () => closeDraft());
    if (activeDraft === 'intro') {
      const stages = document.createElement('div');
      stages.className = 'loop-draft-stages';
      stages.setAttribute('role', 'group');
      stages.setAttribute('aria-label', 'Introduction drafts');
      [['katelyn', '1. Ask Katelyn'], ['ethan', '2. Ask Ethan'], ['introduction', '3. Introduction']].forEach(([key, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.setAttribute('aria-pressed', String(introStep === key));
        button.addEventListener('click', () => { introStep = key; renderComposer(); });
        stages.append(button);
      });
      const hint = document.createElement('p');
      hint.className = 'loop-draft-hint';
      hint.textContent = introStep === 'introduction' ? 'Use this introduction after both Katelyn and Ethan agree to connect.' : 'Check with each person before making the introduction.';
      composer.append(stages, hint);
    }
    const addField = (labelText, field, tag) => {
      const label = document.createElement('label');
      label.htmlFor = 'loop-' + field;
      label.textContent = labelText;
      const input = document.createElement(tag);
      input.id = label.htmlFor;
      input.value = draft[field];
      input.addEventListener('input', () => {
        draft[field] = input.value;
        composer.querySelector('.orb-copy-status').textContent = '';
      });
      composer.append(label, input);
    };
    if (draft.subject !== undefined) addField('Subject', 'subject', 'input');
    addField('Message', 'message', 'textarea');
    const footer = document.createElement('div');
    const isEmail = draft.subject !== undefined;
    footer.className = 'orb-composer-footer loop-email-footer';
    footer.innerHTML = '<span class="orb-copy-status" role="status" aria-live="polite"></span><button class="orb-copy loop-send" type="button">' + (isEmail ? 'Send' : 'QRCODE') + '</button>';
    footer.querySelector('button').addEventListener('click', () => {
      footer.querySelector('span').textContent = isEmail ? 'Email sending isn’t connected in this prototype.' : 'QR code generation isn’t connected in this prototype.';
    });
    composer.append(footer);
    board.querySelector('.sample-action-section').append(composer);
    composer.querySelector('input, textarea').focus();
  };
  const togglePanel = button => {
    const id = button.getAttribute('aria-controls');
    const panel = document.getElementById(id);
    if (!panel) return;
    const expanded = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(expanded));
    button.querySelector('.sample-chevron')?.classList.toggle('sample-chevron-up', expanded);
    panel.hidden = !expanded;
    if (id === 'loop-main') {
      button.setAttribute('aria-label', (expanded ? 'Collapse' : 'Expand') + ' Ethan Jacks match');
      if (!expanded) closeDraft(false);
    }
    if (id === 'loop-action-options') {
      button.setAttribute('aria-label', (expanded ? 'Hide' : 'Show') + ' more actions for Ethan Jacks');
      if (!expanded && activeDraft !== 'intro') closeDraft(false);
    }
  };
  board.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.draft) {
      closeDraft(false);
      activeDraft = button.dataset.draft;
      draftTrigger = button;
      button.setAttribute('aria-expanded', 'true');
      renderComposer();
      return;
    }
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
    container.querySelectorAll('[contenteditable]').forEach(element => { element.contentEditable = editing ? 'plaintext-only' : 'false'; });
    container.querySelectorAll('.orb-more[aria-pressed]').forEach(control => {
      control.setAttribute('aria-pressed', String(editing));
      control.textContent = editing ? '✓' : '•••';
      control.setAttribute('aria-label', control.getAttribute('aria-label').replace(/^(Edit|Finish editing)/, editing ? 'Finish editing' : 'Edit'));
    });
  });
  board.addEventListener('keydown', event => {
    if (event.key === 'Escape' && event.target.closest('.orb-composer')) closeDraft();
  });
})();
