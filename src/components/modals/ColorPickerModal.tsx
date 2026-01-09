import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useModal } from "~context/ModalContext";
import CancelButton from "../CancelButton";

const PRESET_COLORS = [
  ["#b71c1c", "#d32f2f", "#f44336", "#e57373", "#ffcdd2"],
  ["#880e4f", "#c2185b", "#e91e63", "#f06292", "#f8bbd0"],
  ["#4a148c", "#7b1fa2", "#9c27b0", "#ba68c8", "#e1bee7"],
  ["#311b92", "#512da8", "#673ab7", "#9575cd", "#d1c4e9"],
  ["#1a237e", "#303f9f", "#3f51b5", "#7986cb", "#c5cae9"],
  ["#0d47a1", "#1976d2", "#2196f3", "#64b5f6", "#bbdefb"],
  ["#01579b", "#0288d1", "#03a9f4", "#4fc3f7", "#b3e5fc"],
  ["#006064", "#0097a7", "#00bcd4", "#4dd0e1", "#b2ebf2"],
  ["#004d40", "#00796b", "#009688", "#4db6ac", "#b2dfdb"],
  ["#194d33", "#388e3c", "#4caf50", "#81c784", "#c8e6c9"],
  ["#33691e", "#689f38", "#8bc34a", "#aed581", "#dcedc8"],
  ["#827717", "#afb42b", "#cddc39", "#dce775", "#f0f4c3"],
  ["#f57f17", "#fbc02d", "#ffeb3b", "#fff176", "#fff9c4"],
  ["#ff6f00", "#ffa000", "#ffc107", "#ffd54f", "#ffecb3"],
  ["#e65100", "#f57c00", "#ff9800", "#ffb74d", "#ffe0b2"],
  ["#bf360c", "#e64a19", "#ff5722", "#ff8a65", "#ffccbc"],
  ["#3e2723", "#5d4037", "#795548", "#a1887f", "#d7ccc8"],
  ["#263238", "#455a64", "#607d8b", "#90a4ae", "#cfd8dc"],
  ["#000000", "#525252", "#969696", "#D9D9D9", "#FFFFFF"],
];

const LIGHT_COLORS = new Set<string>([
  "#FFFFFF", "#dcedc8", "#fff9c4", "#D9D9D9",
  "#ffecb3", "#ffe0b2", "#ffccbc", "#d7ccc8", "#cfd8dc",
  "#e57373", "#ffcdd2",
  "#f06292", "#f8bbd0",
  "#ba68c8", "#e1bee7",
  "#9575cd", "#d1c4e9",
  "#7986cb", "#c5cae9",
  "#64b5f6", "#bbdefb",
  "#4fc3f7", "#b3e5fc",
  "#4dd0e1", "#b2ebf2",
  "#4db6ac", "#b2dfdb",
  "#81c784", "#c8e6c9",
  "#aed581",
  "#dce775", "#f0f4c3",
  "#fff176",
  "#ffd54f",
  "#ffb74d",
  "#ff8a65",
  "#a1887f",
  "#90a4ae"
]);

const ColorPickerModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folderName, currentColor = "#1976d2" } = data || {};

  const [selectedColor, setSelectedColor] = useState(currentColor);

  useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor]);


  const handleSave = async () => {
    onClose();
  };

  const isLightColor = (color: string) => LIGHT_COLORS.has(color);

  return (
    <div
      className="organizer-w-[520px] organizer-bg-[#202123] organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-p-5 organizer-pb-2">
        <div className="organizer-text-lg organizer-font-medium organizer-text-white">Change folder color</div>
        <button
          className="organizer-text-gray-400 hover:organizer-text-white organizer-transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="organizer-px-5 organizer-pb-4">
        <div className="organizer-mb-4">
          <span className="organizer-block organizer-text-sm organizer-font-medium organizer-text-gray-200 organizer-mb-2">Preview:</span>
          <div
            className="organizer-w-full organizer-h-8 organizer-p-2 organizer-rounded organizer-flex organizer-items-center organizer-justify-between"
            style={{
              backgroundColor: selectedColor,
              color: isLightColor(selectedColor) ? "#333" : "#fff"
            }}
          >
            <div className="organizer-font-medium organizer-text-sm">{folderName || "Folder Name"}</div>
            <span className="organizer-text-xs organizer-font-semibold organizer-opacity-90">2 items</span>
          </div>
        </div>

        <div className="organizer-h-px organizer-bg-gray-700 organizer-mb-4" />

        <div className="organizer-grid organizer-grid-cols-9 organizer-gap-x-1 organizer-gap-y-4">
          {PRESET_COLORS.map((group, groupIndex) => (
            <div key={`color-group-${groupIndex}`} className="organizer-flex organizer-flex-col organizer-gap-[2px]">
              {group.map((color) => (
                <button
                  key={color}
                  className={`organizer-w-10 organizer-h-6 organizer-rounded-sm organizer-transition-all ${selectedColor === color
                    ? "organizer-ring-2 organizer-ring-white organizer-ring-offset-1 organizer-ring-offset-[#202123]"
                    : "hover:organizer-opacity-80"
                    }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  type="button"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="organizer-p-5 organizer-pt-2 organizer-flex organizer-justify-end organizer-gap-3">
        <CancelButton onClick={onClose} />
        <button
          className="organizer-px-4 organizer-py-2 organizer-rounded-lg organizer-bg-neutral-700 hover:organizer-bg-neutral-600 organizer-text-white organizer-text-sm organizer-font-medium organizer-transition-colors"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ColorPickerModal;
