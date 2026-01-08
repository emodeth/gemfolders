import React, { useState } from "react";
import { Search, FolderPlus } from "lucide-react";

const FoldersTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full">
      <div className="organizer-relative organizer-mb-2">
        <Search
          size={16}
          className="organizer-absolute organizer-left-3 organizer-top-1/2 organizer-transform organizer--translate-y-1/2 organizer-text-gray-500"
        />
        <input
          type="text"
          placeholder="Search folders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="organizer-w-full organizer-bg-[#2a2a2a] organizer-border organizer-border-[#3a3a3a] organizer-rounded-lg organizer-py-2 organizer-pl-10 organizer-pr-4 organizer-text-sm organizer-text-gray-200 organizer-placeholder-gray-500 focus:organizer-outline-none focus:organizer-border-blue-500 organizer-transition-colors"
        />
      </div>

      <div className="organizer-flex organizer-justify-end organizer-mb-4">
        <button
          className="organizer-p-2 organizer-rounded-lg organizer-bg-[#2a2a2a] organizer-border organizer-border-[#3a3a3a] organizer-text-gray-400 hover:organizer-text-white hover:organizer-bg-[#3a3a3a] organizer-transition-all"
          title="Create folder"
        >
          <FolderPlus size={18} />
        </button>
      </div>

      <div className="organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-flex-1 organizer-text-center">
        <p className="organizer-text-gray-300 organizer-font-medium organizer-mb-1">
          No folders yet
        </p>
        <p className="organizer-text-gray-500 organizer-text-sm">
          Create a folder to organize your chats
        </p>
      </div>
    </div>
  );
};

export default FoldersTab;
