import React, { useState, useMemo } from "react";
import { X, Search, MessageSquareText } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { useFolder } from "~context/FolderContext";
import type { Folder as FolderType } from "~lib/storage";
import MoveChatModalItem from "./MoveChatModalItem";

const MoveChatModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folders } = useFolder();
  const { chatName = "", chatId, currentFolderId, onMove } = data || {};

  const [searchQuery, setSearchQuery] = useState("");

  // Flatten all folders recursively
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

    // Don't move to the same folder
    if (folderId === currentFolderId) {
      onClose();
      return;
    }

    await onMove(chatId, folderId);
    onClose();
  };

  return (
    <div
      className="organizer-w-[520px] organizer-min-h-[600px] organizer-bg-[#1e1e1e] organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden organizer-flex organizer-flex-col organizer-fixed organizer-top-[15%] organizer-left-1/2 -organizer-translate-x-1/2"
      style={{ maxHeight: "70vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-4 organizer-py-3">
        <div className="organizer-flex organizer-items-center organizer-gap-2">
          <MessageSquareText size={18} className="organizer-text-gray-400" />
          <span className="organizer-text-[14px] organizer-font-medium organizer-text-white">
            Move "{chatName}" to
          </span>
        </div>
        <button
          className="organizer-text-gray-400 hover:organizer-text-white organizer-transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="organizer-px-4 organizer-py-3">
        <div className="organizer-relative">
          <Search
            size={16}
            className="organizer-absolute organizer-left-3 organizer-top-1/2 -organizer-translate-y-1/2 organizer-text-gray-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter folders by name..."
            className="organizer-w-full organizer-bg-[#2a2a2a] organizer-rounded-md organizer-pl-9 organizer-pr-3 organizer-py-2 organizer-text-white organizer-text-sm organizer-border organizer-border-[#333] organizer-outline-none focus:organizer-border-blue-500 organizer-placeholder-gray-500"
            autoFocus
          />
        </div>
      </div>

      <div className="organizer-flex-1 organizer-overflow-y-auto organizer-px-4 organizer-pb-4 organizer-min-h-[200px] organizer-max-h-[300px]">
        {filteredFolders.length === 0 ? (
          <div className="organizer-text-center organizer-py-8">
            <p className="organizer-text-gray-400 organizer-text-sm">
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
