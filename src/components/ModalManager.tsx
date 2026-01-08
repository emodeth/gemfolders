import React from 'react';
import { useModal } from '../context/ModalContext';
import CreateFolderModal from '~components/modals/CreateFolderModal';

const ModalManager: React.FC = () => {
  const { type, isOpen, onClose } = useModal();

  if (!isOpen || !type) return null;


  return (
    <>
      <div
        className={`organizer-fixed organizer-inset-0 organizer-z-[10000] ${type === 'createFolder' ? 'organizer-bg-transparent' : 'organizer-bg-black/50'}`}
        onClick={onClose}
      />
      <div className={`organizer-fixed organizer-inset-0 organizer-z-[10001] organizer-pointer-events-none ${type === 'createFolder' ? '' : 'organizer-flex organizer-items-center organizer-justify-center'}`}>
        <div className="organizer-pointer-events-auto">
          {type === 'createFolder' && <CreateFolderModal />}
        </div>
      </div>
    </>
  );
};

export default ModalManager;
