import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import TabButton from "./TabButton";

interface TabItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  disabledTabs?: string[];
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabChange, disabledTabs = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    if (!containerRef.current) return;

    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    if (activeIndex === -1) return;

    const buttons = containerRef.current.querySelectorAll("[data-tab-button]");
    const activeButton = buttons[activeIndex] as HTMLElement;

    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left + buttonRect.width / 2 - 10,
        width: 20,
      });
    }
  };

  useLayoutEffect(() => {
    updateIndicator();
  }, [activeTab, tabs]);

  useEffect(() => {
    globalThis.addEventListener("resize", updateIndicator);
    return () => globalThis.removeEventListener("resize", updateIndicator);
  }, [activeTab, tabs]);

  return (
    <div ref={containerRef} className="organizer-relative organizer-flex organizer-items-center organizer-gap-2">
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          tab={tab}
          disabled={disabledTabs.includes(tab.id)}
        />
      ))}

      <div
        className="organizer-absolute organizer-bottom-0 organizer-h-[2px] organizer-rounded-full organizer-bg-primary organizer-transition-all organizer-duration-300 organizer-ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
};

export default TabBar;
