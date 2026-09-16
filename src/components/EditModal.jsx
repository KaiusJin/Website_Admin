import { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const experienceTables = ['work_experiences', 'club_experiences', 'volunteer_experiences'];
const titleTables = ['projects', ...experienceTables, 'awards', 'personal_entries', 'journey_scene_content'];

export default function EditModal({ isOpen, onClose, onSave, item, table }) {
  const [formData, setFormData] = useState({});
  const isExperience = experienceTables.includes(table);

  useEffect(() => {
    // Keep the baseline modal reset behavior; visibility is intentionally gone.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(item || { order: 0 });
  }, [item, table, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };

    if (field === 'is_present' && value === true) {
      newFormData.end_date = '';
    }
    if (field === 'end_date' && value !== '') {
      newFormData.is_present = false;
    }

    setFormData(newFormData);
  };

  const handleArrayChange = (field, index, subfield, value) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = subfield
      ? { ...newArray[index], [subfield]: value }
      : value;
    setFormData(previous => ({ ...previous, [field]: newArray }));
  };

  const addArrayItem = (field, defaultValue) => {
    setFormData(previous => ({
      ...previous,
      [field]: [...(previous[field] || []), defaultValue],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(previous => ({
      ...previous,
      [field]: previous[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const renderField = (label, field, type = 'text') => (
    <div className="input-group" key={field}>
      <label>{label}</label>
      <input
        type={type}
        value={formData[field] || ''}
        onChange={(event) => handleChange(field, type === 'number' ? parseInt(event.target.value, 10) : event.target.value)}
      />
    </div>
  );

  const renderTextarea = (label, field) => (
    <div className="input-group" key={field}>
      <label>{label}</label>
      <textarea rows="5" value={formData[field] || ''} onChange={(event) => handleChange(field, event.target.value)} />
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
          {titleTables.includes(table) && renderField('Title', 'title')}
          {table === 'skills' && renderField('Category Name', 'category')}
          {table === 'skills' && renderField('Category Slug (url-safe)', 'category_slug')}

          {isExperience && renderField('Role', 'role')}
          {isExperience && renderField('Role Icon (FontAwesome class)', 'role_icon')}

          {(table === 'projects' || isExperience) && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {renderField('Start Date', 'start_date')}
                <div className="input-group">
                  <label>End Date</label>
                  <input
                    type="text"
                    value={formData.end_date || ''}
                    disabled={formData.is_present}
                    onChange={(event) => handleChange('end_date', event.target.value)}
                    style={{ opacity: formData.is_present ? 0.5 : 1, cursor: formData.is_present ? 'not-allowed' : 'text' }}
                    placeholder={formData.is_present ? 'Present' : ''}
                  />
                </div>
              </div>
              <div className="input-group-row">
                <input
                  type="checkbox"
                  id="is_present"
                  checked={formData.is_present || false}
                  onChange={(event) => handleChange('is_present', event.target.checked)}
                />
                <label htmlFor="is_present">Currently working here / In progress (Present)</label>
              </div>
            </>
          )}

          {table === 'projects' && (
            <>
              {renderField('Cover Image URL', 'image_url')}
              {renderField('Cover Image Description', 'image_alt')}
            </>
          )}

          {table === 'awards' && (
            <>
              {renderField('Organization', 'organization')}
              {renderField('Year', 'year')}
              {renderField('Description', 'description')}
            </>
          )}

          {table === 'site_profile' && (
            <>
              {renderField('Heading', 'heading')}
              {renderTextarea('Introduction', 'intro')}
              {renderTextarea('Biography', 'bio')}
              {renderField('Location', 'location')}
              {renderField('Email', 'email', 'email')}
              {renderField('GitHub URL', 'github', 'url')}
              {renderField('LinkedIn URL', 'linkedin', 'url')}
              {renderField('Resume PDF URL', 'resume_url', 'url')}
            </>
          )}

          {table === 'personal_entries' && (
            <>
              {renderField('Category', 'kind')}
              {renderTextarea('Story', 'body')}
              {renderField('Date', 'date', 'date')}
              {renderField('Music / Related URL', 'external_url', 'url')}
              <div className="list-editor">
                <label>Photo Gallery</label>
                {(formData.images || []).map((photo, index) => (
                  <div className="gallery-row" key={index}>
                    <input type="url" placeholder="Image URL" value={photo.url || ''} onChange={(event) => handleArrayChange('images', index, 'url', event.target.value)} />
                    <input type="text" placeholder="Image description" value={photo.alt || ''} onChange={(event) => handleArrayChange('images', index, 'alt', event.target.value)} />
                    <input type="text" placeholder="Caption" value={photo.caption || ''} onChange={(event) => handleArrayChange('images', index, 'caption', event.target.value)} />
                    <button onClick={() => removeArrayItem('images', index)} className="btn-danger-small"><Trash2 size={14} /></button>
                  </div>
                ))}
                <button onClick={() => addArrayItem('images', { url: '', alt: '', caption: '' })} className="btn-add"><Plus size={14} /> Add Photo</button>
              </div>
            </>
          )}

          {table === 'journey_scene_content' && (
            <>
              {renderField('Scene', 'scene_id')}
              {renderTextarea('Description', 'description')}
            </>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {table === 'projects' && (
              <>
                {renderField('GitHub Repo Link', 'github_link')}
                {renderField('Live Demo / Web Link', 'link')}
                {renderField('Demo Link Label (Optional)', 'link_text')}
              </>
            )}
            {isExperience && (
              <>
                {renderField('Website Link', 'link')}
                {renderField('Link Label (Optional)', 'link_text')}
              </>
            )}
            {table === 'awards' && (
              <>
                {renderField('Credential Link', 'link')}
                {renderField('Link Label (Optional)', 'link_text')}
              </>
            )}
          </div>

          {(table === 'projects' || isExperience || table === 'awards') && (
            <div className="list-editor">
              <label>Bullets / Highlights</label>
              {(formData.bullets || []).map((bullet, index) => (
                <div key={index} className="list-row">
                  <input type="text" value={bullet.text || ''} onChange={(event) => handleArrayChange('bullets', index, 'text', event.target.value)} />
                  <button onClick={() => removeArrayItem('bullets', index)} className="btn-danger-small"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('bullets', { text: '' })} className="btn-add"><Plus size={14} /> Add Bullet</button>
            </div>
          )}

          {(table === 'skills' || table === 'projects' || isExperience) && (
            <div className="list-editor">
              <label>{table === 'skills' ? 'Tags in this Category' : 'Tech Stack / Skills'}</label>
              {(formData.skills || []).map((skill, index) => (
                <div key={index} className="list-row">
                  <input type="text" value={skill.tag || ''} onChange={(event) => handleArrayChange('skills', index, 'tag', event.target.value)} />
                  <button onClick={() => removeArrayItem('skills', index)} className="btn-danger-small"><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('skills', { tag: '' })} className="btn-add"><Plus size={14} /> Add Tag</button>
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
