import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  FolderPlus,
  MessageSquarePlus,
  Pencil,
  Palette,
  Trash2,
} from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";
import { useFolder } from "../context/FolderContext";
import { useModal } from "../context/ModalContext";

// Inline styles (required since this needs to work outside Tailwind context)
const styles = {
  menu: {
    position: "absolute" as const,
    zIndex: 100000,
    minWidth: 220,
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: 6,
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    fontFamily: "var(--font-sans)",
  },
  header: {
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
    borderBottom: "1px solid var(--border-default)",
    marginBottom: 4,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    maxWidth: 200,
  },
  divider: {
    height: 1,
    backgroundColor: "var(--border-default)",
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
  const { type, onClose: closeModal } = useModal();

  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const { x, y, folderName } = contextMenu;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (menuRef.current?.contains(target)) {
        return;
      }

      // Check if the click is inside any modal content
      const modalWrapper = document.querySelector('[class*="organizer-pointer-events-auto"]');
      if (modalWrapper?.contains(target)) {
        return;
      }

      // Close both context menu and addSubfolder modal
      closeContextMenu();
      if (type === 'addSubfolder') {
        closeModal();
      }
    };

    const handleScroll = () => {
      closeContextMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContextMenu();
      }
    };

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
  }, [closeContextMenu, type, closeModal]);

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
      <ContextMenuItem
        icon={<FolderPlus size={16} />}
        label="Add subfolder"
        onClickWithRect={handleAddSubfolder}
      />

      {/* Add Chat */}
      <ContextMenuItem
        icon={<MessageSquarePlus size={16} />}
        label="Add chat"
        onClick={handleAddChat}
      />

      {/* Divider */}
      <div style={styles.divider} />

      {/* Change Color */}
      <ContextMenuItem
        icon={<Palette size={16} />}
        label="Change color"
        onClick={handleChangeColor}
      />

      {/* Rename */}
      <ContextMenuItem
        icon={<Pencil size={16} />}
        label="Rename"
        onClick={handleRename}
      />

      {/* Divider */}
      <div style={styles.divider} />

      {/* Delete */}
      <ContextMenuItem
        icon={<Trash2 size={16} />}
        label="Delete"
        isDanger
        onClick={handleDelete}
      />
    </div>
  );
};

export default FolderContextMenu;
