import test from 'node:test';
import assert from 'node:assert/strict';
import {saveOrder} from '../src/cms/contentStore.js';

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

