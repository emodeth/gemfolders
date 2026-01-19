import React from "react";
import { PanelRight } from "lucide-react";
import Tooltip from "./Tooltip";

interface SidebarButtonProps {
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ onClick }) => {
  return (
    <Tooltip text="Open Folder Organizer" position="left">
      <button
        onClick={onClick}
        className="organizer-relative organizer-flex organizer-items-center organizer-justify-center organizer-w-10 organizer-h-10 organizer-rounded-full organizer-bg-transparent organizer-border-2 organizer-border-primary organizer-cursor-pointer organizer-transition-all organizer-duration-200 organizer-ease-in-out hover:organizer-bg-bg-surface-hover [&_svg]:organizer-text-text-primary [&_svg]:organizer-transition-colors [&_svg]:organizer-duration-200 hover:[&_svg]:organizer-text-text-primary"
      >
        <PanelRight size={18} />
      </button>
    </Tooltip>
  );
};

export default SidebarButton;
