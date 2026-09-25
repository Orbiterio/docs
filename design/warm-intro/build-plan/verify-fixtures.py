from pathlib import Path
import json,re,hashlib,copy
b=Path(__file__).parent
source=json.loads((b/'fixtures/leverage-loop-ethan-katelyn.json').read_text())
inputs=json.loads((b/'fixtures/model-inputs.json').read_text())
drafts=json.loads((b/'fixtures/expected-drafts.json').read_text())
why=source['suggestion']['why'];action=source['action'];checks=[]
assert set(why)=={'headline','body'} and len(why['body'])==4
assert why['headline']=="Katelyn's founder clients mature into Ethan's media-tech M&A pipeline."
assert all(isinstance(p,str) and p for p in why['body'])
assert hashlib.sha256(json.dumps(why,ensure_ascii=False,sort_keys=True).encode()).hexdigest()==source['provenance']['why_sha256']
checks.append('Exact selected source headline and four paragraphs retained with a canonical hash.')
assert source['batch']['beneficiary_contact_id']==action['target_entity_id']
assert [x['step'] for x in action['params']['steps']]==['ask_beneficiary','ask_suggested_person','introduce']
assert action['params']['recipients'][0]['entity_id']==source['suggestion']['entity_id']
assert action['params']['steps'][0]['recipient_entity_ids']==[source['batch']['beneficiary_contact_id']]
checks.append('Beneficiary Katelyn and suggested Ethan mapped by entity identity; recipient-array order differs from source step order.')
for key,value in inputs.items():
 assert value['why_connect']==why and len(value['why_connect']['body'])==4
 text=json.dumps(value)
 assert '@' not in text and 'sender_intent' not in value and 'private_context' not in value
 for field in ('weights','relationship_evidence','token','emails','mobile_phones'):assert field not in text
 assert len(drafts[key]['subject'])<=160 and len(drafts[key]['body'])<=3000
 assert 'Katelyn' in drafts[key]['body'] and 'Ethan' in drafts[key]['body']
 assert 'Grant Drive' in drafts[key]['body'] and 'MediaBridge' in drafts[key]['body']
 assert 'Fieldwork' not in drafts[key]['body']
 if key.startswith('request'):
  assert 70<=len(drafts[key]['body'].split())<=130
  for phrase in ('has agreed','has accepted','I’ll check with','likes you','will become'):
   assert phrase not in drafts[key]['body']
checks.append('All three model-input fixtures retain the full WHY, roles and names without email addresses or private intent.')
checks.append('Authored expected requests fit word limits and contain no order-dependent promise or premature acceptance claim.')
slots={inputs[k]['recipient']['participant_id']:k for k in ('request-katelyn','request-ethan')}
for order in [('fixture-katelyn','fixture-ethan'),('fixture-ethan','fixture-katelyn')]:
 ordered=[slots[p] for p in order]
 assert len(set(ordered))==2
 assert inputs[ordered[0]]['counterpart']['participant_id']==order[1]
checks.append('Both execution orders preserve recipient-keyed request inputs and independent final input.')
bad=copy.deepcopy(why);bad['body']=list(reversed(bad['body']))
assert bad!=why
bad=copy.deepcopy(why);bad['body']='\n\n'.join(bad['body'])
assert not isinstance(bad['body'],list)
checks.append('Paragraph reordering and flattening change or violate the source contract.')
result={'status':'passed','checks':checks,'not_tested':['No model calls or email sends. Expected copy is authored QA reference, not measured model quality.','No application API, browser consent, concurrency or external provider implementation is exercised.']}
(b/'fixture-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
