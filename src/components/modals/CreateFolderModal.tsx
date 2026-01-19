import React, { useState, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { useFolder } from '../../context/FolderContext';

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
    onClose();
  };

  const style: React.CSSProperties = rect ? {
    position: 'absolute',
    top: rect.bottom + 12,
    left: rect.right - 215,
    margin: 0
  } : {};

  return (
    <div
      style={style}
      onClick={(e) => e.stopPropagation()}
      className={`organizer-w-[215px] organizer-bg-[#2a2a2a] organizer-rounded-lg organizer-p-4 organizer-relative organizer-transition-all organizer-duration-200 organizer-ease-out organizer-delay-100 ${isVisible
        ? 'organizer-opacity-100 organizer-translate-y-0 organizer-scale-100'
        : 'organizer-opacity-0 -organizer-translate-y-2 organizer-scale-95'
        }`}
    >
      {rect && (
        <div
          className="organizer-absolute organizer-w-3 organizer-h-3 organizer-bg-[#2a2a2a] organizer-border-l organizer-border-t organizer-border-[#333] organizer-transform organizer-rotate-45"
          style={{
            top: '-7px',
            right: (rect.width / 2) - 6,
          }}
        />
      )}
      <h3 className="organizer-text-white organizer-font-medium organizer-mb-3 organizer-text-sm">
        Enter folder name
      </h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="New Folder"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="organizer-w-full organizer-bg-[#212121] organizer-rounded-lg organizer-px-3 organizer-py-2 organizer-text-white organizer-text-sm organizer-mb-3 organizer-border organizer-border-[#212121] organizer-outline-none  focus:organizer-border-blue-500 organizer-placeholder-neutral-400"
          autoFocus
        />
        <button
          type="submit"
          className="organizer-w-full organizer-bg-[#212121] organizer-text-white organizer-font-medium organizer-py-2 organizer-rounded-lg organizer-text-sm organizer-transition-colors "
        >
          Add Folder
        </button>
      </form>
    </div>
  );
};

export default CreateFolderModal;
