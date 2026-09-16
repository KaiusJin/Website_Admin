import {useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {schemas,cleanPayload,validate,kinds,scenes} from './schema';

function Gallery({value=[],onChange}){
 const update=(i,k,v)=>onChange(value.map((photo,index)=>index===i?{...photo,[k]:v}:photo));
 return <div>{value.map((photo,i)=><fieldset className="cms-photo" key={i}><legend>Photo {i+1}</legend>{['url','alt','caption'].map(key=><label className="input-group" key={key}>{key==='url'?'Image URL':key==='alt'?'Image description':'Caption'}<input type={key==='url'?'url':'text'} value={photo[key]||''} onChange={e=>update(i,key,e.target.value)}/></label>)}<button type="button" className="btn btn-outline" onClick={()=>onChange(value.filter((_,index)=>index!==i))}>Remove photo</button></fieldset>)}<button type="button" className="btn btn-outline" onClick={()=>onChange([...value,{url:'',alt:'',caption:''}])}>Add photo</button></div>;
}

export default function Editor({table,item,order=0,onClose,onSaved}){
 const dialog=useRef(null);
 const [value,setValue]=useState(()=>cleanPayload(table,item||{kind:'photography',scene_id:'cottage',order}));
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[dirty,setDirty]=useState(false);
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>element?.close();},[]);
 useEffect(()=>{const warn=event=>{if(dirty){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const close=()=>{if(!busy&&(!dirty||window.confirm('Discard unsaved changes?')))onClose();};
 const change=(key,next)=>{
  setDirty(true);
  setValue(current=>{
   const updated={...current,[key]:next};
   if(key==='is_present'&&next)updated.end_date='';
   if(key==='end_date'&&next)updated.is_present=false;
   return updated;
  });
 };
 const save=async()=>{
  const payload=cleanPayload(table,value),errors=validate(table,payload);
  if(errors.length){setError(errors.join(' '));return;}
  setBusy(true);setError('');
  const query=item?.id?supabase.from(table).update(payload).eq('id',item.id):supabase.from(table).insert(payload);
  const {error}=await query;
  if(error){setError(error.message);setBusy(false);return;}
  setDirty(false);setBusy(false);onSaved();
 };
 return <dialog ref={dialog} className="cms-editor" onCancel={event=>{event.preventDefault();close();}}>
  <header><div><small>{schemas[table].label}</small><h2>{item?'Edit entry':'New entry'}</h2></div><button className="btn btn-outline" disabled={busy} onClick={close}>Close</button></header>
  <div className="cms-editor-body">
   <fieldset disabled={busy} className="cms-fields">{schemas[table].fields.map(field=>{
    const current=value[field.key];
    const update=next=>change(field.key,next);
    let input;
    if(field.type==='images')input=<Gallery value={current||[]} onChange={update}/>;
    else if(field.type==='checkbox')input=<input type="checkbox" checked={!!current} onChange={e=>update(e.target.checked)}/>;
    else if(['kind','scene'].includes(field.type))input=<select value={current||''} onChange={e=>update(e.target.value)}>{(field.type==='kind'?kinds:scenes).map(option=><option key={option}>{option}</option>)}</select>;
    else if(['tags','bullets'].includes(field.type)){const key=field.type==='tags'?'tag':'text';input=<textarea rows={5} value={(current||[]).map(entry=>entry[key]).join('\n')} onChange={e=>update(e.target.value.split('\n').map(text=>({[key]:text})))}/>;}
    else if(field.type==='textarea')input=<textarea rows={5} value={current||''} onChange={e=>update(e.target.value)}/>;
    else input=<input type={field.type} value={current||''} onChange={e=>update(e.target.value)}/>;
    return field.type==='images'?<section className="input-group" key={field.key}><h3>{field.label}</h3>{input}</section>:<label className="input-group" key={field.key}><span>{field.label}</span>{input}</label>;
   })}</fieldset>
   {error&&<p className="cms-error" role="alert">{error}</p>}
  </div>
  <footer><button className="btn btn-outline" disabled={busy} onClick={close}>Cancel</button><button className="btn btn-primary" disabled={busy} onClick={save}>{busy?'Saving…':'Save changes'}</button></footer>
 </dialog>;
}
