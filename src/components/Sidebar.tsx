import React, { useState } from "react";
import {
  ArrowRightFromLineIcon,
  Bookmark,
  User,
  Settings,
  Folders,
} from "lucide-react";

import FoldersTab from "./FoldersTab";
import BookmarksTab from "./BookmarksTab";
import ProfileTab from "./ProfileTab";
import SettingsTab from "./SettingsTab";

type TabType = "folders" | "bookmarks" | "profile" | "settings";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("folders");

  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: "folders", icon: <Folders size={18} />, label: "Folders" },
    { id: "bookmarks", icon: <Bookmark size={18} />, label: "Bookmarks" },
    { id: "profile", icon: <User size={18} />, label: "Profile" },
    { id: "settings", icon: <Settings size={18} />, label: "Settings" },
  ];



  const renderTabContent = () => {
    switch (activeTab) {
      case "folders":
        return <FoldersTab />;
      case "bookmarks":
        return <BookmarksTab />;
      case "profile":
        return <ProfileTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`organizer-px-6 organizer-py-8 organizer-fixed organizer-top-0 organizer-right-0 organizer-h-full organizer-w-96 organizer-bg-[#1e1e1e] organizer-shadow-2xl organizer-transform organizer-transition-transform organizer-duration-300 organizer-ease-in-out organizer-z-[9999] organizer-flex organizer-flex-col ${isOpen ? "organizer-translate-x-0" : "organizer-translate-x-full"
        }`}
    >
      <div className="organizer-flex organizer-items-center  ">
        <button
          onClick={onClose}
          className="organizer-rounded-lg organizer-text-white hover:organizer-bg-[#2a2a2a] organizer-transition-all organizer-p-2
          "
          title="Close sidebar"
        >
          <ArrowRightFromLineIcon size={18} />
        </button>

        <div className="organizer-flex organizer-items-center organizer-gap-2 organizer-mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`organizer-relative organizer-px-2 organizer-py-3 organizer-rounded-lg organizer-transition-all organizer-text-white hover:organizer-text-white/70`}
              title={tab.label}
            >
              {tab.icon}
              {activeTab === tab.id && (
                <div
                  className="organizer-absolute organizer-bottom-0 organizer-left-1/2 organizer--translate-x-1/2 organizer-h-[2px] organizer-rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                    width: "20px",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>


      <div className="organizer-mt-4">
        <h2 className="organizer-text-white organizer-font-semibold organizer-text-lg organizer-mb-2">
          {tabs.find((t) => t.id === activeTab)?.label}
        </h2>
      </div>


      <div className="organizer-flex-1 organizer-overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Sidebar;
