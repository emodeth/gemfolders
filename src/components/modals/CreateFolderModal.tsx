import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useModal } from '../../context/ModalContext';
import { useFolder } from '../../context/FolderContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const CreateFolderModal: React.FC = () => {
  const { onClose, data } = useModal();
  const [folderName, setFolderName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const rect = data?.anchorRect;

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    await onCreate({
      name: folderName,
      type: 'folder',
      parentId: data?.parentId || null,
      index: 0,
    });
    toast.success(`Folder "${folderName}" created`);
    onClose();
  };

  const placement = data?.placement;

  const style: React.CSSProperties = rect ? (
    placement === 'right-start' ? {
      position: 'absolute',
      left: rect.right + 14,
      margin: 0
    } : {
      position: 'absolute',
      top: rect.bottom + 12,
      left: rect.right - 215,
      margin: 0
    }
  ) : {};

  return (
    <div
      style={style}
      onClick={(e) => e.stopPropagation()}
      className={`organizer-w-[215px] organizer-bg-bg-input organizer-rounded-lg organizer-p-4 organizer-relative organizer-transition-all organizer-duration-200 organizer-ease-out organizer-delay-100 ${isVisible
        ? 'organizer-opacity-100 organizer-translate-y-0 organizer-scale-100'
        : 'organizer-opacity-0 -organizer-translate-y-2 organizer-scale-95'
        }`}
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
