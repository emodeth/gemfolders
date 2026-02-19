import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Plus, EyeOff } from "lucide-react";
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
import { useSettings } from "../context/SettingsContext";
import { ThemeWrapper } from "./ThemeWrapper";
import cssText from "data-text:~style.css";


interface GeminiFolderWidgetProps {
  onOpenExtension?: () => void;
}

const PORTAL_CONTAINER_ID = "gemfolders-widget-portal";

const getOrCreatePortalContainer = (): HTMLElement => {
  const existing = document.getElementById(PORTAL_CONTAINER_ID);
  if (existing) {
    const shadow = existing.shadowRoot;
    if (shadow) {
      return shadow.getElementById("gemfolders-portal-mount") || existing;
    }
    return existing;
  }

  // Create host element on document.body
  const host = document.createElement("div");
  host.id = PORTAL_CONTAINER_ID;
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.overflow = "visible";
  host.style.zIndex = "2147483600";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  // Create shadow DOM with CSS
  const shadow = host.attachShadow({ mode: "open" });

  const baseFontSize = 16;
  let css = cssText.replaceAll(":root", ":host");
  const remRegex = /([\d.]+)rem/g;
  css = css.replaceAll(remRegex, (_match, remValue) => {
    const pixelsValue = Number.parseFloat(remValue) * baseFontSize;
    return `${pixelsValue}px`;
  });

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    :host {
      line-height: 1.5;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    *, ::before, ::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: #e5e7eb;
    }
    #gemfolders-portal-mount > * {
      pointer-events: auto;
    }
    ${css}
  `;
  shadow.appendChild(styleEl);

  const mountPoint = document.createElement("div");
  mountPoint.id = "gemfolders-portal-mount";
  shadow.appendChild(mountPoint);

  return mountPoint;
};

const GeminiFolderWidget: React.FC<GeminiFolderWidgetProps> = ({ onOpenExtension }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { contextMenu, folders } = useFolder();
  const { chatContextMenu } = useChat();
  const { onOpen } = useModal();
  const { updateSettings } = useSettings();
  const portalContainerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    portalContainerRef.current = getOrCreatePortalContainer();
  }, []);

  useEffect(() => {
    const handleAddToFolder = (event: CustomEvent) => {
      const { chatId, chatTitle, chatUrl } = event.detail;
      onOpen('addToFolder', {
        chatId,
        chatTitle,
        chatUrl
      });
    };

    globalThis.addEventListener('gemfolders-add-to-folder', handleAddToFolder as EventListener);

    return () => {
      globalThis.removeEventListener('gemfolders-add-to-folder', handleAddToFolder as EventListener);
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

  const overlayContent = (
    <ThemeWrapper>
      {contextMenu.isOpen && <FolderContextMenu />}
      {chatContextMenu.isOpen && <ChatContextMenu />}
      <ModalManager />
    </ThemeWrapper>
  );

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
      <div className="organizer-flex organizer-flex-col organizer-h-auto organizer-font-sans organizer-scrollbar-gutter-stable animate-fadeIn">
        <div className="gemfolders-folder-widget-visible-content">
          <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-2 organizer-py-2 organizer-pl-6">
            <div
              className="organizer-flex organizer-items-center organizer-gap-2 organizer-cursor-pointer"
            >
              <span className="organizer-text-sm organizer-font-medium organizer-text-text-primary">
                Folders
              </span>
              <Tooltip text="Hide from sidebar" position="bottom">
                <div
                  className="organizer-flex organizer-items-center organizer-justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateSettings({ hideFoldersFromSidebar: true });
                    toast.success("Folders hidden. You can enable them in settings.", {
                      id: "folders-hidden-toast",
                      duration: 4000
                    });
                  }}
                >
                  <EyeOff size={14} className="organizer-text-primary" />
                </div>
              </Tooltip>

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


          <div className="organizer-px-2 organizer-pb-2 organizer-pl-6">
            <Input
              type="text"
              placeholder="Search..."
              className="organizer-rounded-lg"
              variant="ghost"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="organizer-px-2 organizer-pl-6">
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


        </div>
      </div>
      {portalContainerRef.current && createPortal(overlayContent, portalContainerRef.current)}
    </>
  );
};

export default GeminiFolderWidget;
