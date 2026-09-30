import useMediaAssets from './useMediaAssets';

export default function MediaPicker({ kind, onSelect }) {
  const { assets: allAssets, error } = useMediaAssets();
  const assets = allAssets.filter(asset => asset.mime?.startsWith(`${kind}/`));
  return <label className="input-group">
    Choose uploaded {kind}
    <select value="" onChange={event => {
      const asset = assets.find(asset => asset.id === event.target.value);
      if (asset) onSelect(asset);
    }}>
      <option value="" disabled>{assets.length ? 'Select a file' : 'No uploaded files'}</option>
      {assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
    </select>
    {error && <span role="alert">{error}</span>}
  </label>;
}
