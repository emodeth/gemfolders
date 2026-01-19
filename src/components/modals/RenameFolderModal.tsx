import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

const RenameFolderModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folderName = "", folderId, onRename } = data || {};
  const [newName, setNewName] = useState(folderName);

  useEffect(() => {
    setNewName(folderName);
  }, [folderName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (onRename) {
      await onRename(folderId, newName.trim());
    }
    onClose();
  };

  return (
    <div
      className="organizer-w-[400px] organizer-bg-bg-background organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden organizer-fixed organizer-top-[20%] organizer-left-1/2 -organizer-translate-x-1/2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-4 organizer-py-3">
        <div className="organizer-text-[14px] organizer-font-medium organizer-text-text-primary">
          Rename Folder
        </div>
        <button
          className="organizer-text-text-primary organizer-transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="organizer-px-4 organizer-pb-3">
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter folder name"
            variant="ghost"
            autoFocus
          />
        </div>

        <div className="organizer-px-4 organizer-pb-4 organizer-flex organizer-justify-end organizer-gap-2">
          <Button variant="cancel" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Rename
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RenameFolderModal;
