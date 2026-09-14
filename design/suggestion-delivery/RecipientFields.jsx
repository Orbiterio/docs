import React from 'react';
import { contactOptions, sampleContacts, selectedContactOption } from './sample-contacts.js';

export const RecipientFields = ({ personIds, channel, selections, onSelect }) => <div className="orb-recipient-fields">
  {personIds.map(personId => {
    const person = sampleContacts[personId];
    const options = contactOptions(personId, channel);
    const value = selectedContactOption(personId, channel, selections);
    const fieldId = 'recipient-' + channel + '-' + personId;
    return <div className="orb-recipient-field" key={fieldId}>
      <label htmlFor={fieldId}>{channel === 'sms' ? 'Mobile' : 'To'} — {person.name}</label>
      {options.length > 1 ? <select id={fieldId} value={value} onChange={event => onSelect(channel + ':' + personId, event.target.value)}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select> : <input id={fieldId} type={channel === 'sms' ? 'tel' : 'email'} readOnly value={value} />}
    </div>;
  })}
</div>;
