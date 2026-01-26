import React from "react";
import { useTheme } from "~context/ThemeContext";
import { Moon, Sun, Sparkles } from "lucide-react";
import { cn } from "~lib/utils";
import { useSettings } from "~context/SettingsContext";
import { Switch } from "./ui/Switch";

const SettingsTab: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();

  const options = [
    { value: "gemini", label: "Gemini", icon: Sparkles },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const;

  return (
    <div className="organizer-flex organizer-flex-col organizer-p-4">

      <div className="organizer-flex organizer-flex-col organizer-gap-4 organizer-mb-8">
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
            label: "Hide toggle bookmarks from left sidebar",
            checked: settings.hideBookmarksFromSidebar,
            onChange: (checked: boolean) =>
              updateSettings({ hideBookmarksFromSidebar: checked })
          }

        ].map((option, index) => (
          <div
            key={index}
            className="organizer-flex organizer-items-center organizer-gap-2"
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



      <div className="organizer-flex organizer-flex-col organizer-gap-2">
        <span className="organizer-text-sm organizer-text-text-primary">Theme</span>
        <div className="organizer-flex organizer-bg-bg-input organizer-p-1 organizer-rounded-lg">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "organizer-flex-1 organizer-flex organizer-items-center organizer-justify-center organizer-gap-2 organizer-py-2 organizer-text-sm organizer-font-medium organizer-rounded-md organizer-transition-all",
                  isSelected
                    ? "organizer-bg-bg-surface organizer-text-text-primary organizer-shadow-sm"
                    : "organizer-text-text-muted hover:organizer-text-text-secondary hover:organizer-bg-bg-surface-hover/50"
                )}
              >
                <Icon size={16} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
