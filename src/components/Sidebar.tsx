import React, { useState } from "react";
import Tooltip from "./Tooltip";
import {
  PanelRightClose,
  PanelRight,
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
import { useI18n } from "../lib/i18n";

type TabType = "folders" | "bookmarks" | "account" | "settings";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: "folders", icon: <Folders size={18} />, label: t("folders") },
    { id: "bookmarks", icon: <Bookmark size={18} />, label: t("bookmarks") },
    { id: "account", icon: <User size={18} />, label: t("account") },
    { id: "settings", icon: <Settings size={18} />, label: t("settings") },
  ];
  const disabledTabs: string[] = [];

  const [activeTab, setActiveTab] = useState<TabType>("folders");
  const { contextMenu } = useFolder();
  const { chatContextMenu } = useChat();

  const currentTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || t("account");

  const renderTabContent = () => {

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
      className={`organizer-px-6 organizer-py-8 organizer-fixed organizer-top-0 organizer-right-0 organizer-h-full organizer-w-96 organizer-transform organizer-transition-transform organizer-duration-300 organizer-ease-in-out organizer-z-[9999] organizer-flex organizer-flex-col organizer-bg-bg-background ${isOpen ? "organizer-translate-x-0" : "organizer-translate-x-full"
        }`}
    >
      <div className="organizer-flex organizer-items-center  ">
        <Tooltip text={t("hide")} position="bottom">
          <button
            onClick={onClose}
            className="organizer-group organizer-rounded-lg organizer-text-text-primary hover:organizer-text-text-secondary organizer-p-2"
          >
            <span className="organizer-relative organizer-block organizer-h-[18px] organizer-w-[18px]">
              <PanelRight className="organizer-absolute organizer-inset-0 organizer-opacity-100 organizer-transition-opacity organizer-duration-100 group-hover:organizer-opacity-0" size={18} />
              <PanelRightClose className="organizer-absolute organizer-inset-0 organizer-opacity-0 organizer-transition-opacity organizer-duration-100 group-hover:organizer-opacity-100" size={18} />
            </span>
          </button>
        </Tooltip>

        <div className="organizer-flex organizer-items-center organizer-gap-2 organizer-mx-auto">
          <TabBar
            tabs={tabs}
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

      {contextMenu.isOpen && <FolderContextMenu />}
      {chatContextMenu.isOpen && <ChatContextMenu />}
    </div>
  );
};

export default Sidebar;
