import React from "react";
import { useModal } from "../context/ModalContext";
import { Search, FolderPlus } from "lucide-react";
import { Button } from "./ui/Button";
import FolderTree from "./FolderTree";

const FoldersTab: React.FC = () => {
  const { onOpen, onClose, isOpen, type } = useModal();

  const handleCreateFolder = (e: React.MouseEvent) => {
    if (isOpen && type === 'createFolder') {
      onClose();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    onOpen("createFolder", {
      anchorRect: {
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
        width: rect.width,
        height: rect.height,
      }
    });
  };

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
          className="organizer-w-full organizer-bg-[#2a2a2a] organizer-border organizer-border-[#3a3a3a] organizer-rounded-lg organizer-py-2 organizer-pl-10 organizer-pr-4 organizer-text-sm organizer-text-gray-200 organizer-placeholder-gray-500 focus:organizer-outline-none focus:organizer-border-blue-500 organizer-transition-colors"
        />
      </div>

      <div className="organizer-flex organizer-justify-end organizer-mb-4">
        <Button
          variant="icon"
          onClick={handleCreateFolder}
        >
          <FolderPlus size={18} />
        </Button>
      </div>

      <FolderTree />
    </div>
  );
};

export default FoldersTab;
