import React from 'react';
import './bottom-dock-panel.css';

interface BottomDockPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const BottomDockPanel: React.FC<BottomDockPanelProps> = ({ children, isOpen, onClose }) => {
  return (
    <div className={`bottom-dock-panel ${isOpen ? 'open' : ''}`}>  
      <div className="bottom-dock-content">
        {children}
      </div>
      <button className="bottom-dock-close" onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default BottomDockPanel;
