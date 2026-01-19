import React from "react";
import { useTheme } from "~context/ThemeContext";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "~lib/utils";

const SettingsTab: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="organizer-flex organizer-flex-col organizer-p-4">
      <h3 className="organizer-text-lg organizer-font-medium organizer-text-text-primary organizer-mb-4">
        Appearance
      </h3>

      <div className="organizer-flex organizer-flex-col organizer-gap-2">
        <span className="organizer-text-sm organizer-text-text-secondary">Theme</span>
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
