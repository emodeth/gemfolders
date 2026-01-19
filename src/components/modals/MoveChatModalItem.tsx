import React from "react";
import type { Folder as FolderType } from "~lib/storage";
import { isLightColor } from "~constants/colors";

export interface MoveChatModalItemProps {
  folder: FolderType;
  onSelect: (id: string) => void;
}

const MoveChatModalItem: React.FC<MoveChatModalItemProps> = ({
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

export default MoveChatModalItem;

