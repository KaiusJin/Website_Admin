import { experienceTables } from "./contentLabels.js";

export async function loadContent(client, table, signal) {
  const query = client.from(table).select("*");
  const ordered = table === "media_assets"
    ? query.order("created_at", { ascending: false })
    : query.order("order", { ascending: true }).order("id");
  const { data, error } = await ordered.abortSignal(signal);
  if (error) throw error;
  return data || [];
}

export async function saveOrder(client, table, items) {
  const results = await Promise.all(
    items.map((item, order) =>
      client
        .from(table)
        .update({ order })
        .eq("id", item.id)
        .select("id")
        .single(),
    ),
  );
  const failure = results.find((result) => result.error);
  if (failure) throw failure.error;
}

const generated = ["id", "order", "created_at", "updated_at", "singleton", "role_icon", "category_icon"];
const retired = {
  site_profile: ["heading", "hero_tags", "focus_areas", "resume_url", "contact_slogans"],
  awards: ["description", "bullets", "link_text"],
};

export function editableContent(row, table) {
  const excluded = [...generated, ...(retired[table] || []), ...(experienceTables.includes(table) ? ["link_text"] : [])];
  return Object.fromEntries(Object.entries(row).filter(([key]) => !excluded.includes(key)));
}
