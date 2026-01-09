import React from 'react';

interface CancelButtonProps {
  onClick: () => void;
  className?: string; // Allow extending styles
}

const CancelButton: React.FC<CancelButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`organizer-px-4 organizer-py-2 organizer-rounded-lg organizer-text-white hover:organizer-bg-[#333] organizer-text-sm organizer-font-medium organizer-transition-colors ${className}`}
    >
      Cancel
    </button>
  );
};

export default CancelButton;
