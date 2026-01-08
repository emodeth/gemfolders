import React from "react";

const ProfileTab: React.FC = () => {
  return (
    <div className="organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-flex-1 organizer-text-center">
      <p className="organizer-text-gray-300 organizer-font-medium organizer-mb-1">
        Profile
      </p>
      <p className="organizer-text-gray-500 organizer-text-sm">
        Manage your profile settings
      </p>
    </div>
  );
};

export default ProfileTab;
