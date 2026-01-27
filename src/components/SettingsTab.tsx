import React from "react";
import { useTheme } from "~context/ThemeContext";
import { Moon, Sun, Sparkles } from "lucide-react";
import { cn } from "~lib/utils";
import { useSettings } from "~context/SettingsContext";
import { Switch } from "./ui/Switch";
import SettingsSectionHeader from "./SettingsSectionHeader";
import Tooltip from "./Tooltip";

const SettingsTab: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "gemini", label: "Gemini", icon: Sparkles },
  ] as const;



  return (
    <div className="organizer-flex organizer-flex-col organizer-p-4 organizer-gap-4">
      <SettingsSectionHeader>General</SettingsSectionHeader>

      <div className="organizer-flex organizer-flex-col organizer-gap-5">
        {[
          {
            label: "Open on startup",
            checked: settings.openOnStartup,
            onChange: (checked: boolean) => updateSettings({ openOnStartup: checked })
          },
          {
            label: "Hide folders from left sidebar",
            checked: settings.hideFoldersFromSidebar,
            onChange: (checked: boolean) =>
              updateSettings({ hideFoldersFromSidebar: checked })
          },
          {
            label: "Hide add to folder from left sidebar",
            checked: settings.hideAddToFolderFromSidebar,
            onChange: (checked: boolean) =>
              updateSettings({ hideAddToFolderFromSidebar: checked })
          },
          {
            label: "Hide toggle bookmarks from left sidebar",
            checked: settings.hideBookmarksFromSidebar,
            onChange: (checked: boolean) =>
              updateSettings({ hideBookmarksFromSidebar: checked })
          }
        ].map((option, index) => (
          <div
            key={index}
            className="organizer-flex organizer-items-center organizer-gap-3"
          >
            <Switch
              checked={option.checked}
              onCheckedChange={option.onChange}
            />
            <span className="organizer-text-sm organizer-font-medium organizer-text-text-primary">
              {option.label}
            </span>
          </div>
        ))}
      </div>

      <SettingsSectionHeader>Appearance</SettingsSectionHeader>

      <div className="organizer-flex organizer-flex-col organizer-gap-4">
        <div className="organizer-flex organizer-items-center organizer-justify-between">
          <span className="organizer-text-sm organizer-font-medium organizer-text-text-primary">
            Sidebar Button Position
          </span>
          <div className="organizer-flex organizer-gap-2">
            {(["top", "bottom"] as const).map((position) => {
              const isSelected = settings.sidebarButtonPosition === position;
              return (
                <button
                  key={position}
                  onClick={() => updateSettings({ sidebarButtonPosition: position })}
                  className={cn(
                    "organizer-px-3 organizer-py-1 organizer-text-xs organizer-font-medium organizer-rounded-full organizer-transition-all",
                    isSelected
                      ? "organizer-bg-primary organizer-text-white"
                      : "organizer-bg-bg-surface organizer-text-text-secondary hover:organizer-text-text-primary"
                  )}
                  style={isSelected ? { backgroundColor: "var(--color-primary)" } : {}}
                >
                  {position.charAt(0).toUpperCase() + position.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="organizer-flex organizer-items-center organizer-justify-between">
          <span className="organizer-text-sm organizer-font-medium organizer-text-text-primary">
            Theme
          </span>
          <div className="organizer-flex organizer-bg-bg-input organizer-rounded-lg organizer-p-1">
            {options.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;
              return (
                <Tooltip key={option.value} text={option.label} position="top">
                  <button
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "organizer-p-1.5 organizer-rounded-md organizer-transition-all",
                      isSelected
                        ? "organizer-bg-bg-surface organizer-text-text-primary organizer-shadow-sm"
                        : "organizer-text-text-muted hover:organizer-text-text-primary"
                    )}
                  >
                    <Icon size={14} />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
