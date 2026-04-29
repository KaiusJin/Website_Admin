import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EditModal from './EditModal';

export default function DataManager({ table }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [table]);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('order', { ascending: true });
    
    if (data) setData(data);
    setLoading(false);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(data);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for UI snappiness
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    setData(updatedItems);

    // Sync to Supabase
    const updates = updatedItems.map(item => ({
        id: item.id,
        order: item.order
    }));

    const { error } = await supabase
        .from(table)
        .upsert(updates, { onConflict: 'id' });
    
    if (error) {
        alert("Sort sync failed: " + error.message);
        fetchData(); // Rollback on error
    }
  };

  const handleSave = async (formData) => {
    const { id, ...cleanData } = formData;
    let error;

    if (id) {
      ({ error } = await supabase.from(table).update(cleanData).eq('id', id));
    } else {
      // For new items, set order to last
      const nextOrder = data.length > 0 ? Math.max(...data.map(d => d.order || 0)) + 1 : 0;
      ({ error } = await supabase.from(table).insert({ ...cleanData, order: nextOrder }));
    }

    if (!error) {
      setIsModalOpen(false);
      fetchData();
    } else {
      alert("Error saving: " + error.message);
    }
  };

  const toggleVisibility = async (item) => {
    const newVisibility = item.visibility === 'public' ? 'v_only' : 'public';
    const { error } = await supabase
      .from(table)
      .update({ visibility: newVisibility })
      .eq('id', item.id);
    
    if (!error) {
      setData(data.map(d => d.id === item.id ? { ...d, visibility: newVisibility } : d));
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) setData(data.filter(d => d.id !== id));
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading data...</div>;

  return (
    <div>
      <div className="card" style={{ padding: 0 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="entries">
            {(provided) => (
              <table {...provided.droppableProps} ref={provided.innerRef}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Title / Category</th>
                    <th>Visibility</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <tr 
                          ref={provided.innerRef} 
                          {...provided.draggableProps}
                          style={{ 
                            ...provided.draggableProps.style,
                            background: snapshot.isDragging ? 'rgba(56, 189, 248, 0.1)' : 'transparent'
                          }}
                        >
                          <td {...provided.dragHandleProps} style={{ color: 'var(--text-secondary)', cursor: 'grab' }}>
                            <GripVertical size={18} />
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{item.title || item.category}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.date_badge || item.category_slug}</div>
                          </td>
                          <td>
                            <span 
                              className={`badge ${item.visibility === 'public' ? 'badge-public' : 'badge-private'}`}
                              onClick={() => toggleVisibility(item)}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.visibility === 'public' ? <><Eye size={12} /> Public</> : <><EyeOff size={12} /> Private</>}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button 
                              className="btn btn-outline" 
                              style={{ marginRight: '0.5rem' }} 
                              onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                            >
                              <Edit size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ color: 'var(--danger)' }} onClick={() => deleteItem(item.id)}>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      <button 
        className="btn btn-primary" 
        style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
      >
        <Plus size={20} /> Add New Entry
      </button>

      <EditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
        table={table}
        onSave={handleSave}
      />
    </div>
  );
}
