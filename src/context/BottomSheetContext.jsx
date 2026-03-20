import { createContext, useContext, useState } from 'react';
import BottomSheet from '../components/ui/BottomSheet';

const BottomSheetContext = createContext(null);

export const BottomSheetProvider = ({ children }) => {
  const [sheets, setSheets] = useState([]);

  const showSheet = (id, content, options = {}) => {
    setSheets(prev => [
      ...prev.filter(s => s.id !== id),
      { id, content, options, isOpen: true }
    ]);
  };

  const hideSheet = (id) => {
    setSheets(prev => prev.map(s => 
      s.id === id ? { ...s, isOpen: false } : s
    ));
    // Remove from DOM after exit animation
    setTimeout(() => {
      setSheets(prev => prev.filter(s => s.id !== id));
    }, 400);
  };

  return (
    <BottomSheetContext.Provider value={{ showSheet, hideSheet }}>
      {children}
      {sheets.map(sheet => (
        <BottomSheet
          key={sheet.id}
          isOpen={sheet.isOpen}
          onClose={() => hideSheet(sheet.id)}
          {...sheet.options}
        >
          {sheet.content}
        </BottomSheet>
      ))}
    </BottomSheetContext.Provider>
  );
};

export const useSheet = () => {
    const context = useContext(BottomSheetContext);
    if (!context) {
        throw new Error('useSheet must be used within a BottomSheetProvider');
    }
    return context;
};
