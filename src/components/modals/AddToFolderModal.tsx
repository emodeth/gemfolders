import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { X, FolderPlus } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { useFolder } from "~context/FolderContext";
import type { Folder as FolderType } from "~lib/storage";
import { Input } from "../ui/Input";
import { isLightColor } from "~constants/colors";
import { truncateText } from "~lib/utils";

interface AddToFolderItemProps {
  folder: FolderType;
  onSelect: (id: string) => void;
}

const AddToFolderItem: React.FC<AddToFolderItemProps> = ({
  folder,
  onSelect,
}) => {
  const bgColor = folder.color || "#60a5fa";
  const itemCount = folder.children?.length || 0;
  const textColor = isLightColor(bgColor) ? "#1f2937" : "#f9fafb";

  return (
    <div
      className="organizer-flex organizer-items-center organizer-justify-between organizer-px-3 organizer-py-2 organizer-cursor-pointer organizer-rounded-md organizer-transition-all organizer-mb-1.5 hover:organizer-opacity-80 organizer-h-8"
      style={{ backgroundColor: bgColor }}
      onClick={() => onSelect(folder.id)}
    >
      <span
        className="organizer-text-sm organizer-font-medium organizer-truncate"
        style={{ color: textColor }}
      >
        {folder.name}
      </span>
      <span
        className="organizer-text-xs organizer-opacity-80 organizer-font-semibold"
        style={{ color: textColor }}
      >
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
    </div>
  );
};

const AddToFolderModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folders, onAddChatsToFolder } = useFolder();
  const { chatId, chatTitle, chatUrl } = data || {};

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
    if (!chatId) return;

    try {
      await onAddChatsToFolder(folderId, [{
        id: chatId,
        title: chatTitle || "Untitled Chat",
        url: chatUrl || `https://gemini.google.com/app/${chatId}`
      }]);
      const targetFolder = allFlatFolders.find(f => f.id === folderId);
      toast.success(`Added to "${truncateText(targetFolder?.name || 'folder')}"`);
      onClose();
    } catch (error) {
      console.error("Failed to add chat to folder:", error);
      toast.error("Failed to add to folder");
    }
  };

  return (
    <div
      className="organizer-w-[520px] organizer-min-h-[600px] organizer-bg-bg-background organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden organizer-flex organizer-flex-col"
      style={{ maxHeight: "70vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-4 organizer-py-3">
        <div className="organizer-flex organizer-items-center organizer-gap-2 organizer-overflow-hidden">
          <FolderPlus size={18} className="organizer-text-text-secondary organizer-flex-shrink-0" />
          <span className="organizer-text-[14px] organizer-font-medium organizer-text-text-primary organizer-truncate">
            Add "{chatTitle || 'Untitled Chat'}" to
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
              {searchQuery ? "No folders match your search." : "No folders available. Create a folder first."}
            </p>
          </div>
        ) : (
          filteredFolders.map((folder) => (
            <AddToFolderItem
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

export default AddToFolderModal;
