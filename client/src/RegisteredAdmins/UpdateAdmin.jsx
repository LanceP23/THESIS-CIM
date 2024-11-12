import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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

const UpdateUser = ({ user, onUpdate, onPictureUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.studentemail);
  const [position, setPosition] = useState(user.position || ''); 
  const [organization, setOrganization] = useState(user.organization || ''); 
  const [schoolYear, setSchoolYear] = useState(user.schoolYear || ''); 
  const [department, setDepartment] = useState(user.department || ''); 
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || ''); // Track profile picture URL
  const [profilePictureChanged, setProfilePictureChanged] = useState(false); // Track if the profile picture was changed

  useEffect(() => {
    if (!profilePicture && user.profilePicture) {
      setProfilePicture(user.profilePicture); // Ensure the initial state is set correctly
    }
  }, [user.profilePicture]);

  const handleChangeName = (e) => setName(e.target.value);
  const handleChangeEmail = (e) => setEmail(e.target.value);
  const handleChangePosition = (e) => setPosition(e.target.value);
  const handleChangeOrganization = (e) => setOrganization(e.target.value);
  const handleChangeSchoolYear = (e) => setSchoolYear(e.target.value);
  const handleChangeDepartment = (e) => setDepartment(e.target.value);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profile_pictures/${user._id}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          console.error('Error uploading image:', error);
          toast.error('Error uploading profile picture');
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setProfilePicture(downloadURL);
            setProfilePictureChanged(true);
            onPictureUpdate(user._id, downloadURL); // Call the callback to update the parent component
            toast.success('Profile picture updated successfully');
          });
        }
      );
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedUser = {
      name,
      studentemail: email,
      position: user.adminType === 'Organization Officer' ? position : undefined,
      organization: user.adminType === 'Organization Officer' ? organization : undefined,
      schoolYear: user.adminType !== 'Staff' ? schoolYear : undefined,
      department: user.adminType === 'Program Head' || user.adminType === 'Instructor' ? department : undefined,
      profilePicture: profilePictureChanged ? profilePicture : user.profilePicture, // Only update if changed
    };

    try {
      await axios.put(`/users/${user._id}/update`, updatedUser); // Update request to backend
      onUpdate(updatedUser); // Update the user on the frontend
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Error updating user');
    }
  };
  

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className='flex justify-between my-1'>
          <label>Name:</label>
          <input type="text" value={name} onChange={handleChangeName} className='input input-sm input-success dark:text-white' />
        </div>
        <div className='flex justify-between'>
          <label>Email:</label>
          <input type="email" value={email} onChange={handleChangeEmail} className='input input-sm input-success dark:text-white' />
        </div>
        {/* Profile Picture Section */}
        <div className='flex justify-between'>
          <label>Profile Picture:</label>
          <div className="flex flex-col items-center">
            {profilePicture ? (
              <div>
                <img src={profilePicture} alt="Profile" className="h-20 w-20 rounded-full" />
                <button 
                  type="button" 
                  onClick={() => {
                    setProfilePicture(''); 
                    setProfilePictureChanged(true);
                    onPictureUpdate(user._id, ''); // Clear profile picture in parent state
                  }} 
                  className='btn btn-xs btn-danger my-1'>Change Profile Picture</button>
              </div>
            ) : (
              <div>
                <p>No profile picture</p>
                <label htmlFor="profilePicInput" className="btn btn-xs btn-success my-1">Add Profile Picture</label>
                <input 
                  id="profilePicInput" 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleProfilePictureChange} 
                />
              </div>
            )}

          </div>
        </div>

        {/* Other fields */}
        {user.adminType === 'Organization Officer' && (
          <div className="flex flex-col">
            <div className='flex justify-between my-1'>
              <label>Position:</label>
              <input type="text" value={position} onChange={handleChangePosition} className='input input-sm input-success dark:text-white' />
            </div>
            <div className="flex">
              <label>Organization:</label>
              <input type="text" value={organization} onChange={handleChangeOrganization} className='input input-sm input-success dark:text-white' />
            </div>
          </div>
        )}

        {user.adminType !== 'Staff' && (
          <div className='flex justify-between my-1'>
            <label>School Year:</label>
            <input type="text" value={schoolYear} onChange={handleChangeSchoolYear} className='input input-sm input-success dark:text-white' />
          </div>
        )}

        {(user.adminType === 'Program Head' || user.adminType === 'Instructor') && (
          <div className='flex justify-between my-1'>
            <label>Department:</label>
            <input type="text" value={department} onChange={handleChangeDepartment} className='input input-sm input-success dark:text-white' />
          </div>
        )}

        <button type="submit" className='btn btn-xs btn-success my-1'>Update</button>
      </form>
    </div>
  );
};

export default UpdateUser;
