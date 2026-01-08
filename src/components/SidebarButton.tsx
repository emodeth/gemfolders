import React from "react";
import { PanelRight } from "lucide-react";


const SidebarButton: React.FC = () => {

  return (
    <button
      className="organizer-flex organizer-items-center organizer-justify-center organizer-w-10 organizer-h-10 organizer-rounded-full organizer-bg-transparent organizer-border-2 organizer-border-blue-400 organizer-cursor-pointer organizer-transition-all organizer-duration-200 organizer-ease-in-out hover:organizer-bg-slate-800"
      title="Open Folder Organizer"
    >
      <PanelRight className="organizer-text-gray-200 hover:organizer-text-white organizer-transition-colors organizer-duration-200" size={18} />
    </button>
  );
};

export default SidebarButton;
