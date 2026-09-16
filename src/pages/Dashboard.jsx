import { useState } from 'react';
import { LayoutDashboard, Briefcase, Award, Code, LogOut, Users, HeartHandshake, UserRound, BookOpen, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DataManager from '../components/DataManager';
import MediaLibrary from '../cms/MediaLibrary';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('projects');

  const tabs = [
    { id: 'projects', label: 'Projects', icon: <LayoutDashboard size={20} /> },
    { id: 'work_experiences', label: 'Work Experience', icon: <Briefcase size={20} /> },
    { id: 'club_experiences', label: 'Clubs & Design Teams', icon: <Users size={20} /> },
    { id: 'volunteer_experiences', label: 'Volunteer Experience', icon: <HeartHandshake size={20} /> },
    { id: 'awards', label: 'Awards', icon: <Award size={20} /> },
    { id: 'skills', label: 'Skills', icon: <Code size={20} /> },
    { id: 'site_profile', label: 'Profile & Contact', icon: <UserRound size={20} /> },
    { id: 'personal_entries', label: 'Personal Journal', icon: <BookOpen size={20} /> },
    { id: 'journey_scene_content', label: 'Scene Descriptions', icon: <Image size={20} /> },
    { id: 'media', label: 'Media Library', icon: <Image size={20} /> },
  ];

  const handleLogout = () => supabase.auth.signOut();
  const activeLabel = tabs.find(tab => tab.id === activeTab)?.label;

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h1>Kaius <span>Jin</span> Admin</h1>
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </div>
          ))}
        </nav>

        <div className="nav-item" onClick={handleLogout} style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <LogOut size={20} />
          Sign Out
        </div>
      </aside>

      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>{activeLabel}</h2>
        </header>

        {activeTab === 'media' ? <MediaLibrary /> : <DataManager table={activeTab} />}
      </main>
    </div>
  );
}
