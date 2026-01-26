import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import FolderTree from "./FolderTree";
import { Input } from "./ui/Input";
import Tooltip from "./Tooltip";
import { Button } from "./ui/Button";

import { useFolder } from "../context/FolderContext";
import { useChat } from "../context/ChatContext";
import FolderContextMenu from "./FolderContextMenu";
import ChatContextMenu from "./ChatContextMenu";
import ModalManager from "./ModalManager";
import { useModal } from "../context/ModalContext";

interface GeminiFolderWidgetProps {
  onOpenExtension?: () => void;
}

const GeminiFolderWidget: React.FC<GeminiFolderWidgetProps> = ({ onOpenExtension }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { contextMenu, folders } = useFolder();
  const { chatContextMenu } = useChat();
  const { onOpen } = useModal();

  useEffect(() => {
    const handleAddToFolder = (event: CustomEvent) => {
      const { chatId, chatTitle, chatUrl } = event.detail;
      onOpen('addToFolder', {
        chatId,
        chatTitle,
        chatUrl
      });
    };

    globalThis.addEventListener('gemini-add-to-folder', handleAddToFolder as EventListener);

    return () => {
      globalThis.removeEventListener('gemini-add-to-folder', handleAddToFolder as EventListener);
    };
  }, [onOpen]);

  const handleCreateFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onOpen('createFolder', {
      anchorRect: rect,
      placement: 'right-start'
    });
  };

  const displayedFolders = React.useMemo(() => {
    if (!folders) return [];
    if (searchTerm || showAll) return folders;
    return folders.slice(0, 3);
  }, [folders, searchTerm, showAll]);

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-auto organizer-font-sans organizer-scrollbar-gutter-stable">
      <div className="gemini-folder-widget-visible-content">
        <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-2 organizer-py-2">
          <div
            className="organizer-flex organizer-items-center organizer-gap-2 organizer-cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="organizer-text-sm organizer-font-medium organizer-text-text-primary">
              Folders
            </span>

          </div>
          <Tooltip text="Create Folder" position="left">
            <Button
              variant="icon"
              onClick={handleCreateFolder}
              className="organizer-text-text-secondary hover:organizer-text-text-primary"
            >
              <Plus size={16} />
            </Button>
          </Tooltip>
        </div>

        {isExpanded && (
          <>
            <div className="organizer-px-2 organizer-pb-2">
              <Input
                type="text"
                placeholder="Search folders..."
                className="organizer-rounded-lg"
                variant="ghost"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="organizer-px-2">
              <FolderTree searchTerm={searchTerm} folders={displayedFolders} />
              {!searchTerm && !showAll && folders && folders.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="organizer-w-full organizer-text-xs hover:organizer-text-primary/70 organizer-cursor-pointer organizer-text-center organizer-mt-2 organizer-text-text-primary organizer-transition-colors organizer-bg-transparent organizer-border-none organizer-outline-none"
                >
                  Show {folders.length - 3} more
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {contextMenu.isOpen && <FolderContextMenu />}
      {chatContextMenu.isOpen && <ChatContextMenu />}
      <ModalManager />
    </div>
  );
};

export default GeminiFolderWidget;
