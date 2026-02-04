import React from "react";
import { createRoot, type Root } from "react-dom/client";
import GeminiFolderWidget from "../components/GeminiFolderWidget";
import { FolderProvider } from "../context/FolderContext";
import { ChatProvider } from "../context/ChatContext";
import { BookmarkProvider } from "../context/BookmarkContext";
import { ModalProvider } from "../context/ModalContext";
import { ThemeProvider } from "../context/ThemeContext";
import { SettingsProvider } from "../context/SettingsContext";
import { AuthProvider } from "../context/AuthContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import { TierLimitsProvider } from "../context/TierLimitsContext";
import { ThemeWrapper } from "../components/ThemeWrapper";
import ToastProvider from "../components/ToastProvider";
import cssText from "data-text:~style.css";
import { getSettings, type Settings } from "./settings";

let cachedSettings: Settings | null = null;
const WIDGET_CONTAINER_ID = "gemfolders-organizer-folder-widget";
const WIDGET_STYLES_ID = "gemfolders-organizer-folder-styles";

let widgetRoot: Root | null = null;
let containerObserver: ResizeObserver | null = null;

const getProcessedStyles = (() => {
  let processed: string | null = null;
  return () => {
    if (processed) return processed;
    const baseFontSize = 16;
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
    let css = cssText.replaceAll(":root", ":host");
    const remRegex = /([\d.]+)rem/g;
    css = css.replaceAll(remRegex, (match, remValue) => {
      const pixelsValue = Number.parseFloat(remValue) * baseFontSize;
      return `${pixelsValue}px`;
    });
    processed = resetCss + css;
    return processed;
  };
})();

const getShadowStyles = () => {
  const styleElement = document.createElement("style");
  styleElement.id = WIDGET_STYLES_ID;
  styleElement.textContent = `
    ${getProcessedStyles()}

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

    :host-context(body.gemfolders-organizer-hide-folders-widget) .gemfolders-folder-widget-visible-content {
      display: none !important;
    }
    
    :host-context(body.gemfolders-organizer-hide-folders-widget) {
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
  mountPoint.id = "gemfolders-widget-root";
  // Skeleton Loader
  mountPoint.innerHTML = `
    <div style="padding: 16px; opacity: 0.6; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
      <div style="height: 20px; background: #e5e7eb; border-radius: 4px; margin-bottom: 12px; width: 70%;"></div>
      <div style="height: 16px; background: #e5e7eb; border-radius: 4px; margin-bottom: 8px;"></div>
      <div style="height: 16px; background: #e5e7eb; border-radius: 4px; margin-bottom: 8px;"></div>
      <div style="height: 16px; background: #e5e7eb; border-radius: 4px; width: 80%;"></div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.3; }
      }
    </style>
  `;
  shadow.appendChild(mountPoint);

  return container;
};


const openExtensionSidebar = () => {
  globalThis.dispatchEvent(new CustomEvent("gemfolders-organizer-open-sidebar"));
};


const renderWidget = (container: HTMLElement) => {
  if (widgetRoot) {
    widgetRoot.unmount();
  }

  const shadow = container.shadowRoot;
  if (!shadow) return;

  const mountPoint = shadow.getElementById("gemfolders-widget-root");
  if (!mountPoint) return;

  widgetRoot = createRoot(mountPoint);

  // Use requestAnimationFrame for smoother injection
  requestAnimationFrame(() => {
    widgetRoot?.render(
      <React.StrictMode>
        <SettingsProvider initialSettings={cachedSettings || undefined}>
          <AuthProvider>
            <SubscriptionProvider>
              <ThemeProvider>
                <ThemeWrapper>
                  <ToastProvider />
                  <ModalProvider>
                    <BookmarkProvider>
                      <FolderProvider>
                        <ChatProvider>
                          <TierLimitsProvider>
                            <GeminiFolderWidget onOpenExtension={openExtensionSidebar} />
                          </TierLimitsProvider>
                        </ChatProvider>
                      </FolderProvider>
                    </BookmarkProvider>
                  </ModalProvider>
                </ThemeWrapper>
              </ThemeProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </SettingsProvider>
      </React.StrictMode>
    );
  });
};

const applySettings = (settings: Settings) => {
  if (settings.hideFoldersFromSidebar) {
    document.body.classList.add("gemfolders-organizer-hide-folders-widget");
  } else {
    document.body.classList.remove("gemfolders-organizer-hide-folders-widget");
  }
};

export const injectFolderWidget = (): boolean => {
  if (document.getElementById(WIDGET_CONTAINER_ID)) {
    return true;
  }

  if (document.getElementById(WIDGET_CONTAINER_ID)) {
    return true;
  }

  getSettings().then(applySettings);

  const injectionPoint = findInjectionPoint();

  if (!injectionPoint) {
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
  return true;
};

export const setupFolderWidgetInjection = () => {
  // Pre-fetch settings immediately
  getSettings().then((s) => {
    cachedSettings = s;
    // apply settings if cached
    applySettings(s);
  });

  // 1. Try immediate injection
  injectFolderWidget();

  const observer = new MutationObserver((mutations) => {
    // Check if our widget is already there to avoid redundant checks
    if (document.getElementById(WIDGET_CONTAINER_ID)) return;

    // Fast-path: Look for the sidebar container specifically
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        const injectionPoint = findInjectionPoint();
        if (injectionPoint) {
          injectFolderWidget();
          break;
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true // Necessary because Gemini's nesting is deep
  });



  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes["gemfolders-organizer-settings"]) {
      const newSettings = changes["gemfolders-organizer-settings"].newValue;
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


  const globalStyles = document.getElementById(WIDGET_STYLES_ID);
  globalStyles?.remove();

  const separator = document.querySelector(".gemfolders-folder-separator");
  separator?.remove();
};
