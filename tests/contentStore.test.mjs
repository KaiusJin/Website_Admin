import test from 'node:test';
import assert from 'node:assert/strict';
import {saveOrder, loadContent, editableContent} from '../src/cms/contentStore.js';
import {createClient} from '@supabase/supabase-js';

test('reordering existing journal records updates order without inserting or overwriting content', async () => {
  const rows = [{id:'a',title:'Keep A',kind:'daily',order:0},{id:'b',title:'Keep B',kind:'music',order:1}];
  const client = {from(table) {
    assert.equal(table, 'personal_entries');
    return { update(patch) {
      assert.deepEqual(Object.keys(patch), ['order']);
      return { eq(key, id) {
        assert.equal(key, 'id'); Object.assign(rows.find(row => row.id === id),patch);
        return { select: () => ({single: async () => ({data:{id},error:null})}) };
      }};
    }};
  }};
  await saveOrder(client, 'personal_entries', [rows[1],rows[0]]);
  assert.deepEqual(rows,[{id:'a',title:'Keep A',kind:'daily',order:1},{id:'b',title:'Keep B',kind:'music',order:0}]);
});



test('saving an award loaded before the migration omits retired fields and keeps the credential URL', () => {
  const row = { id: 'award', title: 'Certification', organization: 'Issuer', year: '2026', link: 'https://example.com/credential', description: 'Old text', bullets: [{text:'Old highlight'}], link_text: 'Old label', order: 3, created_at: 'then' };
  assert.deepEqual(editableContent(row, 'awards'), { title: 'Certification', organization: 'Issuer', year: '2026', link: 'https://example.com/credential' });
  assert.equal(row.description, 'Old text');
  const project = editableContent(row, 'projects');
  assert.equal(project.link_text, 'Old label');
  assert.deepEqual(project.bullets, [{text:'Old highlight'}]);
});


test('profile writes exclude retired resume and retired slogans without losing active contact fields', () => {
  const row = {id:'profile',email:'hello@example.test',resume_url:'https://example.test/old.pdf',contact_slogans:['Cached retired slogan'],journey_en:{contact_intro:'Hello'}};
  assert.deepEqual(editableContent(row, 'site_profile'), {email:'hello@example.test',journey_en:{contact_intro:'Hello'}});
  assert.deepEqual(row.contact_slogans,['Cached retired slogan']);
});


test('experience writes omit retired labels from cached rows while preserving website links', () => {
  const row = {id:'experience',title:'Organization',link:'https://example.test/organization',link_text:'Old label',role:'Developer'};
  for (const table of ['work_experiences','club_experiences','volunteer_experiences']) {
    assert.deepEqual(editableContent(row,table), {title:'Organization',link:'https://example.test/organization',role:'Developer'});
  }
  assert.equal(row.link_text,'Old label');
  assert.equal(editableContent(row,'projects').link_text,'Old label');
});


test('profile writes retire only top-level Classic fields and preserve Journey locale content', () => {
  const journey_en = {heading:'Journey heading',focus:'Journey focus',location_detail:'Journey location'};
  const journey_zh = {heading:'旅途标题',focus:'方向',location_detail:'地点补充'};
  const row = {name:'Profile',heading:'Old heading',hero_tags:['Old tag'],focus_areas:'Old focus',journey_en,journey_zh};
  assert.deepEqual(editableContent(row,'site_profile'),{name:'Profile',journey_en,journey_zh});
  assert.equal(row.heading,'Old heading');
});

function clientWith(fetch) {
  return createClient('https://media.example.test', 'test-key', {
    global: { fetch }, auth: { persistSession: false, autoRefreshToken: false },
  });
}

test('media library and picker share newest-first metadata and cancellation', async () => {
  const rows = [{id:'photo',path:'photo.webp',name:'Photo',mime:'image/webp',alt:'A scene',size:123}];
  const signal = new AbortController().signal;
  const client = clientWith(async (input, options) => {
    const url = new URL(input);
    assert.equal(url.pathname, '/rest/v1/media_assets');
    assert.equal(url.searchParams.get('select'), '*');
    assert.equal(url.searchParams.get('order'), 'created_at.desc');
    assert.equal(options.signal, signal);
    return Response.json(rows);
  });
  assert.deepEqual(await loadContent(client, 'media_assets', signal), rows);

});

test('media query failures stay distinguishable from an empty library', async () => {
  const client = clientWith(async () => Response.json({message:'Permission denied',code:'42501'}, {status:403}));
  await assert.rejects(loadContent(client,'media_assets',new AbortController().signal), {message:'Permission denied'});
  const empty = clientWith(async () => Response.json([]));
  assert.deepEqual(await loadContent(empty,'media_assets',new AbortController().signal), []);
});
