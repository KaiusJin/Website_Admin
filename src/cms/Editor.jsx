import {useEffect,useRef,useState} from 'react';
import {supabase} from '../lib/supabase';
import {schemas,cleanPayload,validate,kinds,scenes} from './schema';
import Preview from './Preview';
function Gallery({value=[],onChange}){
 const update=(i,k,v)=>onChange(value.map((p,n)=>n===i?{...p,[k]:v}:p));
 return <div>{value.map((photo,i)=><fieldset className="cms-photo" key={i}><legend>Photo {i+1}</legend>{['url','alt','caption'].map(k=><label className="input-group" key={k}>{k==='url'?'Published image URL':k==='alt'?'Image description':'Caption'}<input type={k==='url'?'url':'text'} value={photo[k]||''} onChange={e=>update(i,k,e.target.value)}/></label>)}<button type="button" className="btn btn-outline" onClick={()=>onChange(value.filter((_,n)=>n!==i))}>Remove from gallery</button></fieldset>)}<button type="button" className="btn btn-outline" onClick={()=>onChange([...value,{url:'',alt:'',caption:''}])}>Add photo</button></div>;
}
export default function Editor({table,item,draft,onClose,onSaved}){
 const dialog=useRef(null);const [targetId]=useState(()=>item?.id||draft?.target_id||crypto.randomUUID());
 const [value,setValue]=useState(()=>cleanPayload(table,draft?.state==='draft'?draft.payload:item||{kind:'photography',scene_id:'cottage'}));
 const [saved,setSaved]=useState(draft),[base,setBase]=useState(draft?.state==='draft'?draft.base_revision:item?.updated_at||null);
 const [lang,setLang]=useState('en'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[dirty,setDirty]=useState(false),[preview,setPreview]=useState(null);
 useEffect(()=>{dialog.current?.showModal();return()=>dialog.current?.close();},[]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const close=()=>{if(!busy&&(!dirty||window.confirm('Discard changes that have not been saved to a draft?')))onClose();};
 const change=(key,v,translated)=>{setDirty(true);setNotice('');setValue(old=>lang==='zh-CN'&&translated?{...old,translations:{...old.translations,'zh-CN':{...old.translations?.['zh-CN'],[key]:v}}}:{...old,[key]:v});};
 const save=async(publish=false)=>{
  const payload=cleanPayload(table,value),errors=validate(table,payload);if(errors.length){setError(errors.join(' '));return;}
  setBusy(true);setError('');setNotice('');
  try{
   const {data:d,error:e}=await supabase.rpc('journey_save_draft',{p_table:table,p_target:targetId,p_payload:payload,p_base:base,p_expected:saved?.updated_at||null});if(e)throw e;setSaved(d);setDirty(false);
   if(publish){const {data:r,error:e2}=await supabase.rpc('journey_publish',{p_draft:d.id,p_expected:d.updated_at});if(e2)throw e2;setBase(r.updated_at);const {data:latest,error:readError}=await supabase.from('content_drafts').select('*').eq('id',d.id).single();if(readError)throw readError;setSaved(latest);setNotice(payload.visibility==='public'?'Published. Both websites can now read this content.':'Saved to live content with '+payload.visibility+' visibility.');}
   else setNotice('Draft saved privately. Published content is unchanged.');
   onSaved();
  }catch(e){setError(e.message);}finally{setBusy(false);}
 };
 const fields=schemas[table].fields;
 return <dialog ref={dialog} className="cms-editor" onCancel={e=>{e.preventDefault();close();}}><header><div><small>{schemas[table].label}</small><h2>{item?'Edit content':'New content'}</h2></div><button className="btn btn-outline" disabled={busy} onClick={close}>Close</button></header><div className="cms-editor-body"><div className="cms-toolbar"><button className={'btn '+(lang==='en'?'btn-primary':'btn-outline')} onClick={()=>setLang('en')}>English</button><button className={'btn '+(lang==='zh-CN'?'btn-primary':'btn-outline')} onClick={()=>setLang('zh-CN')}>简体中文</button><span>Empty translations fall back to English.</span></div>
 <fieldset disabled={busy} className="cms-fields">{fields.filter(f=>lang==='en'||f.translated).map(f=>{
 const v=lang==='zh-CN'?value.translations?.['zh-CN']?.[f.key]:value[f.key];const update=x=>change(f.key,x,f.translated);
 let input;if(f.type==='images')input=<Gallery value={v||[]} onChange={update}/>;
 else if(f.type==='checkbox')input=<input type="checkbox" checked={!!v} onChange={e=>update(e.target.checked)}/>;
 else if(['kind','scene'].includes(f.type))input=<select value={v||''} onChange={e=>update(e.target.value)}>{(f.type==='kind'?kinds:scenes).map(x=><option key={x}>{x}</option>)}</select>;
 else if(['tags','bullets'].includes(f.type)){const key=f.type==='tags'?'tag':'text';input=<textarea rows={5} value={(v||[]).map(x=>x[key]).join('\n')} onChange={e=>update(e.target.value.split('\n').map(x=>({[key]:x})))}/>;}
 else if(f.type==='textarea')input=<textarea rows={5} value={v||''} onChange={e=>update(e.target.value)}/>;
 else input=<input type={f.type} value={v||''} onChange={e=>update(e.target.value)}/>;
 return f.type==='images'?<section className="input-group" key={f.key}><h3>{f.label}{lang==='zh-CN'?' · 中文':''}</h3>{input}</section>:<label className="input-group" key={f.key}><span>{f.label}{lang==='zh-CN'?' · 中文':''}</span>{input}</label>;
 })}</fieldset><label className="input-group">Visibility after publishing<select disabled={busy} value={value.visibility} onChange={e=>change('visibility',e.target.value,false)}><option value="public">Public</option><option value="private">Private</option><option value="draft">Draft</option><option value="archived">Archived (can restore)</option></select></label>
 {error&&<p className="cms-error" role="alert">{error}</p>}{notice&&<p className="cms-success" role="status">{notice}</p>}
 </div><footer><button className="btn btn-outline" disabled={busy} onClick={()=>setPreview(cleanPayload(table,value))}>Preview</button><button className="btn btn-outline" disabled={busy} onClick={()=>save(false)}>Save draft</button><button className="btn btn-primary" disabled={busy} onClick={()=>save(true)}>{busy?'Saving…':'Publish content'}</button></footer>{preview&&<Preview table={table} payload={preview} targetId={targetId} onClose={()=>setPreview(null)}/>}</dialog>;
}
