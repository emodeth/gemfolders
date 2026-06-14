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
import {
  findFolderWidgetInjectionPoint,
  type FolderWidgetInjectionPoint
} from "./geminiDom";

let cachedSettings: Settings | null = null;
const WIDGET_CONTAINER_ID = "gemfolders-organizer-folder-widget";
const WIDGET_STYLES_ID = "gemfolders-organizer-folder-styles";

let widgetRoot: Root | null = null;
let containerObserver: ResizeObserver | null = null;
let repositionTimeout: ReturnType<typeof setTimeout> | null = null;
let isRepositioning = false;

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
      border-color: var(--border-default, #e3e3e3);
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
      font-size: 13px;
      width: 100%;
      padding: 8px 0 16px 0;
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

    .gemfolders-skeleton-bar {
      background: var(--border-default, #e3e3e3);
      border-radius: 4px;
    }
  `;
  return styleElement;
};

const insertAtInjectionPoint = (
  container: HTMLElement,
  injectionPoint: FolderWidgetInjectionPoint
) => {
  if (injectionPoint.position === "before") {
    injectionPoint.element.parentNode?.insertBefore(container, injectionPoint.element);
    return;
  }

  const nextSibling = injectionPoint.element.nextSibling;
  injectionPoint.element.parentNode?.insertBefore(container, nextSibling);
};

const isCorrectlyPositioned = (
  container: HTMLElement,
  injectionPoint: FolderWidgetInjectionPoint
): boolean => {
  if (injectionPoint.position === "after") {
    return container.previousElementSibling === injectionPoint.element;
  }

  return container.nextElementSibling === injectionPoint.element;
};

const findInjectionPoint = (): FolderWidgetInjectionPoint | null => {
  const notebooksAnchor = findFolderWidgetInjectionPoint();
  if (notebooksAnchor) {
    return notebooksAnchor;
  }

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
      <div class="gemfolders-skeleton-bar" style="height: 20px; margin-bottom: 12px; width: 70%;"></div>
      <div class="gemfolders-skeleton-bar" style="height: 16px; margin-bottom: 8px;"></div>
      <div class="gemfolders-skeleton-bar" style="height: 16px; margin-bottom: 8px;"></div>
      <div class="gemfolders-skeleton-bar" style="height: 16px; width: 80%;"></div>
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
  const injectionPoint = findInjectionPoint();
  if (!injectionPoint) {
    return false;
  }

  const existingWidget = document.getElementById(WIDGET_CONTAINER_ID) as HTMLDivElement | null;
  if (existingWidget) {
    if (!isCorrectlyPositioned(existingWidget, injectionPoint)) {
      insertAtInjectionPoint(existingWidget, injectionPoint);
    }
    return true;
  }

  getSettings().then(applySettings);

  const container = createWidgetContainer();

  const spinnerStyleId = "gemfolders-hide-sidebar-spinner";
  if (!document.getElementById(spinnerStyleId)) {
    const spinnerStyle = document.createElement("style");
    spinnerStyle.id = spinnerStyleId;
    spinnerStyle.textContent = `
      side-navigation mat-spinner,
      side-navigation mat-progress-spinner,
      [role="navigation"] mat-spinner,
      [role="navigation"] mat-progress-spinner,
      nav mat-spinner,
      nav mat-progress-spinner {
        display: none !important;
      }
    `;
    document.head.appendChild(spinnerStyle);
  }

  insertAtInjectionPoint(container, injectionPoint);

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

const scheduleWidgetReposition = (
  existingWidget: HTMLDivElement,
  injectionPoint: FolderWidgetInjectionPoint
) => {
  if (isRepositioning || isCorrectlyPositioned(existingWidget, injectionPoint)) {
    return;
  }

  if (repositionTimeout) {
    clearTimeout(repositionTimeout);
  }

  repositionTimeout = setTimeout(() => {
    if (isRepositioning || isCorrectlyPositioned(existingWidget, injectionPoint)) {
      return;
    }

    isRepositioning = true;
    try {
      insertAtInjectionPoint(existingWidget, injectionPoint);
    } finally {
      isRepositioning = false;
    }
  }, 250);
};

export const setupFolderWidgetInjection = () => {
  getSettings().then((s) => {
    cachedSettings = s;
    applySettings(s);
  });

  injectFolderWidget();

  const observer = new MutationObserver((mutations) => {
    const injectionPoint = findInjectionPoint();
    if (!injectionPoint) return;

    const existingWidget = document.getElementById(WIDGET_CONTAINER_ID) as HTMLDivElement | null;
    if (existingWidget) {
      scheduleWidgetReposition(existingWidget, injectionPoint);
      return;
    }

    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        injectFolderWidget();
        break;
      }
    }
  });

  const sidebar =
    document.querySelector('[data-test-id="side-nav"]') ||
    document.querySelector('[role="navigation"]') ||
    document.querySelector("side-navigation") ||
    document.querySelector("nav");

  observer.observe(sidebar ?? document.body, {
    childList: true,
    subtree: true
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

  const spinnerStyles = document.getElementById("gemfolders-hide-sidebar-spinner");
  spinnerStyles?.remove();

  const separator = document.querySelector(".gemfolders-folder-separator");
  separator?.remove();
};
