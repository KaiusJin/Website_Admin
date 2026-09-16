import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';
import {schemas} from './schema';
import Editor from './Editor';

export default function ContentManager({table}){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0),[editing,setEditing]=useState(null),[busy,setBusy]=useState(false);
 const reload=()=>{setLoading(true);setRevision(n=>n+1);};
 useEffect(()=>{
  const abort=new AbortController();
  supabase.from(table).select('*').order('order').abortSignal(abort.signal).then(({data,error})=>{
   if(abort.signal.aborted)return;
   if(error)setError(error.message);else{setRows(data||[]);setError('');}
   setLoading(false);
  });
  return()=>abort.abort();
 },[table,revision]);
 const move=async(index,delta)=>{
  setBusy(true);setError('');
  const reordered=[...rows];[reordered[index],reordered[index+delta]]=[reordered[index+delta],reordered[index]];
  const {error}=await supabase.rpc('journey_reorder',{p_table:table,p_rows:reordered.map(({id,updated_at})=>({id,updated_at}))});
  if(error)setError(error.message);reload();setBusy(false);
 };
 const remove=async row=>{
  if(!window.confirm(`Delete ${row.title||row.category||row.heading||'this entry'}?`))return;
  setBusy(true);setError('');
  const {error}=await supabase.from(table).delete().eq('id',row.id);
  if(error)setError(error.message);else setRows(current=>current.filter(item=>item.id!==row.id));
  setBusy(false);
 };
 const nextOrder=rows.length?Math.max(...rows.map(row=>Number(row.order)||0))+1:0;
 return <>
  <div className="cms-toolbar">
   <button className="btn btn-outline" disabled={busy} onClick={reload}>Refresh</button>
   {!(schemas[table].singleton&&rows.length)&&<button className="btn btn-primary" onClick={()=>setEditing({item:null,order:nextOrder})}>New entry</button>}
  </div>
  {error&&<p role="alert" className="cms-error">{error}</p>}
  {loading?<p>Loading content…</p>:<div className="card cms-table"><table><thead><tr><th>Content</th><th>Order</th><th>Actions</th></tr></thead><tbody>
   {rows.map((row,index)=><tr key={row.id}><td><strong>{row.title||row.category||row.heading}</strong><small>{row.kind||row.scene_id||row.role||row.year||row.category_slug}</small></td><td><button className="btn btn-outline" disabled={busy||index===0} aria-label={`Move ${row.title||row.category||'entry'} up`} onClick={()=>move(index,-1)}>↑</button> <button className="btn btn-outline" disabled={busy||index===rows.length-1} aria-label={`Move ${row.title||row.category||'entry'} down`} onClick={()=>move(index,1)}>↓</button></td><td><button className="btn btn-outline" disabled={busy} onClick={()=>setEditing({item:row})}>Edit</button> <button className="btn btn-outline cms-delete" disabled={busy} onClick={()=>remove(row)}>Delete</button></td></tr>)}
  </tbody></table>{!rows.length&&<p className="cms-empty">No entries yet.</p>}</div>}
  {editing&&<Editor key={editing.item?.id||'new'} table={table} item={editing.item} order={editing.order} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);reload();}}/>}
 </>;
}
