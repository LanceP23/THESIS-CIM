import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import './RegisterModal.css';

const firebaseConfig = {
  apiKey: "AIzaSyAQZQtWzdKepDwzzhOAw_F8A4xkhtwz9p0",
  authDomain: "cim-storage.firebaseapp.com",
  projectId: "cim-storage",
  storageBucket: "cim-storage.appspot.com",
  messagingSenderId: "616767248215",
  appId: "1:616767248215:web:b554a837f3229fdc155012",
  measurementId: "G-YN9S75JSNB"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const StaffRegistration = ({ data, setData }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);

    // Display preview
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePictureUrl(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let profilePictureUrl = null;

      // Upload profile picture if provided
      if (profilePicture) {
        const storageRef = ref(storage, `profile_pictures/${profilePicture.name}`);
        await uploadBytesResumable(storageRef, profilePicture);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      const response = await axios.post('/register', { ...data, profilePictureUrl });
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setData({
          name: '',
          studentemail: '',
          password: '',
          adminType: 'School Owner',
          organization: '',
          position: '',
          schoolYear: '', 
        });
        setProfilePicture(null); // Clear profile picture
        setProfilePictureUrl(null); // Clear preview
        toast.success('Staff registration successful!');
      }
    } catch (error) {
      console.error('Error registering staff:', error);
      toast.error('Failed to register staff');
    }
  };

  return (
    <div>
      <h2 className='border-b-2 py-1 border-gray-800 text-lg font-semibold'>Staff Registration</h2>
      <form onSubmit={handleSubmit}>
        
        {/* Profile Picture Upload */}
        <div className="flex flex-col text-left m-1">
          <label>Profile Picture (optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="file-input file-input-bordered file-input-success file-input-sm w-full rounded-md shadow-2xl"
          />
          {profilePictureUrl && (
            <div className="mt-2">
              <img src={profilePictureUrl} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full mx-auto" />
            </div>
          )}
        </div>

        <div className="flex flex-col text-left m-1">
          <label>Name</label>
          <input
            type='text'
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            className='input input-bordered input-success input-sm w-full rounded-md shadow-2xl'
          />
        </div>

        <div className="flex flex-col text-left m-1">
          <label>Email</label>
          <input
            type='email'
            value={data.studentemail}
            onChange={(e) => setData({ ...data, studentemail: e.target.value })}
            required
            className='input input-bordered input-success input-sm w-full rounded-md shadow-2xl'
          />
        </div>

        <div className="flex flex-col text-left m-1">
          <label>Password</label>
          <input
            type='password'
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
            className='input input-bordered input-success input-sm w-full rounded-md shadow-2xl'
          />
        </div>

        <div className="flex flex-col text-left m-1">
          <label>Admin Type</label>
          <select value={data.adminType} onChange={(e) => setData({ ...data, adminType: e.target.value })} className='select select-accent select-sm w-full max-w-full rounded-md shadow-2xl'>
            <option value='School Owner'>School Owner</option>
            <option value='President'>President</option>
            <option value='School Executive Admin'>School Executive Admin</option>
            <option value='School Executive Dean'>School Executive Dean</option>
          </select>
        </div>

        <div className="flex flex-col text-left m-1">
          <label>School Year</label>
          <input
            type='text'
            value={data.schoolYear}
            onChange={(e) => setData({ ...data, schoolYear: e.target.value })}
            required
            className='input input-bordered input-success input-sm w-full rounded-md shadow-2xl'
          />
        </div>
        
        <button type='submit' className='btn btn-success btn-wide btn-sm my-2'>Register</button>
      </form>
    </div>
  );
};

export default StaffRegistration;
