import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './cms.css';

const accepted = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'application/pdf'];

export default function MediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [alt, setAlt] = useState('');

  useEffect(() => {
    let active = true;
    supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setAssets(data || []);
      });
    return () => { active = false; };
  }, [revision]);

  const publicUrl = asset => supabase.storage.from('journey-media').getPublicUrl(asset.path).data.publicUrl;

  const upload = async () => {
    if (!file) return;
    if (!accepted.includes(file.type) || file.size > 20 * 1024 * 1024 || file.size === 0) {
      setError('Choose a JPEG, PNG, WebP, AVIF, MP3, OGG, WAV or PDF up to 20 MB.');
      return;
    }
    if (file.type.startsWith('image/') && !alt.trim()) {
      setError('Describe this image before uploading.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');
    try {
      const id = crypto.randomUUID();
      const extension = file.name.split('.').pop().replace(/[^a-z0-9]/gi, '').toLowerCase();
      const path = `${id}.${extension || 'bin'}`;
      const { error: uploadError } = await supabase.storage
        .from('journey-media')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { error: databaseError } = await supabase
        .from('media_assets')
        .insert({ id, path, name: file.name, mime: file.type, size: file.size, alt });
      if (databaseError) throw Error(`File uploaded, but metadata could not be saved. ${databaseError.message} Path: ${path}`);

      setNotice('Upload complete.');
      setFile(null);
      setAlt('');
      setRevision(value => value + 1);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async asset => {
    try {
      await navigator.clipboard.writeText(publicUrl(asset));
      setNotice('URL copied.');
    } catch {
      setPreview({ ...asset, url: publicUrl(asset) });
    }
  };

  return (
    <>
      <p className="cms-description">Upload images, audio or a resume, then copy the URL into the related content entry.</p>
      <section className="card">
        <h3>Upload media</h3>
        <label className="input-group">
          Image, audio or resume PDF · up to 20 MB
          <input key={file?.name || 'empty'} type="file" accept={accepted.join(',')} disabled={busy} onChange={event => setFile(event.target.files?.[0] || null)} />
        </label>
        <label className="input-group">
          Image description
          <input type="text" value={alt} disabled={busy} onChange={event => setAlt(event.target.value)} />
        </label>
        <button className="btn btn-primary" disabled={busy || !file} onClick={upload}>{busy ? 'Working…' : 'Upload'}</button>
      </section>

      {error && <p role="alert" className="cms-error">{error}</p>}
      {notice && <p role="status" className="cms-success">{notice}</p>}

      <div className="cms-media-grid">
        {assets.map(asset => (
          <article className="card" key={asset.id}>
            <h3>{asset.name}</h3>
            <p>{asset.alt || asset.mime}</p>
            <small>{(asset.size / 1024 / 1024).toFixed(2)} MB</small>
            <div className="cms-toolbar">
              <button className="btn btn-outline" disabled={busy} onClick={() => setPreview({ ...asset, url: publicUrl(asset) })}>Preview</button>
              <button className="btn btn-outline" onClick={() => copy(asset)}>Copy URL</button>
            </div>
          </article>
        ))}
      </div>

      {preview && (
        <section className="card cms-media-preview">
          <button className="btn btn-outline" onClick={() => setPreview(null)}>Close preview</button>
          <h3>{preview.name}</h3>
          {preview.mime.startsWith('image/')
            ? <img src={preview.url} alt={preview.alt} />
            : preview.mime.startsWith('audio/')
              ? <audio src={preview.url} controls />
              : <a href={preview.url} target="_blank" rel="noreferrer">Open PDF</a>}
          <label className="input-group">URL<input readOnly value={preview.url} /></label>
        </section>
      )}
    </>
  );
}
