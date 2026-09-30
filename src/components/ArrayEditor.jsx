import { Plus, Trash2 } from "lucide-react";

// onChange accepts an updater so consecutive edits always use the latest array.
export default function ArrayEditor({
  label,
  itemLabel,
  addLabel,
  fields,
  value = [],
  onChange,
  rowClass = "list-row",
}) {
  return (
    <div className="list-editor">
      <label>{label}</label>
      {(value || []).map((item, index) => (
        <div className={rowClass} key={index}>
          {fields.map(
            ({ key, label: fieldLabel, type = "text", placeholder }) => (
              <input
                key={key}
                type={type}
                aria-label={`${fieldLabel} ${index + 1}`}
                placeholder={placeholder}
                value={item[key] || ""}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  onChange((items) =>
                    items.map((row, rowIndex) =>
                      rowIndex === index ? { ...row, [key]: nextValue } : row,
                    ),
                  );
                }}
              />
            ),
          )}
          <button
            type="button"
            aria-label={`Remove ${itemLabel} ${index + 1}`}
            onClick={() =>
              onChange((items) =>
                items.filter((_, rowIndex) => rowIndex !== index),
              )
            }
            className="btn-danger-small"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange((items) => [
            ...items,
            Object.fromEntries(fields.map(({ key }) => [key, ""])),
          ])
        }
        className="btn-add"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}
