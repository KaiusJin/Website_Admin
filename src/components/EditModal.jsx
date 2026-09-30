import { useEffect, useRef, useState } from "react";
import { contentLabels, experienceTables } from "../cms/contentLabels";
import { editableContent } from "../cms/contentStore";
import { X } from "lucide-react";
import ArrayEditor from "./ArrayEditor";
import MediaPicker from "../cms/MediaPicker";

<<<<<<< Updated upstream
const experienceTables = ['work_experiences', 'club_experiences', 'volunteer_experiences'];
const titleTables = ['projects', ...experienceTables, 'awards', 'personal_entries', 'journey_scene_content'];
=======
const journeyFields = [
  ["Welcome introduction", "welcome_intro"],
  ["Focus label", "focus"],
  ["Profile heading", "heading"],
  ["Profile introduction", "intro"],
  ["Profile biography", "bio"],
  ["Education school", "education_school"],
  ["Education field", "education_field"],
  ["Location detail", "location_detail"],
  ["Contact heading", "contact_heading"],
  ["Contact introduction", "contact_intro"],
  ["Contact closing", "contact_outro"],
];
>>>>>>> Stashed changes

export default function EditModal({
  onClose,
  onSave,
  item,
  table,
  busy,
  error = "",
  entries = [],
}) {
  const [formData, setFormData] = useState(() =>
    item
      ? editableContent(item, table)
      : table === "personal_entries"
        ? { kind: "daily" }
        : {},
  );
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  const isExperience = experienceTables.includes(table);

  const handleChange = (field, value, locale) => {
    setFormData((previous) => {
      if (locale) return { ...previous, [locale]: { ...previous[locale], [field]: value } };
      const next = { ...previous, [field]: value };
      if (field === "is_present" && value === true) next.end_date = "";
      if (field === "end_date" && value !== "") next.is_present = false;
      return next;
    });
  };

<<<<<<< Updated upstream
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
=======
  const updateArray = (field, update) => {
    setFormData((previous) => ({
      ...previous,
      [field]: update(previous[field] || []),
    }));
  };

  const renderField = (label, field, type = "text", locale) => {
    const multiline = type === "textarea";
    const Control = multiline ? "textarea" : "input";
    const id = locale ? `${locale}-${field}` : `field-${field}`;
    return (
      <div className="input-group" key={field}>
        <label htmlFor={id}>{label}</label>
        <Control
          id={id}
          type={multiline ? undefined : type}
          rows={multiline ? (locale ? 3 : 5) : undefined}
          value={(locale ? formData[locale]?.[field] : formData[field]) ?? ""}
          onChange={event => handleChange(field, event.target.value, locale)}
        />
      </div>
    );
  };

  const renderJourneyFields = (locale, label) => (
    <section>
      <h3>Journey — {label}</h3>
      {journeyFields.map(([fieldLabel, field]) => renderField(fieldLabel, field, "textarea", locale))}
    </section>
>>>>>>> Stashed changes
  );

  return (
    <dialog
      ref={dialogRef}
      className="modal-overlay"
      aria-labelledby="editor-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="editor-title">
            {item ? "Edit" : "New"} {contentLabels[table].singular}
          </h2>
          <button
            disabled={busy}
            onClick={onClose}
            className="btn-icon"
            aria-label="Close editor"
          >
            <X />
          </button>
        </div>

        <div className="modal-body">
          <fieldset className="editor-fields" disabled={busy}>
            {error && (
              <p role="alert" className="cms-error">
                {error}
              </p>
            )}
            {table !== "skills" && table !== "site_profile" && renderField("Title", "title")}
            {table === "skills" && renderField("Category Name", "category")}

            {isExperience && renderField("Role", "role")}

<<<<<<< Updated upstream
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
              <MediaPicker kind="image" onSelect={asset => setFormData(previous => ({ ...previous, image_url: asset.url, image_alt: asset.alt }))} />
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
              <MediaPicker kind="pdf" onSelect={asset => handleChange('resume_url', asset.url)} />
              {renderField('Resume PDF URL', 'resume_url', 'url')}
            </>
          )}

          {table === 'personal_entries' && (
            <>
              <label className="input-group">Category<select value={formData.kind} onChange={event => handleChange('kind', event.target.value)}>{['photography', 'travel', 'daily', 'music'].map(kind => <option key={kind} value={kind}>{kind}</option>)}</select></label>
              {renderTextarea('Story', 'body')}
              {renderField('Date', 'date', 'date')}
              {formData.kind === 'music' && <MediaPicker kind="audio" onSelect={asset => handleChange('external_url', asset.url)} />}
              {renderField('Music / Related URL', 'external_url', 'url')}
              <MediaPicker kind="image" onSelect={asset => addArrayItem('images', { url: asset.url, alt: asset.alt, caption: '' })} />
              <div className="list-editor">
                <label>Photo Gallery</label>
                {(formData.images || []).map((photo, index) => (
                  <div className="gallery-row" key={index}>
                    <input type="url" placeholder="Image URL" value={photo.url || ''} onChange={(event) => handleArrayChange('images', index, 'url', event.target.value)} />
                    <input type="text" placeholder="Image description" value={photo.alt || ''} onChange={(event) => handleArrayChange('images', index, 'alt', event.target.value)} />
                    <input type="text" placeholder="Caption" value={photo.caption || ''} onChange={(event) => handleArrayChange('images', index, 'caption', event.target.value)} />
                    <button onClick={() => removeArrayItem('images', index)} className="btn-danger-small"><Trash2 size={14} /></button>
=======
            {(table === "projects" || isExperience) && (
              <>
                <div className="form-grid">
                  {renderField("Start Date", "start_date")}
                  <div className="input-group">
                    <label htmlFor="end-date">End date</label>
                    <input
                      id="end-date"
                      type="text"
                      value={formData.end_date || ""}
                      disabled={formData.is_present}
                      onChange={(event) =>
                        handleChange("end_date", event.target.value)
                      }
                      style={{
                        opacity: formData.is_present ? 0.5 : 1,
                        cursor: formData.is_present ? "not-allowed" : "text",
                      }}
                      placeholder={formData.is_present ? "Present" : ""}
                    />
>>>>>>> Stashed changes
                  </div>
                </div>
                <div className="input-group-row">
                  <input
                    type="checkbox"
                    id="is_present"
                    checked={formData.is_present || false}
                    onChange={(event) =>
                      handleChange("is_present", event.target.checked)
                    }
                  />
                  <label htmlFor="is_present">
                    Currently working here / In progress (Present)
                  </label>
                </div>
              </>
            )}

            {table === "projects" && (
              <>
                <MediaPicker
                  kind="image"
                  onSelect={(asset) =>
                    setFormData((previous) => ({
                      ...previous,
                      image_url: asset.url,
                      image_alt: asset.alt,
                    }))
                  }
                />
                {renderField("Cover Image URL", "image_url")}
                {renderField("Cover Image Description", "image_alt")}
              </>
            )}

            {table === "awards" && (
              <>
                {renderField("Organization", "organization")}
                {renderField("Year", "year")}
              </>
            )}

            {table === "site_profile" && (
              <>
                <h3>Classic profile</h3>
                {renderField("Name", "name")}
                {renderField("Hero badge", "hero_badge")}
                {renderField("Introduction", "intro", "textarea")}
                {renderField("Biography", "bio", "textarea")}
                {renderField("Location", "location")}
                {renderField("Education", "education")}
                <h3>Contact links</h3>
                {renderField("Email", "email", "email")}
                {renderField("GitHub URL", "github", "url")}
                {renderField("LinkedIn URL", "linkedin", "url")}
                {renderJourneyFields("journey_en", "English")}
                {renderJourneyFields("journey_zh", "中文")}
              </>
            )}

            {table === "personal_entries" && (
              <>
                <label className="input-group">
                  Category
                  <select
                    value={formData.kind}
                    onChange={(event) =>
                      handleChange("kind", event.target.value)
                    }
                  >
                    {["photography", "travel", "daily", "music"].map((kind) => (
                      <option key={kind} value={kind}>
                        {kind}
                      </option>
                    ))}
                  </select>
                </label>
                {renderField("Story", "body", "textarea")}
                {renderField("Date", "date", "date")}
                {formData.kind === "music" && (
                  <MediaPicker
                    kind="audio"
                    onSelect={(asset) =>
                      handleChange("external_url", asset.url)
                    }
                  />
                )}
                {renderField("Music / Related URL", "external_url", "url")}
                <MediaPicker
                  kind="image"
                  onSelect={(asset) =>
                    updateArray("images", (images) => [
                      ...images,
                      {
                        url: asset.url,
                        alt: asset.alt,
                        caption: "",
                      },
                    ])
                  }
                />
                <ArrayEditor
                  label="Photo Gallery"
                  itemLabel="photo"
                  addLabel="Add Photo"
                  rowClass="gallery-row"
                  fields={[
                    {
                      key: "url",
                      label: "Image URL",
                      type: "url",
                      placeholder: "Image URL",
                    },
                    {
                      key: "alt",
                      label: "Image description",
                      placeholder: "Image description",
                    },
                    {
                      key: "caption",
                      label: "Caption",
                      placeholder: "Caption",
                    },
                  ]}
                  value={formData.images}
                  onChange={(update) => updateArray("images", update)}
                />
              </>
            )}

            {table === "journey_scene_content" && (
              <>
                <label className="input-group">
                  Scene
                  <select
                    value={formData.scene_id || ""}
                    onChange={(event) =>
                      handleChange("scene_id", event.target.value)
                    }
                  >
                    <option value="" disabled>
                      Choose a scene
                    </option>
                    {[
                      "cottage",
                      "meadow",
                      "town",
                      "library",
                      "academy",
                      "lake",
                      "station",
                    ]
                      .filter(
                        (scene) =>
                          scene === item?.scene_id ||
                          !entries.some((entry) => entry.scene_id === scene),
                      )
                      .map((scene) => (
                        <option key={scene} value={scene}>
                          {scene}
                        </option>
                      ))}
                  </select>
                </label>
                {renderField("Description", "description", "textarea")}
              </>
            )}

            <div className="form-grid">
              {table === "projects" && (
                <>
                  {renderField("GitHub Repo Link", "github_link")}
                  {renderField("Live Demo / Web Link", "link")}
                  {renderField("Demo Link Label (Optional)", "link_text")}
                </>
              )}
              {isExperience && renderField("Website Link", "link")}
              {table === "awards" && renderField("Credential URL", "link", "url")}
            </div>

            {(table === "projects" || isExperience) && (
              <ArrayEditor
                label={table === "projects" ? "Slogan (first bullet) / Highlights" : "Bullets / Highlights"}
                itemLabel="highlight"
                addLabel="Add Bullet"
                fields={[{ key: "text", label: "Highlight" }]}
                value={formData.bullets}
                onChange={(update) => updateArray("bullets", update)}
              />
            )}

            {(table === "skills" || table === "projects" || isExperience) && (
              <ArrayEditor
                label={
                  table === "skills"
                    ? "Tags in this Category"
                    : "Tech Stack / Skills"
                }
                itemLabel="skill"
                addLabel="Add Tag"
                fields={[{ key: "tag", label: "Skill" }]}
                value={formData.skills}
                onChange={(update) => updateArray("skills", update)}
              />
            )}
          </fieldset>
        </div>

        <div className="modal-footer">
          <button disabled={busy} className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            disabled={busy}
            className="btn btn-primary"
            onClick={() => onSave(formData)}
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
