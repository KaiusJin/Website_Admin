import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Award,
  Code,
  LogOut,
  Users,
  HeartHandshake,
  UserRound,
  BookOpen,
  Image,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import DataManager from "../components/DataManager";
import MediaLibrary from "../cms/MediaLibrary";
import { contentLabels } from "../cms/contentLabels";

const tabs = [
  ["site_profile", UserRound],
  ["work_experiences", Briefcase],
  ["club_experiences", Users],
  ["volunteer_experiences", HeartHandshake],
  ["projects", LayoutDashboard],
  ["awards", Award],
  ["skills", Code],
  ["personal_entries", BookOpen],
  ["journey_scene_content", Image],
  ["media", Image],
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("projects");
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const handleLogout = async () => {
    setSigningOut(true);
    setError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSigningOut(false);
    }
  };
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <strong>
            Kaius Jin<span>.</span>
          </strong>
          <span>Content studio</span>
        </div>
        <label className="mobile-navigation">
          <span className="sr-only">Content section</span>
          <select aria-label="Content section" value={activeTab} onChange={event => setActiveTab(event.target.value)}>
            {tabs.map(([id]) => <option key={id} value={id}>{contentLabels[id].plural}</option>)}
          </select>
        </label>
        <nav aria-label="Content sections">
          {tabs.map(([id, Icon]) => (
            <button
              type="button"
              key={id}
              className={`nav-item ${activeTab === id ? "active" : ""}`}
              aria-current={activeTab === id ? "page" : undefined}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={18} aria-hidden="true" />
              {contentLabels[id].plural}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="nav-item sign-out"
          disabled={signingOut}
          onClick={handleLogout}
        >
          <LogOut size={18} aria-hidden="true" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </aside>
      <main className="main-content">
        <header className="page-header">
          <h1>{contentLabels[activeTab].plural}</h1>
          <a
            className="website-link"
            href="https://kaiusjin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            View site <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </header>
        {error && (
          <p className="cms-error" role="alert">
            {error}
          </p>
        )}
        {activeTab === "media" ? (
          <MediaLibrary />
        ) : (
          <DataManager key={activeTab} table={activeTab} />
        )}
      </main>
    </div>
  );
}
