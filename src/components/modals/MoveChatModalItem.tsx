import React from "react";
import { isLightColor } from "~constants/colors";
import type { Folder as FolderType } from "~lib/storage";

export interface MoveChatModalItemProps {
  folder: FolderType;
  onSelect: (id: string) => void;
}

const MoveChatModalItem: React.FC<MoveChatModalItemProps> = ({
  folder,
  onSelect,
}) => {
  const bgColor = folder.color || "#4e8ff8";
  const itemCount = folder.children?.length || 0;
  const textColor = isLightColor(bgColor) ? "#1f1f1f" : "#fff";

  return (
    <div
      className="organizer-group organizer-flex organizer-items-center organizer-justify-between organizer-px-3 organizer-py-2 organizer-cursor-pointer organizer-rounded-md organizer-transition-shadow organizer-mb-1.5 hover:organizer-shadow-md organizer-h-8"
      style={{ backgroundColor: bgColor }}
      onClick={() => onSelect(folder.id)}
    >
      <span
        className="organizer-text-sm organizer-font-medium organizer-truncate organizer-text-text-folder group-hover:organizer-text-text-folder-hover organizer-transition-colors"
        style={{ color: textColor }}
      >
        {folder.name}
      </span>
      <span
        className="organizer-text-xs organizer-opacity-80 organizer-font-semibold organizer-text-text-folder group-hover:organizer-text-text-folder-hover organizer-transition-colors"
        style={{ color: textColor }}
      >
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
    </div>
  );
};

export default MoveChatModalItem;
