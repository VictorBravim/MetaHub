import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (image) {
      const storageRef = ref(storage, `images/${auth.currentUser.uid}/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          console.log(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setUrl(url);
            saveImageUrl(url);
          });
        }
      );
    }
  };

  const saveImageUrl = async (url) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          imageUrl: url,
        });
      } catch (error) {
        console.error("Error writing document: ", error);
      }
    }
  };

  return (
    <div className="profile">
      <h2>Profile</h2>
      <input type="file" onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
      <br />
      {progress > 0 && <progress value={progress} max="100" />}
      <br />
      {url && <img src={url} alt="Uploaded" />}
    </div>
  );
};

export default Profile;