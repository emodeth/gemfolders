import React from "react";
import { useTheme } from "~context/ThemeContext";
import { Moon, Sun, Sparkles } from "lucide-react";
import { cn } from "~lib/utils";
import { useSettings } from "~context/SettingsContext";
import { Switch } from "./ui/Switch";
import SettingsSectionHeader from "./SettingsSectionHeader";
import Tooltip from "./Tooltip";
import ExportData from "./ExportData";
import { useI18n } from "~lib/i18n";
import LanguageSelect from "./ui/LanguageSelect";

const SettingsTab: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { t } = useI18n();

  const options = [
    { value: "light", label: t("light"), icon: Sun },
    { value: "dark", label: t("dark"), icon: Moon },
    { value: "gemini", label: t("gemini"), icon: Sparkles },
  ] as const;



  return (
    <div className="organizer-flex organizer-flex-col organizer-p-4 organizer-gap-4">
      <SettingsSectionHeader>{t("general")}</SettingsSectionHeader>

      <div className="organizer-flex organizer-flex-col organizer-gap-5">
        {[
          {
            label: t("openOnStartup"),
            checked: settings.openOnStartup,
            onChange: (checked: boolean) => updateSettings({ openOnStartup: checked })
          },
          {
            label: t("hideFoldersSidebar"),
            checked: settings.hideFoldersFromSidebar,
            onChange: (checked: boolean) =>
              updateSettings({ hideFoldersFromSidebar: checked })
          },
          {
            label: t("hideAddToFolder"),
            checked: settings.hideAddToFolderFromSidebar,
            onChange: (checked: boolean) =>
              updateSettings({ hideAddToFolderFromSidebar: checked })
          },
          {
            label: t("hideBookmark"),
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

      <SettingsSectionHeader>{t("appearance")}</SettingsSectionHeader>

      <div className="organizer-flex organizer-flex-col organizer-gap-4">
        <div className="organizer-flex organizer-items-center organizer-justify-between">
          <span className="organizer-text-sm organizer-font-medium organizer-text-text-primary">
            {t("sidebarButtonPosition")}
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
                      ? "organizer-bg-primary organizer-text-white hover:organizer-bg-primary-hover"
                      : "organizer-bg-bg-surface organizer-text-text-secondary hover:organizer-text-text-primary"
                  )}
                >
                  {t(position)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="organizer-flex organizer-items-center organizer-justify-between">
          <span className="organizer-text-sm organizer-font-medium organizer-text-text-primary">
            {t("theme")}
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

      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-gap-4">
        <label
          htmlFor="gemfolders-language"
          className="organizer-text-sm organizer-font-medium organizer-text-text-primary"
        >
          {t("language")}
        </label>
        <LanguageSelect
          id="gemfolders-language"
          value={settings.language || "en"}
          onChange={(language) =>
            updateSettings({ language, languagePreferenceSet: true })
          }
        />
      </div>

      <SettingsSectionHeader>{t("data")}</SettingsSectionHeader>

      <div className="organizer-flex organizer-flex-col organizer-gap-4">
        <ExportData />
      </div>
    </div>
  );
};

export default SettingsTab;
