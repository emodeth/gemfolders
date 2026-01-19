import React from "react";
import { useModal } from "../context/ModalContext";
import { Search, FolderPlus } from "lucide-react";
import { Button } from "./ui/Button";
import FolderTree from "./FolderTree";
import Tooltip from "./Tooltip";

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
          className="organizer-absolute organizer-left-3 organizer-top-1/2 organizer-transform organizer--translate-y-1/2 organizer-text-text-muted"
        />
        <input
          type="text"
          placeholder="Search folders..."
          className="organizer-w-full organizer-bg-bg-input organizer-border organizer-border-border-default organizer-rounded-lg organizer-py-2 organizer-pl-10 organizer-pr-4 organizer-text-sm organizer-text-text-primary organizer-placeholder-text-muted focus:organizer-outline-none focus:organizer-border-blue-500 organizer-transition-colors"
        />
      </div>

      <div className="organizer-flex organizer-items-center organizer-justify-end organizer-mb-4">
        <Tooltip text="Create folder" position="left" >
          <Button
            variant="icon"
            onClick={handleCreateFolder}
            className="organizer-text-text-secondary hover:organizer-text-text-primary"
          >
            <FolderPlus size={18} />
          </Button>
        </Tooltip>
      </div>

      <FolderTree />
    </div>
  );
};

export default FoldersTab;
