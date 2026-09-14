// User-supplied contact options, in preferred order. Mobile numbers use E.164.
export const sampleContacts = {
  katelyn: {
    entity_id: '{entity ID for Katelyn Gallanty}',
    entity_type: 'person',
    name: 'Katelyn Gallanty',
    emails: ['katelyn@orbiter.io'],
    mobile_phones: ['+15165273108']
  },
  ethan: {
    entity_id: '{entity ID for Ethan Jacks}',
    entity_type: 'person',
    name: 'Ethan Jacks',
    emails: ['ethan@mediabridgecap.com'],
    mobile_phones: ['+16175922739']
  },
  kyle: {
    entity_id: '{entity ID for Kyle Jackson}',
    entity_type: 'person',
    name: 'Kyle Jackson',
    emails: ['kyledeanjackson@gmail.com', 'kyle@beinghuman.studio'],
    mobile_phones: ['+13234526998', '+6588333422']
  },
  charlie: {
    entity_id: '{entity ID for Charlie Anderson}',
    entity_type: 'person',
    name: 'Charlie Anderson',
    emails: ['canderson@adobe.com'],
    mobile_phones: ['+14106271480']
  }
};

export const contactOptions = (personId, channel) => sampleContacts[personId][channel === 'sms' ? 'mobile_phones' : 'emails'];
export const selectedContactOption = (personId, channel, selections) => {
  const options = contactOptions(personId, channel);
  const selected = selections[channel + ':' + personId];
  return options.includes(selected) ? selected : options[0];
};
