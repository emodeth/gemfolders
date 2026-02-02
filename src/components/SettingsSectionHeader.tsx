import React from "react";

const SettingsSectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="organizer-flex organizer-items-center organizer-gap-4 organizer-py-2 organizer-mt-2">
    <div
      className="organizer-h-[1px] organizer-flex-1"
      style={{ backgroundColor: "var(--text-primary)", opacity: 0.3 }}
    />
    <h3 className="organizer-text-base organizer-font-medium organizer-text-text-primary">
      {children}
    </h3>
    <div
      className="organizer-h-[1px] organizer-flex-1"
      style={{ backgroundColor: "var(--text-primary)", opacity: 0.3 }}
    />
  </div>
);

export default SettingsSectionHeader;
