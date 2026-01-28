import React from "react";
import { useModal } from "../context/ModalContext";
import { FolderPlus } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import FolderTree from "./FolderTree";
import Tooltip from "./Tooltip";

const FoldersTab: React.FC = () => {
  const { onOpen, onClose, isOpen, type } = useModal();
  const [searchTerm, setSearchTerm] = React.useState("");

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
        <Input
          type="text"
          placeholder="Search folders..."
          className="organizer-rounded-lg"
          variant="ghost"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      <FolderTree searchTerm={searchTerm} dragWidth={335} />
    </div>
  );
};

export default FoldersTab;
