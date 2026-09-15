import React from "react";
import Tooltip from "./Tooltip";
import { useI18n } from "~lib/i18n";

interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface TabButtonProps {
  active: boolean;
  tab: TabItem;
  onClick: () => void;
  disabled?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({
  active,
  tab,
  onClick,
  disabled = false,
}) => {
  const { t } = useI18n();
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <Tooltip text={disabled ? `${tab.label} (${t("loginRequired")})` : tab.label} position="bottom">
      <button
        data-tab-button
        onClick={handleClick}
        disabled={disabled}
        className={`organizer-relative organizer-px-2 organizer-py-3 organizer-rounded-lg organizer-transition-all ${disabled
            ? "organizer-text-text-secondary organizer-opacity-40 organizer-cursor-not-allowed"
            : active
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

