import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';
import {schemas} from '../cms/schema';
import ContentManager from '../cms/ContentManager';
import MediaLibrary from '../cms/MediaLibrary';
import '../cms/cms.css';
export default function Dashboard(){
 const [activeTab,setActiveTab]=useState('projects'),[access,setAccess]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;supabase.rpc('journey_is_admin').then(({data,error})=>{if(active){setAccess(!!data);if(error)setError(error.message);}});return()=>{active=false;};},[]);
 const logout=async()=>{const {error}=await supabase.auth.signOut();if(error)setError(error.message);};
 const tabs=[...Object.entries(schemas).map(([id,s])=>({id,label:s.label})),{id:'media',label:'Media library'}];
 if(access===null)return <main className="cms-access">Checking administrator access…</main>;
 if(!access)return <main className="cms-access"><h1>Administrator access required</h1><p>{error||'This account is not authorized to manage the portfolio.'}</p><button className="btn btn-outline" onClick={logout}>Sign out</button></main>;
 return <div className="admin-layout"><aside className="sidebar"><h1>Kaius <span>Jin</span> Admin</h1><nav>{tabs.map(t=><button key={t.id} className={`nav-item ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.label}</button>)}</nav><a className="nav-item" href={import.meta.env.VITE_PUBLIC_ORIGIN||'https://kaiusjin.com'} target="_blank" rel="noreferrer">View website ↗</a><button className="nav-item" onClick={logout}>Sign out</button></aside><main className="main-content"><header className="cms-heading"><small>CONTENT STUDIO</small><h2>{tabs.find(t=>t.id===activeTab).label}</h2></header>{error&&<p role="alert" className="cms-error">{error}</p>}{activeTab==='media'?<MediaLibrary/>:<ContentManager key={activeTab} table={activeTab}/>}</main></div>;
}
