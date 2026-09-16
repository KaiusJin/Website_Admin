export async function loadContent(client, table, signal) {
  const { data, error } = await client.from(table).select('*')
    .order('order', { ascending: true }).order('id').abortSignal(signal);
  if (error) throw error;
  return data;
}

export async function saveOrder(client, table, items) {
  const results = await Promise.all(items.map((item, order) => client.from(table)
    .update({ order }).eq('id', item.id).select('id').single()));
  const failure = results.find(result => result.error);
  if (failure) throw failure.error;
}

export function editableContent(row) {
  const generated = new Set(['id', 'order', 'created_at', 'updated_at', 'singleton', 'role_icon', 'category_icon']);
  return Object.fromEntries(Object.entries(row).filter(([key]) => !generated.has(key)));
}
