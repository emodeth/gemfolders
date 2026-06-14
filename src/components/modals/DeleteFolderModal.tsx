import React from "react";
import toast from "react-hot-toast";
import { X, Folder } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { Button } from "../ui/Button";
import { truncateText } from "~lib/utils";

const DeleteFolderModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folderName = "Folder", itemCount = 0, onDelete } = data || {};

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    toast.success(`"${truncateText(folderName)}" deleted`);
    onClose();
  };

  return (
    <div
      className="organizer-w-[520px] organizer-bg-bg-surface organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-p-5 organizer-pb-0">
        <div className="organizer-flex organizer-items-center organizer-gap-3 organizer-flex-1 organizer-min-w-0 organizer-mr-4">
          <div className="organizer-text-text-primary organizer-flex-shrink-0">
            <Folder size={20} />
          </div>
          <div className="organizer-text-[16px] organizer-font-medium organizer-text-text-primary organizer-flex organizer-items-center organizer-min-w-0">
            <span className="organizer-whitespace-nowrap">Delete&nbsp;</span>
            <span className="organizer-truncate">{folderName}</span>
            <span className="organizer-whitespace-nowrap">&nbsp;and its chats ({itemCount} items)</span>
          </div>
        </div>
        <button
          className="organizer-text-text-secondary hover:organizer-text-text-primary organizer-transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="organizer-p-5 organizer-pt-6 organizer-flex organizer-justify-end organizer-gap-3">
        <Button variant="cancel" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default DeleteFolderModal;

