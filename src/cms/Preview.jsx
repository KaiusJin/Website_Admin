import {useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {schemas} from './schema';
const origin=import.meta.env.VITE_PUBLIC_ORIGIN||(location.hostname==='localhost'||location.hostname==='127.0.0.1'?'http://127.0.0.1:5173':'https://kaiusjin.com');
export default function Preview({table,payload,targetId,onClose}){
 const frame=useRef(null);const [token]=useState(()=>crypto.randomUUID());const [data,setData]=useState(null),[error,setError]=useState(''),[ready,setReady]=useState(false);
 useEffect(()=>{let live=true;Promise.all(Object.keys(schemas).map(async t=>{const r=await supabase.from(t).select('*');if(r.error)throw r.error;return[t,(r.data||[]).filter(i=>i.visibility==='public')];})).then(rows=>{if(!live)return;const snapshot=Object.fromEntries(rows);snapshot[table]=[...snapshot[table].filter(i=>i.id!==targetId),{...payload,id:targetId,visibility:'public'}];setData(snapshot);}).catch(e=>live&&setError(e.message));return()=>{live=false;};},[table,payload,targetId]);
 useEffect(()=>{const listener=e=>{if(e.origin===new URL(origin).origin&&e.source===frame.current?.contentWindow&&e.data?.type==='journey-preview-ready'&&e.data.token===token)setReady(true);};window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);},[token]);
 useEffect(()=>{if(ready&&data)frame.current?.contentWindow.postMessage({type:'journey-preview',token,data},new URL(origin).origin);},[ready,data,token]);
 return <section className="cms-preview"><header><strong>Private preview · unsaved changes</strong><button className="btn btn-outline" onClick={onClose}>Close preview</button></header>{error?<p role="alert">{error}</p>:<iframe ref={frame} src={`${origin}/journey?preview=${token}`} title="Private journey preview"/>}<p>No credentials are sent to the preview. Close this window to discard its temporary content.</p></section>;
}
