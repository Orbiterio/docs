// Shared recipient controls for the standalone references.
const referenceRecipientSelections = {};
function createReferenceRecipients(personIds, channel) {
  const element = document.createElement('div');
  element.className = 'orb-recipient-fields';
  const controls = [];
  personIds.forEach(personId => {
    const person = referenceContacts[personId];
    const options = person[channel === 'sms' ? 'mobile_phones' : 'emails'];
    const key = channel + ':' + personId;
    const selected = options.includes(referenceRecipientSelections[key]) ? referenceRecipientSelections[key] : options[0];
    const field = document.createElement('div');
    field.className = 'orb-recipient-field';
    const label = document.createElement('label');
    label.htmlFor = 'recipient-' + channel + '-' + personId;
    label.textContent = (channel === 'sms' ? 'Mobile' : 'To') + ' — ' + person.name;
    const input = document.createElement(options.length > 1 ? 'select' : 'input');
    input.id = label.htmlFor;
    if (options.length > 1) {
      options.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        input.append(option);
      });
      input.addEventListener('change', () => {
        referenceRecipientSelections[key] = input.value;
        const status = element.closest('.orb-composer')?.querySelector('.orb-copy-status');
        if (status) status.textContent = '';
      });
    } else {
      input.type = channel === 'sms' ? 'tel' : 'email';
      input.readOnly = true;
    }
    input.value = selected;
    controls.push(input);
    field.append(label, input);
    element.append(field);
  });
  return { element, values: () => controls.map(input => input.value) };
}
