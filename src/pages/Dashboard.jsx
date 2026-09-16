import {useEffect,useState} from 'react';
import {Award,BookOpen,Briefcase,Code,FolderKanban,HeartHandshake,Image,LogOut,UserRound,Users} from 'lucide-react';
import {supabase} from '../lib/supabase';
import ContentManager from '../cms/ContentManager';
import MediaLibrary from '../cms/MediaLibrary';
import '../cms/cms.css';
const tabs=[
 {id:'projects',label:'Projects',icon:FolderKanban},
 {id:'work_experiences',label:'Work experience',icon:Briefcase},
 {id:'club_experiences',label:'Clubs & design teams',icon:Users},
 {id:'volunteer_experiences',label:'Volunteer experience',icon:HeartHandshake},
 {id:'awards',label:'Awards',icon:Award},
 {id:'skills',label:'Skills',icon:Code},
 {id:'site_profile',label:'Profile & contact',icon:UserRound},
 {id:'personal_entries',label:'Personal journal',icon:BookOpen},
 {id:'journey_scene_content',label:'Scene descriptions',icon:Image},
 {id:'media',label:'Media library',icon:Image}
];
export default function Dashboard(){
 const [activeTab,setActiveTab]=useState('projects'),[access,setAccess]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;supabase.rpc('journey_is_admin').then(({data,error})=>{if(active){setAccess(!!data);if(error)setError(error.message);}});return()=>{active=false;};},[]);
 const logout=async()=>{const {error}=await supabase.auth.signOut();if(error)setError(error.message);};
 if(access===null)return <main className="cms-access">Checking administrator access…</main>;
 if(!access)return <main className="cms-access"><h1>Administrator access required</h1><p>{error||'This account is not authorized to manage the portfolio.'}</p><button className="btn btn-outline" onClick={logout}>Sign out</button></main>;
 return <div className="admin-layout"><aside className="sidebar"><h1>Kaius <span>Jin</span> Admin</h1><nav>{tabs.map(t=>{const Icon=t.icon;return <button key={t.id} className={`nav-item ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}><Icon size={20}/>{t.label}</button>;})}</nav><a className="nav-item" href={import.meta.env.VITE_PUBLIC_ORIGIN||'https://kaiusjin.com'} target="_blank" rel="noreferrer">View website ↗</a><button className="nav-item" onClick={logout}><LogOut size={20}/>Sign out</button></aside><main className="main-content"><header className="cms-heading"><h2>{tabs.find(t=>t.id===activeTab).label}</h2></header>{error&&<p role="alert" className="cms-error">{error}</p>}{activeTab==='media'?<MediaLibrary/>:<ContentManager key={activeTab} table={activeTab}/>}</main></div>;
}
