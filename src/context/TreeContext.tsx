import { createContext, useContext } from 'react';

interface TreeContextType {
  containerWidth: number;
}

const TreeContext = createContext<TreeContextType>({
  containerWidth: 260
});

export const useTreeContext = () => useContext(TreeContext);

export const TreeContextProvider = TreeContext.Provider;
