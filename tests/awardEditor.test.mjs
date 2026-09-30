import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

let server;
before(async () => {
  server = await createServer({
    configFile: false, appType: 'custom',
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    resolve: { alias: [{ find: /^.*\/lib\/supabase(?:\.js)?$/, replacement: fileURLToPath(new URL('./fixtures/supabase.js', import.meta.url)) }] },
  });
});
after(async () => { await server?.close(); });

test('the award editor exposes only title, organization, year and credential URL for a legacy row', async () => {
  const { default: EditModal } = await server.ssrLoadModule('/src/components/EditModal.jsx');
  const html = renderToStaticMarkup(createElement(EditModal, { table: 'awards', item: {title:'Award',organization:'Issuer',year:'2026',link:'https://example.test/credential',description:'Retired description',bullets:[{text:'Retired highlight'}],link_text:'Retired label'}, onClose() {}, onSave() {} }));
  for (const field of ['title','organization','year','link']) assert.ok(html.includes(`id="field-${field}"`), field);
  assert.equal((html.match(/<input\b/g) || []).length, 4);
  for (const value of ['Retired description','Retired highlight','Retired label','Bullets / Highlights','Link Label','field-description']) assert.ok(!html.includes(value), value);
  assert.ok(html.includes('type="url"'));
  assert.ok(html.includes('aria-labelledby="editor-title"'));
});


test('the profile editor omits resume and retired Classic slogans', async () => {
  const { default: EditModal } = await server.ssrLoadModule('/src/components/EditModal.jsx');
  const html = renderToStaticMarkup(createElement(EditModal, { table: 'site_profile', item: {name:'Profile',resume_url:'https://example.test/old.pdf',contact_slogans:['Hidden slogan']}, onClose() {}, onSave() {} }));
  assert.ok(html.includes('field-email'));
  assert.ok(html.includes('journey_en-contact_intro'));
  for (const value of ['Resume','resume_url','résumé','Classic contact slogans','Hidden slogan','https://example.test/old.pdf']) assert.ok(!html.includes(value), value);
});


test('profile editor removes unused Classic controls and retains editable Journey text', async () => {
  const { default: EditModal } = await server.ssrLoadModule('/src/components/EditModal.jsx');
  const html = renderToStaticMarkup(createElement(EditModal, {table:'site_profile',item:{heading:'Retired heading',hero_tags:['Retired tag'],focus_areas:'Retired focus',journey_en:{heading:'English heading',focus:'English focus',location_detail:'English location'},journey_zh:{heading:'中文标题',focus:'中文方向',location_detail:'中文地点'}},onClose(){},onSave(){}}));
  for (const value of ['field-heading','field-hero_tags','field-focus_areas','Hero tags','Focus areas','Retired heading','Retired tag','Retired focus']) assert.ok(!html.includes(value),value);
  for (const locale of ['journey_en','journey_zh']) {
    for (const field of ['heading','focus','location_detail']) assert.ok(html.includes(`${locale}-${field}`));
  }
  for (const text of ['English heading','English focus','English location','中文标题','中文方向','中文地点']) assert.ok(html.includes(text),text);
});

const findElements = (tree, predicate) => {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(child => findElements(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...findElements(tree.props?.children, predicate)];
};

test('shared list editor edits, adds and removes rows without dropping other fields or using stale state', async () => {
  const { default: ArrayEditor } = await server.ssrLoadModule('/src/components/ArrayEditor.jsx');
  for (const [itemLabel, fields, original] of [
    ['highlight', [{key:'text',label:'Highlight'}], {text:'Original highlight'}],
    ['skill', [{key:'tag',label:'Skill'}], {tag:'React'}],
    ['photo', [{key:'url',label:'Image URL',type:'url'},{key:'alt',label:'Image description'},{key:'caption',label:'Caption'}], {url:'https://example.test/a.png',alt:'An image',caption:'A caption'}],
  ]) {
    const first = {...original, metadata:'preserved'};
    let value = [first, {...original}];
    const render = () => ArrayEditor({label:'List',itemLabel,addLabel:'Add',fields,value,onChange:update => {value = update(value);}});
    const tree = render();
    const inputs = findElements(tree, element => element.type === 'input');
    inputs[0].props.onChange({target:{value:'Edited'}});
    // Invoke another callback from the same render to catch stale captured arrays.
    inputs[fields.length].props.onChange({target:{value:'Second edit'}});
    assert.equal(value[0][fields[0].key], 'Edited');
    assert.equal(value[1][fields[0].key], 'Second edit');
    assert.equal(value[0].metadata, 'preserved');
    assert.deepEqual(first, {...original,metadata:'preserved'});
    if (itemLabel === 'photo') assert.equal(value[0].caption, 'A caption');
    findElements(render(), element => element.type === 'button' && element.props.className === 'btn-add')[0].props.onClick();
    assert.deepEqual(value[2], Object.fromEntries(fields.map(({key}) => [key,''])));
    findElements(render(), element => element.props?.['aria-label'] === `Remove ${itemLabel} 1`)[0].props.onClick();
    assert.equal(value.length, 2);
    assert.equal(value[0][fields[0].key], 'Second edit');
  }
});

test('project, experience and gallery forms retain their list fields and accessible labels', async () => {
  const {default: EditModal} = await server.ssrLoadModule('/src/components/EditModal.jsx');
  for (const table of ['projects','work_experiences','club_experiences','volunteer_experiences','skills','personal_entries']) {
    const html = renderToStaticMarkup(createElement(EditModal,{table,item:{title:'Record',kind:'photography',bullets:[{text:'A highlight'}],skills:[{tag:'React'}],images:[{url:'https://example.test/a.png',alt:'A picture',caption:'A caption'}]},onClose(){},onSave(){}}));
    if (table === 'projects') assert.ok(html.includes('Slogan (first bullet) / Highlights'));
    if (table === 'personal_entries') {
      for (const text of ['Image URL 1','Image description 1','Caption 1','Remove photo 1','A caption']) assert.ok(html.includes(text),text);
    } else {
      for (const text of ['Skill 1','Remove skill 1','React']) assert.ok(html.includes(text),text);
      if (table !== 'skills') for (const text of ['Highlight 1','Remove highlight 1','A highlight']) assert.ok(html.includes(text),text);
    }
  }
});


test('shared list editor accepts empty legacy arrays', async () => {
  const {default: ArrayEditor} = await server.ssrLoadModule('/src/components/ArrayEditor.jsx');
  for (const value of [undefined, null, []]) {
    const html = renderToStaticMarkup(createElement(ArrayEditor,{label:'Skills',itemLabel:'skill',addLabel:'Add Tag',fields:[{key:'tag',label:'Skill'}],value,onChange(){}}));
    assert.ok(html.includes('Add Tag'));
    assert.ok(!html.includes('<input'));
  }
});
