from pathlib import Path
import subprocess,tempfile,json,shutil
base=Path(__file__).parent
root=Path(tempfile.mkdtemp(prefix='warm-intro-schema-',dir='/private/tmp'))
data=root/'pgdata'; sock=root/'socket'; sock.mkdir();port='55439';started=False
try:
    subprocess.run(['initdb','-D',str(data),'--auth=trust','--no-locale','--encoding=UTF8'],check=True,stdout=subprocess.DEVNULL)
    subprocess.run(['pg_ctl','-D',str(data),'-l',str(root/'postgres.log'),'-o',f"-k {sock} -h '' -p {port}",'-w','start'],check=True,stdout=subprocess.DEVNULL)
    started=True
    def sql(s):
        out=subprocess.run(['psql','-X','-v','ON_ERROR_STOP=1','-h',str(sock),'-p',port,'-d','postgres','-At'],input=s,text=True,capture_output=True)
        if out.returncode: raise RuntimeError(out.stderr)
        return out.stdout
    fixtures='''CREATE SCHEMA users; CREATE TABLE users.users(id uuid PRIMARY KEY);
CREATE SCHEMA organizations; CREATE TABLE organizations.organizations(id uuid PRIMARY KEY);
CREATE SCHEMA suggestions; CREATE TABLE suggestions.suggestion_batch(id uuid PRIMARY KEY); CREATE TABLE suggestions.suggestion(id uuid PRIMARY KEY);
CREATE SCHEMA persons; CREATE TABLE persons.persons(id uuid PRIMARY KEY); CREATE TABLE persons.contacts(id uuid PRIMARY KEY);'''
    sql(fixtures+(base/'schema.sql').read_text())
    def uid(n):return f'019a0000-0000-7000-8000-{n:012d}'
    fixture=json.loads((base/'fixtures/leverage-loop-ethan-katelyn.json').read_text())
    original=fixture['suggestion']['why']
    edited=json.loads(json.dumps(original));edited['headline']='Fundraising and exit advice could create reciprocal referrals.'
    def json_sql(value): return "'"+json.dumps(value,ensure_ascii=False).replace("'","''")+"'::jsonb"
    original_sql=json_sql(original);edited_sql=json_sql(edited);source_sql=json_sql(fixture['suggestion'])
    test=f'''
INSERT INTO users.users VALUES ('{uid(1)}');
INSERT INTO suggestions.suggestion VALUES ('{uid(3)}');
INSERT INTO persons.contacts VALUES ('{uid(13)}');
INSERT INTO persons.persons VALUES ('{uid(21)}'),('{uid(22)}');
INSERT INTO warm_intros.introductions(id,owner_user_id,source_suggestion_id,source_action_ref,source_key,source_snapshot,state,current_stage)
VALUES ('{uid(10)}','{uid(1)}','{uid(3)}','a-intro','batch/source/action',{source_sql},'draft','draft');
INSERT INTO warm_intros.participants(id,introduction_id,contact_id,person_id,original_person_id,source_role,identity_snapshot)
VALUES ('{uid(11)}','{uid(10)}','{uid(13)}','{uid(21)}','{uid(21)}','beneficiary','{{"name":"Katelyn Gallanty"}}'),
('{uid(12)}','{uid(10)}',NULL,'{uid(22)}','{uid(22)}','suggested','{{"name":"Ethan Jacks"}}');
INSERT INTO warm_intros.context_versions(id,introduction_id,version,source_why,why_connect,sender_intent,why_status,why_provenance,recipient_safe_facts,sender_snapshot,presentation_snapshot,participant_snapshots,first_participant_id,second_participant_id,change_reason)
VALUES ('{uid(31)}','{uid(10)}',1,{original_sql},{original_sql},NULL,'present','{{}}','[]','{{"name":"Mark"}}','{{}}','[]','{uid(11)}','{uid(12)}','source_loaded'),
('{uid(32)}','{uid(10)}',2,{original_sql},{edited_sql},'Compare notes','present','{{}}','[]','{{"name":"Mark"}}','{{}}','[]','{uid(11)}','{uid(12)}','why_edited');
UPDATE warm_intros.introductions SET current_context_version_id='{uid(32)}',archived_at=now() WHERE id='{uid(10)}';
DELETE FROM persons.contacts WHERE id='{uid(13)}';
DELETE FROM suggestions.suggestion WHERE id='{uid(3)}';
DO $$ BEGIN
 IF (SELECT count(*) FROM warm_intros.context_versions WHERE introduction_id='{uid(10)}') <> 2 THEN RAISE EXCEPTION 'WHY history lost'; END IF;
 IF (SELECT source_why FROM warm_intros.context_versions WHERE id='{uid(32)}') <> {original_sql} THEN RAISE EXCEPTION 'Original WHY changed'; END IF;
 IF (SELECT why_connect FROM warm_intros.context_versions WHERE id='{uid(32)}') <> {edited_sql} THEN RAISE EXCEPTION 'Working WHY edit lost'; END IF;
 IF (SELECT identity_snapshot->>'name' FROM warm_intros.participants WHERE id='{uid(11)}') <> 'Katelyn Gallanty' THEN RAISE EXCEPTION 'Identity snapshot lost'; END IF;
 IF (SELECT source_snapshot->'why' FROM warm_intros.introductions WHERE id='{uid(10)}') <> {original_sql} THEN RAISE EXCEPTION 'Source snapshot lost'; END IF;
 BEGIN
  DELETE FROM warm_intros.introductions WHERE id='{uid(10)}';
  RAISE EXCEPTION 'History deletion unexpectedly succeeded';
 EXCEPTION WHEN foreign_key_violation OR restrict_violation THEN NULL; END;
END $$;
'''
    sql(test)
    # Adversarial reference fixtures: SQL should reject these even if a service has a bug.
    sql(f"""
INSERT INTO users.users VALUES ('{uid(2)}');
INSERT INTO warm_intros.introductions(id,owner_user_id,source_action_ref,source_key,source_snapshot,state,current_stage)
VALUES ('{uid(20)}','{uid(2)}','other','other/source','{{}}','draft','draft');
INSERT INTO warm_intros.messages(id,introduction_id,kind,participant_id,generation_status)
VALUES ('{uid(41)}','{uid(10)}','request','{uid(11)}','idle'), ('{uid(42)}','{uid(10)}','request','{uid(12)}','idle'),
('{uid(43)}','{uid(10)}','final_introduction',NULL,'idle');
INSERT INTO warm_intros.message_versions(id,introduction_id,message_id,version,context_version_id,subject,body,content_sha256,author_type)
VALUES ('{uid(51)}','{uid(10)}','{uid(41)}',1,'{uid(32)}','Subject A','Body A',decode('aa','hex'),'sender'),
('{uid(52)}','{uid(10)}','{uid(42)}',1,'{uid(32)}','Subject B','Body B',decode('bb','hex'),'sender');
INSERT INTO warm_intros.generation_runs(id,introduction_id,message_id,context_version_id,status,model_id,prompt_name,prompt_version,prompt_sha256,input_snapshot,input_sha256,settings)
VALUES ('{uid(61)}','{uid(10)}','{uid(41)}','{uid(32)}','queued','fixture','fixture','v1',decode('aa','hex'),'{{}}',decode('aa','hex'),'{{}}'),
('{uid(62)}','{uid(10)}','{uid(42)}','{uid(32)}','queued','fixture','fixture','v1',decode('aa','hex'),'{{}}',decode('aa','hex'),'{{}}');
""")
    rejected = []
    def reject(label, statement, condition='foreign_key_violation'):
        sql(f"DO $$ BEGIN BEGIN {statement}; RAISE EXCEPTION 'UNEXPECTEDLY ALLOWED: {label}'; EXCEPTION WHEN {condition} THEN NULL; END; END $$;")
        rejected.append(label)
    reject('Cross-message revision ancestry', f"UPDATE warm_intros.message_versions SET supersedes_version_id='{uid(52)}' WHERE id='{uid(51)}'")
    reject('Cross-message generation ancestry', f"UPDATE warm_intros.generation_runs SET parent_run_id='{uid(62)}' WHERE id='{uid(61)}'")
    reject('Cross-message streaming route', f"INSERT INTO warm_intros.stream_events(introduction_id,seq,run_id,message_id,kind,payload) VALUES ('{uid(10)}',1,'{uid(61)}','{uid(42)}','draft.delta','{{}}')")
    reject('Cross-owner introduction restart', f"UPDATE warm_intros.introductions SET previous_introduction_id='{uid(20)}' WHERE id='{uid(10)}'")
    reject('Wrong-slot current message version', f"UPDATE warm_intros.messages SET current_version_id='{uid(52)}' WHERE id='{uid(41)}'")
    reject('Wrong-slot active generation', f"UPDATE warm_intros.messages SET active_generation_run_id='{uid(62)}' WHERE id='{uid(41)}'")
    reject('Duplicate shared final slot', f"INSERT INTO warm_intros.messages(id,introduction_id,kind,participant_id,generation_status) VALUES ('{uid(44)}','{uid(10)}','final_introduction',NULL,'idle')", 'unique_violation')
    sql(f"UPDATE warm_intros.messages SET current_version_id='{uid(51)}',active_generation_run_id='{uid(61)}' WHERE id='{uid(41)}'; INSERT INTO warm_intros.stream_events(introduction_id,seq,run_id,message_id,kind,payload) VALUES ('{uid(10)}',1,'{uid(61)}','{uid(41)}','draft.delta','{{}}');")
    counts=sql("SELECT count(*) FROM information_schema.tables WHERE table_schema='warm_intros'; SELECT count(*) FROM information_schema.columns WHERE table_schema='warm_intros'; SELECT count(*) FROM pg_constraint WHERE connamespace='warm_intros'::regnamespace AND contype='f';").strip().splitlines()
    result={'schema_check':'passed','environment':'disposable local PostgreSQL cluster on a private Unix socket; no network listener or application database connection','tables':int(counts[0]),'columns':int(counts[1]),'foreign_keys':int(counts[2]),'checks':['Reference DDL applied against minimal external-key fixtures.','Actual Ethan/Katelyn headline and all four summary paragraphs retained in two context versions; changing working headline leaves original object unchanged.','Contact and suggestion deletion preserve identity and source snapshots.','Root deletion is blocked while history exists.'],'not_tested':['Application transaction guards, authorization, state engine, real models and email delivery are implementation work.']}
    result['rejected_invalid_references'] = rejected
    assert result['tables']==16
    (base/'schema-verification.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
finally:
    if started:subprocess.run(['pg_ctl','-D',str(data),'-m','immediate','-w','stop'],stdout=subprocess.DEVNULL,check=True)
    shutil.rmtree(root)
