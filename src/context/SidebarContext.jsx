import React from 'react';
// SidebarContext.js
import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarMinimized: isMinimized, toggleSidebar: () => setIsMinimized(!isMinimized) }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);