import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EditModal from './EditModal';
import { editableContent, loadContent, saveOrder } from '../cms/contentStore';

export default function DataManager({ table }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [editing, setEditing] = useState(null);
  const sortable = !['site_profile', 'journey_scene_content'].includes(table);
  const canAdd = table === 'site_profile' ? data.length === 0 : table === 'journey_scene_content' ? data.length < 7 : true;

  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    loadContent(supabase, table, abort.signal).then(items => {
      if (active) setData(items);
    }).catch(reason => {
      if (active) { setData([]); setError(reason.message); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; abort.abort(); };
  }, [table, revision]);

  const refresh = () => { setLoading(true); setRevision(value => value + 1); };
  const mutate = async (operation, failurePrefix = '') => {
    setBusy(true); setError('');
    try { await operation(); }
    catch (reason) { setError(`${failurePrefix}${reason.message}`); }
    finally { setBusy(false); refresh(); }
  };
  const onDragEnd = result => {
    if (!result.destination || result.source.index === result.destination.index || busy) return;
    const items = [...data];
    const [item] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, item);
    setData(items);
    mutate(() => saveOrder(supabase, table, items), 'Some ordering changes may have saved; the list has been reloaded. ');
  };
  const handleSave = formData => mutate(async () => {
    const content = editableContent(formData);
    const request = editing.item
      ? supabase.from(table).update(content).eq('id', editing.item.id)
      : supabase.from(table).insert({ ...content, order: sortable && data.length ? Math.max(...data.map(item => item.order ?? 0)) + 1 : 0 });
    const { error } = await request.select('id').single();
    if (error) throw error;
    setEditing(null);
  });
  const deleteItem = id => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    mutate(async () => {
      const { error } = await supabase.from(table).delete().eq('id', id).select('id').single();
      if (error) throw error;
    });
  };
  const row = (item, provided, dragging = false) => (
    <tr key={item.id} ref={provided?.innerRef} {...provided?.draggableProps}
      style={{ ...provided?.draggableProps.style, background: dragging ? 'rgba(56, 189, 248, 0.1)' : undefined }}>
      {sortable && <td {...provided?.dragHandleProps}><GripVertical size={18} /></td>}
      <td>
        <div style={{ fontWeight: 600 }}>{item.title || item.category || item.heading || 'Profile & Contact'}</div>
        <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>{item.role || item.kind || item.scene_id}</div>
      </td>
      <td style={{ textAlign: 'right' }}>
        <button className="btn btn-outline" disabled={busy} aria-label={`Edit ${item.title || item.category || 'profile'}`} onClick={() => setEditing({ item })}><Edit size={16} /></button>
        <button className="btn btn-outline" disabled={busy} aria-label={`Delete ${item.title || item.category || 'profile'}`} onClick={() => deleteItem(item.id)}><Trash2 size={16} /></button>
      </td>
    </tr>
  );
  const heading = <thead><tr>{sortable && <th style={{ width: 40 }} aria-label="Reorder" />}<th>Title / Category</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>;

  return (
    <div>
      {error && <p role="alert" className="cms-error">{error} <button className="btn btn-outline" onClick={() => { setError(''); refresh(); }} disabled={busy}>Retry</button></p>}
      {loading ? <p role="status">Loading data…</p> : <>
        <div className="card" style={{ padding: 0 }}>
          {sortable ? <DragDropContext onDragEnd={onDragEnd}>
            <table>{heading}<Droppable droppableId={table}>{provided => (
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {data.map((item, index) => <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={busy}>
                  {(provided, snapshot) => row(item, provided, snapshot.isDragging)}
                </Draggable>)}
                {provided.placeholder}
              </tbody>
            )}</Droppable></table>
          </DragDropContext> : <table>{heading}<tbody>{data.map(item => row(item))}</tbody></table>}
        </div>
        {canAdd && !error && <button className="btn btn-primary" disabled={busy} style={{ marginTop: '1.5rem' }} onClick={() => setEditing({ item: null })}><Plus size={20} /> {table === 'site_profile' ? 'Create Profile' : 'Add New Entry'}</button>}
      </>}
      {editing && <EditModal key={editing.item?.id || 'new'} onClose={() => setEditing(null)} onSave={handleSave} item={editing.item} table={table} busy={busy} entries={data} />}
    </div>
  );
}
