import React from "react";
import { createRoot, type Root } from "react-dom/client";
import GeminiFolderWidget from "../components/GeminiFolderWidget";
import { FolderProvider } from "../context/FolderContext";
import { ChatProvider } from "../context/ChatContext";
import { BookmarkProvider } from "../context/BookmarkContext";
import { ModalProvider } from "../context/ModalContext";
import { ThemeProvider } from "../context/ThemeContext";
import { SettingsProvider } from "../context/SettingsContext";
import { ThemeWrapper } from "../components/ThemeWrapper";
import ToastProvider from "../components/ToastProvider";
import cssText from "data-text:~style.css";
import { getSettings, type Settings } from "./settings";

const WIDGET_CONTAINER_ID = "gemini-organizer-folder-widget";
const WIDGET_STYLES_ID = "gemini-organizer-folder-styles";

let widgetRoot: Root | null = null;
let containerObserver: ResizeObserver | null = null;

const processStyles = (): string => {
  const baseFontSize = 16;

  // detailed reset for shadow dom environment since @tailwind base won't apply to :host
  const resetCss = `
    :host {
      line-height: 1.5;
      -webkit-text-size-adjust: 100%;
      tab-size: 4;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      font-feature-settings: normal;
      font-variation-settings: normal;
    }
    *, ::before, ::after {
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: #e5e7eb;
    }
  `;

  let processedCss = cssText.replaceAll(":root", ":host");

  const remRegex = /([\d.]+)rem/g;
  processedCss = processedCss.replaceAll(remRegex, (match, remValue) => {
    const pixelsValue = Number.parseFloat(remValue) * baseFontSize;
    return `${pixelsValue}px`;
  });

  return resetCss + processedCss;
};

const getShadowStyles = () => {
  const styleElement = document.createElement("style");
  styleElement.id = WIDGET_STYLES_ID;
  styleElement.textContent = `
    ${processStyles()}

    :host {
      font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      width: 100%;
      padding: 8px 0 16px 0;
      overflow: hidden;
      display: block;
    }

    :host > div {
      min-width: 270px;
    }

    .react-arborist {
      width: 100% !important;
    }

    :host-context(body.gemini-organizer-hide-folders-widget) .gemini-folder-widget-visible-content {
      display: none !important;
    }
    
    :host-context(body.gemini-organizer-hide-folders-widget) {
       padding: 0 !important;
    }

    :host(.collapsed) {
      display: none !important;
    }
  `;
  return styleElement;
};

const findInjectionPoint = (): { element: Element; position: "before" | "after" } | null => {
  const gemsChip = document.querySelector('[data-test-id="gems-chip"]');
  if (gemsChip) {
    const gemsContainer =
      gemsChip.closest('.gem-manager-section') ||
      gemsChip.closest('a')?.parentElement?.parentElement ||
      gemsChip.parentElement?.parentElement?.parentElement ||
      gemsChip.parentElement?.parentElement;

    if (gemsContainer) {
      return { element: gemsContainer, position: "after" };
    }
  }

  const sideNavContent = document.querySelector('[role="navigation"]') || document.querySelector('side-navigation') || document.querySelector('nav');
  if (sideNavContent) {
    const gemsListContainer = sideNavContent.querySelector('.gems-list-container');
    if (gemsListContainer) {
      return { element: gemsListContainer, position: "after" };
    }

    const chatsHeader = sideNavContent.querySelector('.chat-history-list');
    if (chatsHeader) {
      return { element: chatsHeader, position: "before" };
    }
  }

  return null;
};


const createWidgetContainer = (): HTMLDivElement => {
  const container = document.createElement("div");
  container.id = WIDGET_CONTAINER_ID;

  const shadow = container.attachShadow({ mode: "open" });
  shadow.appendChild(getShadowStyles());

  const mountPoint = document.createElement("div");
  mountPoint.id = "gemini-widget-root";
  shadow.appendChild(mountPoint);

  return container;
};


const openExtensionSidebar = () => {
  globalThis.dispatchEvent(new CustomEvent("gemini-organizer-open-sidebar"));
};


