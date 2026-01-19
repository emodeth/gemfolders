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

const styles = {
  menu: {
    position: "absolute" as const,
    zIndex: 100000,
    minWidth: 150,
    backgroundColor: "var(--bg-background)",
    border: "1px solid var(--border-default)",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: 4,
    display: "flex",
    flexDirection: "column" as const,
    gap: 1,
    fontFamily: "var(--font-sans)",
  },
  header: {
    padding: "6px 10px",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 4,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    maxWidth: 160,
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

      const modalWrapper = document.querySelector('[class*="organizer-pointer-events-auto"]');
      if (modalWrapper?.contains(target)) {
        return;
      }

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

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const menuWidth = menuRect.width || 220;
      const menuHeight = menuRect.height || 300;

      const sidebar = menuRef.current.closest('[class*="organizer-fixed"]');
      let offsetX = 0;
      let offsetY = 0;

      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        offsetX = sidebarRect.left;
        offsetY = sidebarRect.top;
      }

      let newLeft = x - offsetX;
      let newTop = y - offsetY;

      if (x + menuWidth > window.innerWidth - 10) {
        newLeft = x - offsetX - menuWidth;
      }

      if (y + menuHeight > window.innerHeight - 10) {
        newTop = y - offsetY - menuHeight;
      }

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
      <div style={styles.header}>{folderName}</div>

      <ContextMenuItem
        icon={<FolderPlus size={16} />}
        label="Add subfolder"
        onClickWithRect={handleAddSubfolder}
      />

      <ContextMenuItem
        icon={<MessageSquarePlus size={16} />}
        label="Add chat"
        onClick={handleAddChat}
      />


      <ContextMenuItem
        icon={<Palette size={16} />}
        label="Change color"
        onClick={handleChangeColor}
      />

      <ContextMenuItem
        icon={<Pencil size={16} />}
        label="Rename"
        onClick={handleRename}
      />

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
