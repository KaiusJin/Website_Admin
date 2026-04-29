import React, { useState } from 'react';
import { LayoutDashboard, Briefcase, Award, Code, LogOut, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import DataManager from '../components/DataManager';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('projects');

  const tabs = [
    { id: 'projects', label: 'Projects', icon: <LayoutDashboard size={20} /> },
    { id: 'experiences', label: 'Experience', icon: <Briefcase size={20} /> },
    { id: 'awards', label: 'Awards', icon: <Award size={20} /> },
    { id: 'skills', label: 'Skills', icon: <Code size={20} /> },
  ];

  const handleLogout = () => supabase.auth.signOut();

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h1>Admin Panel</h1>
        <nav style={{ flex: 1 }}>
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
          <h2>{tabs.find(t => t.id === activeTab).label}</h2>
        </header>

        <DataManager table={activeTab} />
      </main>
    </div>
  );
}
