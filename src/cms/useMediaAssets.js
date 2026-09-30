import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { loadContent } from "./contentStore";

export default function useMediaAssets(revision = 0) {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    loadContent(supabase, "media_assets", abort.signal)
      .then((items) => {
        if (active) {
          setAssets(items.map(asset => ({
            ...asset, url: supabase.storage.from("journey-media").getPublicUrl(asset.path).data.publicUrl,
          })));
          setError("");
        }
      })
      .catch((reason) => {
        if (active) {
          setAssets([]);
          setError(reason.message);
        }
      });
    return () => {
      active = false;
      abort.abort();
    };
  }, [revision]);
  return { assets, error };
}
