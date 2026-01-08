import React from "react";
import { PanelRight } from "lucide-react";

interface SidebarButtonProps {
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="organizer-relative organizer-flex organizer-items-center organizer-justify-center organizer-w-10 organizer-h-10 organizer-rounded-full organizer-bg-transparent organizer-border-2 organizer-border-blue-400 organizer-cursor-pointer organizer-transition-all organizer-duration-200 organizer-ease-in-out hover:organizer-bg-slate-800 [&_svg]:organizer-text-gray-200 [&_svg]:organizer-transition-colors [&_svg]:organizer-duration-200 hover:[&_svg]:organizer-text-white"
      title="Open Folder Organizer"
    >
      <PanelRight size={18} />
    </button>
  );
};

export default SidebarButton;
