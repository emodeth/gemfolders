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
    <Tooltip text={tab.label}>
      <button
        onClick={onClick}
        className={`organizer-relative organizer-px-2 organizer-py-3 organizer-rounded-lg organizer-transition-all organizer-text-white hover:organizer-text-white/70`}
      >
        {tab.icon}
        {active && (
          <div
            className="organizer-absolute organizer-bottom-0 organizer-left-1/2 organizer--translate-x-1/2 organizer-h-[2px] organizer-rounded-full"
            style={{
              background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
              width: "20px",
            }}
          />
        )}
      </button>
    </Tooltip>
  );
};

export default TabButton;
