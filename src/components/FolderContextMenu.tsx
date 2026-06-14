import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import {
  FolderPlus,
  MessageSquarePlus,
  Pencil,
  Palette,
  Trash2,
} from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";
import { MENU_ICON_SIZE, MENU_ICON_STROKE } from "../lib/lucideMenuIcons";
import { useFolder } from "../context/FolderContext";
import { useModal } from "../context/ModalContext";

const menuIconProps = { size: MENU_ICON_SIZE, strokeWidth: MENU_ICON_STROKE };

const styles = {
  menu: {
    position: "fixed" as const,
    zIndex: 100000,
    minWidth: 180,
    backgroundColor: "var(--bg-surface)",
    border: "none",
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)",
    padding: 8,
    display: "flex",
    flexDirection: "column" as const,
    gap: 0,
    fontFamily: "var(--font-sans)",
  },
  header: {
    padding: "6px 10px",
    fontSize: 13,
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


      let parentTransformX = 0;
      let parentTransformY = 0;
      let el = menuRef.current.parentElement;

      while (el) {
        const style = window.getComputedStyle(el);
        if (style.transform !== "none") {
          const rect = el.getBoundingClientRect();
          parentTransformX = rect.left;
          parentTransformY = rect.top;
          break;
        }
        el = el.parentElement;
      }

      let newLeft = x - parentTransformX;
      let newTop = y - parentTransformY;

      if (x + menuWidth > window.innerWidth - 10) {
        newLeft = (x - parentTransformX) - menuWidth;
      } else {
        newLeft = x - parentTransformX;
      }

      let targetGlobalX = x;
      if (x + menuWidth > window.innerWidth - 10) {
        targetGlobalX = x - menuWidth;
      }

      let targetGlobalY = y;
      if (y + menuHeight > window.innerHeight - 10) {
        targetGlobalY = y - menuHeight;
      }

      targetGlobalY = Math.max(10, targetGlobalY);
      targetGlobalX = Math.max(10, targetGlobalX);

      const finalLeft = targetGlobalX - parentTransformX;
      const finalTop = targetGlobalY - parentTransformY;

      setPosition({ top: finalTop, left: finalLeft });
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
      className={isPositioned ? "modal-animate-fade" : ""}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div style={styles.header}>{folderName}</div>

      <ContextMenuItem
        icon={<FolderPlus {...menuIconProps} />}
        label="Add subfolder"
        onClickWithRect={handleAddSubfolder}
      />

      <ContextMenuItem
        icon={<MessageSquarePlus {...menuIconProps} />}
        label="Add chat"
        onClick={handleAddChat}
      />

      <ContextMenuItem
        icon={<Palette {...menuIconProps} />}
        label="Change color"
        onClick={handleChangeColor}
      />

      <ContextMenuItem
        icon={<Pencil {...menuIconProps} />}
        label="Rename"
        onClick={handleRename}
      />

      <ContextMenuItem
        icon={<Trash2 {...menuIconProps} />}
        label="Delete"
        isDanger
        onClick={handleDelete}
      />
    </div>
  );
};

export default FolderContextMenu;
