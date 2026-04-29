import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function EditModal({ isOpen, onClose, onSave, item, table }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Default values for new item
      setFormData({ visibility: 'public', order: 0 });
    }
  }, [item, table, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    let newFormData = { ...formData, [field]: value };
    
    // Logic: If Present is checked, clear and disable end_date
    if (field === 'is_present' && value === true) {
      newFormData.end_date = '';
    }
    // Logic: If end_date is filled, uncheck is_present
    if (field === 'end_date' && value !== '') {
      newFormData.is_present = false;
    }
    
    setFormData(newFormData);
  };

  const handleArrayChange = (field, index, subfield, value) => {
    const newArr = [...(formData[field] || [])];
    if (subfield) {
      newArr[index] = { ...newArr[index], [subfield]: value };
    } else {
      newArr[index] = value;
    }
    setFormData(prev => ({ ...prev, [field]: newArr }));
  };

  const addArrayItem = (field, defaultValue) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), defaultValue] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const renderField = (label, field, type = "text") => (
    <div className="input-group" key={field}>
      <label>{label}</label>
      <input 
        type={type} 
        value={formData[field] || ''} 
        onChange={(e) => handleChange(field, type === 'number' ? parseInt(e.target.value) : e.target.value)} 
      />
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{item ? 'Edit Entry' : 'New Entry'} - {table}</h2>
          <button onClick={onClose} className="btn-icon"><X /></button>
        </div>
        
        <div className="modal-body">
          {/* Common Fields */}
          {table !== 'skills' && renderField("Title", "title")}
          {table === 'skills' && renderField("Category Name", "category")}
          {table === 'skills' && renderField("Category Slug (url-safe)", "category_slug")}
          
          {table === 'experiences' && renderField("Role", "role")}
          {table === 'experiences' && renderField("Role Icon (FontAwesome class)", "role_icon")}
          
          {(table === 'projects' || table === 'experiences') && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField("Start Date", "start_date")}
                <div className="input-group">
                  <label>End Date</label>
                  <input 
                    type="text" 
                    value={formData.end_date || ''} 
                    disabled={formData.is_present}
                    onChange={(e) => handleChange('end_date', e.target.value)} 
                    style={{ opacity: formData.is_present ? 0.5 : 1, cursor: formData.is_present ? 'not-allowed' : 'text' }}
                    placeholder={formData.is_present ? "Present" : ""}
                  />
                </div>
              </div>
              <div className="input-group-row">
                <input 
                  type="checkbox" 
                  id="is_present"
                  checked={formData.is_present || false} 
                  onChange={(e) => handleChange('is_present', e.target.checked)} 
                />
                <label htmlFor="is_present">Currently working here / In progress (Present)</label>
              </div>
            </>
          )}

          {table === 'awards' && (
            <>
              {renderField("Organization", "organization")}
              {renderField("Year", "year")}
              {renderField("Description", "description")}
            </>
          )}

          {(table === 'projects' || table === 'experiences' || table === 'awards') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {renderField("Link URL", "link")}
              {renderField("Link Text", "link_text")}
            </div>
          )}

          <div className="input-group">
            <label>Visibility</label>
            <select 
              value={formData.visibility || 'public'} 
              onChange={(e) => handleChange('visibility', e.target.value)}
              className="admin-select"
            >
              <option value="public">Public</option>
              <option value="v_only">Private</option>
            </select>
          </div>

          {/* List Fields (Bullets / Skills) */}
          {(table !== 'skills' && table !== 'awards') && (
            <div className="list-editor">
              <label>Bullets / Highlights</label>
              {(formData.bullets || []).map((b, i) => (
                <div key={i} className="list-row">
                  <input value={b.text || ''} onChange={(e) => handleArrayChange('bullets', i, 'text', e.target.value)} />
                  <button onClick={() => removeArrayItem('bullets', i)} className="btn-danger-small"><Trash2 size={14}/></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('bullets', { text: '' })} className="btn-add"><Plus size={14}/> Add Bullet</button>
            </div>
          )}

          {table === 'skills' && (
            <div className="list-editor">
              <label>Skills (Tags)</label>
              {(formData.skills || []).map((s, i) => (
                <div key={i} className="list-row">
                  <input value={s.tag || ''} onChange={(e) => handleArrayChange('skills', i, 'tag', e.target.value)} />
                  <button onClick={() => removeArrayItem('skills', i)} className="btn-danger-small"><Trash2 size={14}/></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('skills', { tag: '' })} className="btn-add"><Plus size={14}/> Add Skill Tag</button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(formData)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
