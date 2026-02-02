import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { useFolder } from '../../context/FolderContext';
import { useTierLimits } from '../../context/TierLimitsContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { truncateText } from "~lib/utils";

const CreateFolderModal: React.FC = () => {
  const { onClose, data } = useModal();
  const [folderName, setFolderName] = useState('');
  const rect = data?.anchorRect;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { onCreate } = useFolder();
  const { canCreateFolder, showPaywall } = useTierLimits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    if (!canCreateFolder()) {
      showPaywall("folder limit");
      return;
    }

    await onCreate({
      name: folderName,
      type: 'folder',
      parentId: data?.parentId || null,
      index: 0,
    });
    toast.success(`Folder "${truncateText(folderName)}" created`);
    onClose();
  };

  const placement = data?.placement;

  const getModalStyle = (): React.CSSProperties => {
    if (!rect) return {};

    if (placement === 'right-start') {
      return {
        position: 'absolute',
        top: rect.top - 10,
        left: rect.right + 14,
        margin: 0
      };
    }

    return {
      position: 'absolute',
      top: rect.bottom + 12,
      left: rect.right - 215,
      margin: 0
    };
  };

  const style = getModalStyle();

  return (
    <div
      style={style}
      onClick={(e) => e.stopPropagation()}
      className="organizer-w-[215px] organizer-bg-bg-input organizer-rounded-lg organizer-p-4 organizer-relative modal-animate-fade"
    >
      {rect && (
        <div
          className="organizer-absolute organizer-w-3 organizer-h-3 organizer-bg-bg-input organizer-transform organizer-rotate-45"
          style={placement === 'right-start' ? {
            top: '16px',
            left: '-6px',
          } : {
            top: '-6px',
            right: (rect.width / 2) - 6,
          }}
        />
      )}
      <h3 className="organizer-text-text-primary organizer-font-medium organizer-mb-3 organizer-text-sm">
        Enter folder name
      </h3>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="New Folder"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          variant="secondary"
          className="organizer-mb-3 organizer-rounded-lg"
          autoFocus
        />
        <Button
          type="submit"
          className="organizer-w-full !organizer-bg-bg-background organizer-text-text-primary organizer-font-medium organizer-py-2 organizer-text-sm"
        >
          Add Folder
        </Button>
      </form>
    </div>
  );
};

export default CreateFolderModal;
