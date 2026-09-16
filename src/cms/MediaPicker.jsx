import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MediaPicker({ kind, onSelect }) {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const abort = new AbortController();
    let active = true;
    supabase.from('media_assets').select('id,path,name,mime,alt').order('created_at', { ascending: false })
      .abortSignal(abort.signal).then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setAssets(data.filter(asset => kind === 'pdf' ? asset.mime === 'application/pdf' : asset.mime.startsWith(`${kind}/`)));
      });
    return () => { active = false; abort.abort(); };
  }, [kind]);
  return <label className="input-group">
    Choose uploaded {kind === 'pdf' ? 'résumé' : kind}
    <select value="" onChange={event => {
      const asset = assets.find(asset => asset.id === event.target.value);
      onSelect({ ...asset, url: supabase.storage.from('journey-media').getPublicUrl(asset.path).data.publicUrl });
    }}>
      <option value="" disabled>{assets.length ? 'Select a file' : 'No uploaded files'}</option>
      {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
    </select>
    {error && <span role="alert">{error}</span>}
  </label>;
}
