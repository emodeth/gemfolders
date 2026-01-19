import React from "react";
import Tooltip from "./Tooltip";

interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface TabButtonProps {
  active: boolean;
  tab: TabItem;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  tab,
  onClick,
}) => {
  return (
    <Tooltip text={tab.label} position="bottom">
      <button
        data-tab-button
        onClick={onClick}
        className={`organizer-relative organizer-px-2 organizer-py-3 organizer-rounded-lg organizer-transition-all ${active
            ? "organizer-text-text-primary"
            : "organizer-text-text-secondary hover:organizer-text-text-primary"
          }`}
      >
        {tab.icon}
      </button>
    </Tooltip>
  );
};

export default TabButton;
