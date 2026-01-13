import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  FolderPlus,
  MessageSquarePlus,
  Pencil,
  Palette,
  Trash2,
} from "lucide-react";
import FolderContextMenuItem from "./FolderContextMenuItem";
import { useFolder } from "../context/FolderContext";

// Inline styles (required since this needs to work outside Tailwind context)
const styles = {
  menu: {
    position: "absolute" as const,
    zIndex: 100000,
    minWidth: 220,
    backgroundColor: "#1e1e1e",
    border: "1px solid #333",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: 6,
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  },
  header: {
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: "#e0e0e0",
    borderBottom: "1px solid #333",
    marginBottom: 4,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    maxWidth: 200,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    margin: "4px 0",
  },
};

const FolderContextMenu: React.FC = () => {
  const {
    contextMenu,
    closeContextMenu,
    handleAddSubfolder,
    handleAddChat,
    handleRename,
    handleChangeColor,
    handleDelete,
  } = useFolder();

  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const { x, y, folderName } = contextMenu;

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is inside the menu
      if (menuRef.current && menuRef.current.contains(event.target as Node)) {
        return; // Don't close if clicking inside menu
      }
      closeContextMenu();
    };

    const handleScroll = () => {
      closeContextMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

    // Use mousedown instead of click, but NOT in capture phase
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      document.addEventListener("keydown", handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeContextMenu]);

  // Calculate position relative to viewport, accounting for sidebar offset
  useLayoutEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const menuWidth = menuRect.width || 220;
      const menuHeight = menuRect.height || 300;

      // Get the sidebar element to calculate offset
      const sidebar = menuRef.current.closest('[class*="organizer-fixed"]');
      let offsetX = 0;
      let offsetY = 0;

      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        offsetX = sidebarRect.left;
        offsetY = sidebarRect.top;
      }

      // Calculate position relative to the sidebar
      let newLeft = x - offsetX;
      let newTop = y - offsetY;

      // Adjust if overflowing viewport
      if (x + menuWidth > window.innerWidth - 10) {
        newLeft = x - offsetX - menuWidth;
      }

      if (y + menuHeight > window.innerHeight - 10) {
        newTop = y - offsetY - menuHeight;
      }

      // Ensure menu doesn't go off-screen
      newTop = Math.max(10 - offsetY, newTop);
      newLeft = Math.max(10 - offsetX, newLeft);

      setPosition({ top: newTop, left: newLeft });
      setIsPositioned(true);
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      style={{
        ...styles.menu,
        top: position.top,
        left: position.left,
        visibility: isPositioned ? "visible" : "hidden",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Folder name header */}
      <div style={styles.header}>{folderName}</div>

      {/* Add Subfolder */}
      <FolderContextMenuItem
        icon={<FolderPlus size={16} />}
        label="Add subfolder"
        onClick={handleAddSubfolder}
      />

      {/* Add Chat */}
      <FolderContextMenuItem
        icon={<MessageSquarePlus size={16} />}
        label="Add chat"
        onClick={handleAddChat}
      />

      {/* Divider */}
      <div style={styles.divider} />

      {/* Change Color */}
      <FolderContextMenuItem
        icon={<Palette size={16} />}
        label="Change color"
        onClick={handleChangeColor}
      />

      {/* Rename */}
      <FolderContextMenuItem
        icon={<Pencil size={16} />}
        label="Rename"
        onClick={handleRename}
      />

      {/* Divider */}
      <div style={styles.divider} />

      {/* Delete */}
      <FolderContextMenuItem
        icon={<Trash2 size={16} />}
        label="Delete"
        isDanger
        onClick={handleDelete}
      />
    </div>
  );
};

export default FolderContextMenu;
