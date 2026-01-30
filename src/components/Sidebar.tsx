import React, { useState, useMemo, useEffect } from "react";
import Tooltip from "./Tooltip";
import {
  ArrowRightFromLineIcon,
  Bookmark,
  User,
  Settings,
  Folders,
} from "lucide-react";

import FoldersTab from "./FoldersTab";
import BookmarksTab from "./BookmarksTab";
import AccountTab from "./AccountTab";
import SettingsTab from "./SettingsTab";
import TabBar from "./TabBar";
import FolderContextMenu from "./FolderContextMenu";
import ChatContextMenu from "./ChatContextMenu";
import { useFolder } from "../context/FolderContext";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

type TabType = "folders" | "bookmarks" | "account" | "settings";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_TABS: { id: TabType; icon: React.ReactNode; label: string }[] = [
  { id: "folders", icon: <Folders size={18} />, label: "Folders" },
  { id: "bookmarks", icon: <Bookmark size={18} />, label: "Bookmarks" },
  { id: "account", icon: <User size={18} />, label: "Account" },
  { id: "settings", icon: <Settings size={18} />, label: "Settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { session, isLoading: isAuthLoading } = useAuth();
  const isLoggedIn = !!session?.user;


  const disabledTabs = useMemo(() => {
    if (!isAuthLoading && !isLoggedIn) {
      return ["folders", "bookmarks", "settings"];
    }
    return [];
  }, [isLoggedIn, isAuthLoading]);

  const [activeTab, setActiveTab] = useState<TabType>("folders");
  const { contextMenu } = useFolder();
  const { chatContextMenu } = useChat();


  useEffect(() => {
    if (!isAuthLoading) {
      if (isLoggedIn) {
        setActiveTab("folders");
      } else {
        setActiveTab("account");
      }
    }
  }, [isLoggedIn, isAuthLoading]);

  const currentTabLabel = ALL_TABS.find((t) => t.id === activeTab)?.label || "Account";

  const renderTabContent = () => {
    if (!isLoggedIn && activeTab !== "account") {
      return <AccountTab />;
    }

    switch (activeTab) {
      case "folders":
        return <FoldersTab />;
      case "bookmarks":
        return <BookmarksTab />;
      case "account":
        return <AccountTab />;
      case "settings":
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`organizer-px-6 organizer-py-8 organizer-fixed organizer-top-0 organizer-right-0 organizer-h-full organizer-w-96 organizer-bg-bg-background organizer-shadow-2xl organizer-transform organizer-transition-transform organizer-duration-300 organizer-ease-in-out organizer-z-[9999] organizer-flex organizer-flex-col ${isOpen ? "organizer-translate-x-0" : "organizer-translate-x-full"
        }`}
    >
      <div className="organizer-flex organizer-items-center  ">
        <Tooltip text="Hide" position="bottom">
          <button
            onClick={onClose}
            className="organizer-rounded-lg organizer-text-text-primary hover:organizer-text-text-secondary organizer-transition-all organizer-p-2"
          >
            <ArrowRightFromLineIcon size={18} />
          </button>
        </Tooltip>

        <div className="organizer-flex organizer-items-center organizer-gap-2 organizer-mx-auto">
          <TabBar
            tabs={ALL_TABS}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabType)}
            disabledTabs={disabledTabs}
          />
        </div>
      </div>

      <div className="organizer-mt-4">
        <h2 className="organizer-text-text-primary organizer-font-semibold organizer-text-lg organizer-mb-2">
          {currentTabLabel}
        </h2>
      </div>

      <div className="organizer-flex-1 organizer-overflow-y-auto">
        {renderTabContent()}
      </div>

      {isLoggedIn && contextMenu.isOpen && <FolderContextMenu />}
      {isLoggedIn && chatContextMenu.isOpen && <ChatContextMenu />}
    </div>
  );
};

export default Sidebar;

