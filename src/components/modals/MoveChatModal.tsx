import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { X, MessageSquareText } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { useFolder } from "~context/FolderContext";
import type { Folder as FolderType } from "~lib/storage";
import MoveChatModalItem from "./MoveChatModalItem";
import { Input } from "../ui/Input";
import { truncateText } from "~lib/utils";

const MoveChatModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folders } = useFolder();
  const { chatName = "", chatId, currentFolderId, onMove } = data || {};

  const [searchQuery, setSearchQuery] = useState("");

  const flattenFolders = (folderList: FolderType[]): FolderType[] => {
    return folderList.flatMap((item) => {
      if (item.type === "folder") {
        const subfolders = item.children?.filter((c) => c.type === "folder") || [];
        return [item, ...flattenFolders(subfolders)];
      }
      return [];
    });
  };

  const allFlatFolders = useMemo(() => {
    return flattenFolders(folders);
  }, [folders]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery) return allFlatFolders;
    return allFlatFolders.filter((folder) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allFlatFolders, searchQuery]);

  const handleSelectFolder = async (folderId: string) => {
    if (!chatId || !onMove) return;

    if (folderId === currentFolderId) {
      onClose();
      return;
    }

    const targetFolder = allFlatFolders.find(f => f.id === folderId);
    await onMove(chatId, folderId);
    toast.success(`Moved to "${truncateText(targetFolder?.name || 'folder')}"`);
    onClose();
  };

  return (
    <div
      className="organizer-w-[520px] organizer-min-h-[600px] organizer-bg-bg-background organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden organizer-flex organizer-flex-col"
      style={{ maxHeight: "70vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-4 organizer-py-3">
        <div className="organizer-flex organizer-items-center organizer-gap-2 organizer-overflow-hidden">
          <MessageSquareText size={18} className="organizer-text-text-secondary organizer-flex-shrink-0" />
          <span className="organizer-text-[13px] organizer-font-medium organizer-text-text-primary organizer-truncate">
            Move "{chatName}" to
          </span>
        </div>
        <button
          className="organizer-text-text-secondary hover:organizer-text-text-primary organizer-transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="organizer-px-4 organizer-py-3">
        <div className="organizer-relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter folders by name..."
            variant="ghost"
            autoFocus
          />
        </div>
      </div>

      <div className="organizer-flex-1 organizer-overflow-y-auto organizer-px-4 organizer-pb-4 organizer-min-h-[200px] organizer-max-h-[300px]">
        {filteredFolders.length === 0 ? (
          <div className="organizer-text-center organizer-py-8">
            <p className="organizer-text-text-secondary organizer-text-sm">
              {searchQuery ? "No folders match your search." : "No folders available."}
            </p>
          </div>
        ) : (
          filteredFolders.map((folder) => (
            <MoveChatModalItem
              key={folder.id}
              folder={folder}
              onSelect={handleSelectFolder}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MoveChatModal;
