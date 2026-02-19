import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ModalType = 'createFolder' | 'renameFolder' | 'deleteFolder' | 'colorPicker' | 'addChat' | 'renameFolderModal' | 'addSubfolder' | 'renameChatModal' | 'deleteChatModal' | 'moveChatModal' | 'addToFolder' | 'paywall' | 'signInPaywall' | 'onboarding';

interface ModalContextType {
  type: ModalType;
  isOpen: boolean;
  data: any;
  onOpen: (type: ModalType, data?: any) => void;
  onClose: () => void;
}

interface ModalStore {
  type: ModalType;
  data: any;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<ModalStore>({
    type: null,
    data: {},
    isOpen: false,
  });

  const onOpen = useCallback((type: ModalType, data: any = {}) => {
    setStore({ type, data, isOpen: true });
  }, []);

  const onClose = useCallback(() => {
    setStore({ type: null, data: {}, isOpen: false });
  }, []);

  const value = React.useMemo(
    () => ({ type: store.type, isOpen: store.isOpen, data: store.data, onOpen, onClose }),
    [store, onOpen, onClose]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
