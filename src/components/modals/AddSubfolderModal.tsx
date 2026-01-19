import React, { useState, useRef, useLayoutEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { useFolder } from '../../context/FolderContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const AddSubfolderModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { onCreate, closeContextMenu } = useFolder();
  const [folderName, setFolderName] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const { buttonRect, parentId } = data || {};

  useLayoutEffect(() => {
    if (modalRef.current && buttonRect) {
      const modalRect = modalRef.current.getBoundingClientRect();
      const modalWidth = modalRect.width || 215;
      const modalHeight = modalRect.height || 150;
      const gap = 2;

      let newLeft = buttonRect.left - modalWidth - gap;
      let newTop = buttonRect.top;

      if (newLeft < 10) {
        newLeft = buttonRect.right + gap;
      }

      if (newTop + modalHeight > window.innerHeight - 10) {
        newTop = window.innerHeight - modalHeight - 10;
      }

      newTop = Math.max(10, newTop);
      newLeft = Math.max(10, newLeft);

      setPosition({ top: newTop, left: newLeft });
      setIsPositioned(true);
    }
  }, [buttonRect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    await onCreate({
      name: folderName,
      type: 'folder',
      parentId: parentId || null,
      index: 0,
    });
    closeContextMenu();
    onClose();
  };

  const style: React.CSSProperties = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    margin: 0,
    zIndex: 10002,
    visibility: isPositioned ? 'visible' : 'hidden',
  };

  return (
    <div
      ref={modalRef}
      style={style}
      className="organizer-w-[215px] organizer-bg-bg-background organizer-rounded-md organizer-p-4 organizer-shadow-lg"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="New Folder"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          variant="ghost"
          className="organizer-mb-3 organizer-rounded-lg"
          autoFocus
        />
        <Button
          type="submit"
          className="organizer-w-full organizer-bg-bg-input hover:organizer-bg-bg-surface-hover organizer-text-text-primary organizer-font-medium organizer-py-2 organizer-text-sm"
        >
          Add Subfolder
        </Button>
      </form>
    </div>
  );
};

export default AddSubfolderModal;
