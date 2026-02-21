import React, { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { getCachedChats } from "~lib/geminiChats";
import { getFolders, getBookmarks } from "~lib/storage";

type ExportStatus = "idle" | "exporting" | "done";

const ExportData: React.FC = () => {
  const [status, setStatus] = useState<ExportStatus>("idle");

  const handleExport = async () => {
    try {
      setStatus("exporting");

      const [chats, folders, bookmarks] = await Promise.all([
        getCachedChats(),
        getFolders(),
        getBookmarks(),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        chats,
        folders,
        bookmarks,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split("T")[0];
      const a = document.createElement("a");
      a.href = url;
      a.download = `gemfolders-export-${date}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Export failed:", error);
      setStatus("idle");
    }
  };

  const Icon = status === "idle" ? Download : status === "exporting" ? Loader2 : Check;
  const label = status === "idle" ? "Export Chats" : status === "exporting" ? "Exporting..." : "Exported!";

  return (
    <button
      onClick={handleExport}
      disabled={status === "exporting"}
      className="organizer-flex organizer-items-center organizer-gap-2 organizer-px-3 organizer-py-2 organizer-rounded-md organizer-text-sm organizer-font-medium organizer-bg-bg-surface-hover organizer-text-text-primary hover:organizer-opacity-90 organizer-transition-all organizer-cursor-pointer disabled:organizer-opacity-50 disabled:organizer-cursor-not-allowed"
    >
      <Icon
        size={15}
        className={status === "exporting" ? "organizer-animate-spin" : ""}
      />
      {label}
    </button>
  );
};

export default ExportData;
