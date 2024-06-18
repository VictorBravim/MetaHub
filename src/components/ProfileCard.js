import React from 'react';

const ProfileCard = ({ handleImageChange, handleUsernameChange, handleProfileSave, progress, imageUrl, username }) => {
  return (
    <div className="profile-card">
      <h3>Set up your profile</h3>
      <input type="file" onChange={handleImageChange} />
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Username"
      />
      <button onClick={handleProfileSave}>Save</button>
      {progress > 0 && <progress value={progress} max="100" />}
      {imageUrl && <img src={imageUrl} alt="Profile Preview" className="profile-preview" />}
    </div>
  );
};

export default ProfileCard;