const renderWidget = (container: HTMLElement) => {
  if (widgetRoot) {
    widgetRoot.unmount();
  }

  const shadow = container.shadowRoot;
  if (!shadow) return;

  const mountPoint = shadow.getElementById("gemini-widget-root");
  if (!mountPoint) return;

  widgetRoot = createRoot(mountPoint);
  widgetRoot.render(
    <React.StrictMode>
      <SettingsProvider>
        <ThemeProvider>
          <ThemeWrapper>
            <ToastProvider />
            <ModalProvider>
              <BookmarkProvider>
                <FolderProvider>
                  <ChatProvider>
                    <GeminiFolderWidget onOpenExtension={openExtensionSidebar} />
                  </ChatProvider>
                </FolderProvider>
              </BookmarkProvider>
            </ModalProvider>
          </ThemeWrapper>
        </ThemeProvider>
      </SettingsProvider>
    </React.StrictMode>
  );
};

const applySettings = (settings: Settings) => {
  if (settings.hideFoldersFromSidebar) {
    document.body.classList.add("gemini-organizer-hide-folders-widget");
  } else {
    document.body.classList.remove("gemini-organizer-hide-folders-widget");
  }
};

export const injectFolderWidget = (): boolean => {
  if (document.getElementById(WIDGET_CONTAINER_ID)) {
    return true;
  }

  if (document.getElementById(WIDGET_CONTAINER_ID)) {
    return true;
  }

  // Styles are now injected into Shadow DOM in createWidgetContainer


  getSettings().then(applySettings);

  const injectionPoint = findInjectionPoint();

  if (!injectionPoint) {
    console.log("[Gemini Organizer] Could not find injection point for folder widget. Will retry...");
    return false;
  }

  const container = createWidgetContainer();

  if (injectionPoint.position === "before") {
    injectionPoint.element.parentNode?.insertBefore(container, injectionPoint.element);
  } else {
    const nextSibling = injectionPoint.element.nextSibling;
    injectionPoint.element.parentNode?.insertBefore(container, nextSibling);
  }

  if (containerObserver) {
    containerObserver.disconnect();
  }

  if (container.parentElement) {
    containerObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width < 150) {
          container.classList.add("collapsed");
        } else {
          container.classList.remove("collapsed");
        }
      }
    });
    containerObserver.observe(container.parentElement);
  }

  renderWidget(container);
  console.log("[Gemini Organizer] Folder widget injected successfully");
  return true;
};

export const setupFolderWidgetInjection = () => {
  injectFolderWidget();

  const observer = new MutationObserver((mutations) => {
    if (document.getElementById(WIDGET_CONTAINER_ID)) {
      return;
    }
    const hasRelevantChanges = mutations.some((mutation) => {
      return mutation.addedNodes.length > 0 ||
        (mutation.type === "attributes" &&
          mutation.target instanceof Element &&
          mutation.target.matches('[role="navigation"], side-navigation'));
    });

    if (hasRelevantChanges) {
      injectFolderWidget();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["role", "class"],
  });

  setTimeout(() => {
    if (!document.getElementById(WIDGET_CONTAINER_ID)) {
      injectFolderWidget();
    }
  }, 2000);

  setTimeout(() => {
    if (!document.getElementById(WIDGET_CONTAINER_ID)) {
      injectFolderWidget();
    }
  }, 5000);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes["gemini-organizer-settings"]) {
      const newSettings = changes["gemini-organizer-settings"].newValue;
      if (newSettings) {
        applySettings(newSettings);
      }
    }
  });
};


export const removeFolderWidget = () => {
  const container = document.getElementById(WIDGET_CONTAINER_ID);
  if (container) {
    if (widgetRoot) {
      widgetRoot.unmount();
      widgetRoot = null;
    }
    container.remove();
  }

  if (containerObserver) {
    containerObserver.disconnect();
    containerObserver = null;
  }

  // Styles are now in shadow DOM, so removing container removes styles too.
  // Exception: if we previously injected logic differently.
  // The old global style cleanup:
  const globalStyles = document.getElementById(WIDGET_STYLES_ID);
  globalStyles?.remove();

  const separator = document.querySelector(".gemini-folder-separator");
  separator?.remove();
};
