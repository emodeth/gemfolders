import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { Button } from "../ui/Button";
import { PRESET_COLORS, isLightColor } from "../../constants/colors";

const ColorPickerModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folderId, folderName, currentColor = "#1976d2", itemCount = 0, onChangeColor } = data || {};

  const [selectedColor, setSelectedColor] = useState(currentColor);

  useEffect(() => {
    setSelectedColor(currentColor);
  }, [currentColor]);


  const handleSave = async () => {
    if (onChangeColor && folderId) {
      await onChangeColor(folderId, selectedColor);
    }
    toast.success("Folder color updated");
    onClose();
  };

  return (
    <div
      className="organizer-w-[520px] organizer-bg-bg-surface organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-p-5 organizer-pb-2">
        <div className="organizer-text-lg organizer-font-medium organizer-text-text-primary">Change folder color</div>
        <button
          className="organizer-text-text-primary hover:organizer-text-text-primary organizer-transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="organizer-px-5 organizer-pb-4">
        <div className="organizer-mb-4">
          <span className="organizer-block organizer-text-sm organizer-font-medium organizer-text-text-primary organizer-mb-1">Preview:</span>
          <div
            className="organizer-w-full organizer-h-8 organizer-p-2 organizer-rounded organizer-flex organizer-items-center organizer-justify-between"
            style={{
              backgroundColor: selectedColor,
              color: isLightColor(selectedColor) ? "#1f1f1f" : "#fff"
            }}
          >
            <div className="organizer-font-medium organizer-text-sm">{folderName || "Folder Name"}</div>
            {itemCount ? (
              <span className="organizer-text-xs organizer-font-semibold organizer-opacity-90">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            ) : null}
          </div>
        </div>

        <div className="organizer-h-px organizer-bg-border-default organizer-mb-4" />

        <div className="organizer-grid organizer-grid-cols-9 organizer-gap-x-1 organizer-gap-y-4">
          {PRESET_COLORS.map((group, groupIndex) => (
            <div key={`color-group-${groupIndex}`} className="organizer-flex organizer-flex-col organizer-gap-[2px]">
              {group.map((color) => (
                <button
                  key={color}
                  className={`organizer-w-10 organizer-h-6 organizer-rounded-sm organizer-transition-all ${selectedColor === color
                    ? "organizer-ring-2 organizer-ring-white organizer-ring-offset-1 organizer-ring-offset-bg-surface"
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
        <Button variant="cancel" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default ColorPickerModal;

