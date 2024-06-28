import React from 'react';

const ProfileCard = ({ handleImageChange, handleUsernameChange, handleProfileSave, progress, imageUrl, username }) => {
  return (
    <div className="max-w-md mx-auto bg-white text-black rounded-lg overflow-hidden mt-10 p-6">
      <h3 className="text-2xl font-semibold text-center mb-4">Configure seu perfil</h3>
      <div className="mb-4">
        <input 
          type="file" 
          onChange={handleImageChange} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          id="profile-image"
          name="profileImage"
          autoComplete="off"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
          className="w-full shadow-neomorph-inner px-3 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          id="username" 
          name="username"
          autoComplete="username"
        />
      </div>
      <div className="mb-4 text-center">
        <button 
          onClick={handleProfileSave} 
          className="w-full shadow-neomorph py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition duration-300"
        >
          Save
        </button>
      </div>
      {progress > 0 && (
        <div className="mb-4">
          <progress value={progress} max="100" className="w-full h-2 bg-gray-200 rounded-lg">
            {progress}%
          </progress>
        </div>
      )}
      {imageUrl && (
        <div className="text-center">
          <img 
            src={imageUrl} 
            alt="Profile Preview" 
            className="inline-block shadow-neomorph w-24 h-24 rounded-full border-2 border-blue-500 object-cover mt-4"
          />
        </div>
      )}
    </div>
  );
};

export default ProfileCard;