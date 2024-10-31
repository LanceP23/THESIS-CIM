import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';
import { AcademicCapIcon, ShieldCheckIcon, UserGroupIcon, UsersIcon, IdentificationIcon } from '@heroicons/react/outline'




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

export default function BuildCommunity() {
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [mobileUsers, setMobileUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [mobileUserFilter, setMobileUserFilter] = useState('');
  const [adminUserFilter, setAdminUserFilter] = useState('');

  const getToken = () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!token) {
      throw new Error('Token not found');
    }
    return token.split('=')[1];
  };

  useEffect(() => {
    // Fetch mobile users
    const fetchMobileUsers = async () => {
      try {
        const response = await axios.get('/get-mobile-users');
        setMobileUsers(response.data);
      } catch (error) {
        console.error('Error fetching mobile users:', error);
      }
    };

    // Fetch admin/users
    const fetchAdminUsers = async () => {
      try {
        const response = await axios.get('/get-users');
        setAdminUsers(response.data);
      } catch (error) {
        console.error('Error fetching admin/users:', error);
      }
    };

    fetchMobileUsers();
    fetchAdminUsers();
  }, []);

  // Filter mobile users based on input value
  const filteredMobileUsers = mobileUsers.filter(user => {
    return (
      user.name.toLowerCase().includes(mobileUserFilter.toLowerCase()) ||
      user.studentemail.toLowerCase().includes(mobileUserFilter.toLowerCase())
    );
  });

  // Filter admin/users based on input value
  const filteredAdminUsers = adminUsers.filter(user => {
    return (
      user.name.toLowerCase().includes(adminUserFilter.toLowerCase()) ||
      user.studentemail.toLowerCase().includes(adminUserFilter.toLowerCase()) ||
      user.adminType.toLowerCase().includes(adminUserFilter.toLowerCase())
    );
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!communityName || !communityDescription) {
      toast.error('Community name and description are required.');
      return;
    }
  
    const storageRef = ref(storage, logoFile.name);
    const uploadTask = uploadBytesResumable(storageRef, logoFile);
  
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress or other snapshot events if needed
        // You can display progress using snapshot.bytesTransferred and snapshot.totalBytes
      },
      (error) => {
        // Handle unsuccessful upload
        toast.dismiss();
        toast.error(`Error uploading media: ${error.message}`);
        console.error('Error uploading media:', error);
      },
      async () => {
        try {
          const logoFile = await getDownloadURL(uploadTask.snapshot.ref);
          const [mobileUsersResponse, adminUsersResponse] = await Promise.all([
            axios.get('/get-mobile-users'),
            axios.get('/get-users')
          ]);
  
          const mobileUsersData = mobileUsersResponse.data;
          const adminUsersData = adminUsersResponse.data;
  
          const formData = new FormData();
          formData.append('name', communityName);
          formData.append('description', communityDescription);
          if (logoFile) {
            formData.append('logo', logoFile);
          }
  
          if (!Array.isArray(selectedMembers)) {
            toast.error('Selected members must be an array.');
            return;
          }
  
          const members = selectedMembers.map(userId => {
            const user = mobileUsersData.find(user => user._id === userId) || adminUsersData.find(user => user._id === userId);
            if (user) {
              return {
                userId,
                userType: user.adminType ? 'User' : 'MobileUser',
                adminType: user.adminType,
                name: user.name
              };
            }
            return null;
          }).filter(member => member !== null);
  
          const onModel = members.some(member => member.userType === 'MobileUser') ? 'MobileUser' : 'User';
            
          formData.append('members', JSON.stringify(members));
          formData.append('onModel', onModel);
  
          const token = getToken();
          const response = await axios.post('/build-community', formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
  
          // Reset form fields
          setCommunityName('');
          setCommunityDescription('');
          setLogoFile(null);
          setSelectedMembers([]);
          toast.success('Community created successfully.');
        } catch (error) {
          toast.error('Error creating community. Please try again later.');
          console.error('Error creating community:', error);
        }
      }
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddMember = (userId) => {
    // Check if the user is already selected
    if (!selectedMembers.includes(userId)) {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(id => id !== userId));
  };

  const handleLogoUpload = (file) => {
    setLogoFile(file);
  };

  return (

    <div className="flex flex-col w-full sm:w-full md:w-full lg:w-[75vw] xl:w-[75vw] mt-10 p-2 ">
    <div className=" bg-slate-200 my-5 rounded-xl p-3 ">
    <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 my-2'>Build Community</h2>
      <div className="flex flex-row">
      
      <form className=" border-2 border-green-400 w-full max-w-full mt-4 bg-gradient-to-r from-white to-green-200 p-2 rounded-lg shadow-2xl text-left" onSubmit={handleSubmit}>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label htmlFor="communityName" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Community Name:</label>
            <input
              type="text"
              id="communityName"
              className="input input-bordered input-success input-md w-full text-gray-700 bg-slate-100 rounded-md shadow-xl"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label htmlFor="logo" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Logo (Upload Picture):</label>
            <input
              type="file"
              id="logo"
              accept="image/*"
              className="file-input file-input-bordered file-input-success file-input-sm w-full max-w-xs mx-5 bg-white rounded-md shadow-xl"
              onChange={(e) => handleLogoUpload(e.target.files[0])}
            />
          </div>
        </div>
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full px-3">
            <label htmlFor="communityDescription" className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">Description:</label>
            <textarea
              id="communityDescription"
              className="textarea textarea-success w-full text-gray-700 bg-white rounded-md shadow-xl"
              rows="4"
              value={communityDescription}
              onChange={(e) => setCommunityDescription(e.target.value)}
              placeholder="Add description..."
            />
          </div>
        </div>
        <button type="submit" className="btn btn-success btn-wide">Create Community</button>
      </form>

      

      
      
      </div>

      <div className="divider divider-warning"></div> 
      {/* Add Mobile Members */}
      <div className="w-full  mt-8">
        <h2 className="text-lg font-bold mb-4">Add Mobile Members</h2>
        <input
          type="text"
          className="input input-bordered input-success input-md w-full text-white bg-base-100 rounded-md shadow-xl"
          value={mobileUserFilter}
          onChange={(e) => setMobileUserFilter(e.target.value)}
          placeholder="Filter by name or email"
        />
        <div className="w-full max-h-96 overflow-auto">
        <table className="w-full bg-white shadow-2xl rounded-2xl ">
          {/* Table Header */}
          <thead className='sticky top-0'>
            <tr>
              
              <th className="bg-green-700 text-white">Name</th>
              <th className="bg-green-700 text-white">Email</th>
              <th className="bg-green-700 text-white">Details</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {filteredMobileUsers.map(user => (
              <tr key={user._id} onClick={() => handleAddMember(user._id)} className="cursor-pointer hover:bg-customyellow">
                
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.studentemail}</td>
                <td>
                                {user.educationLevel === 'Grade School' && (
                                    <div className=' '>
                                        <h2>Grade Level: {user.gradeLevel}</h2>
                                        <h2>Section: {user.section}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                                {user.educationLevel === 'High School' && (
                                    <div className=''>
                                        <h2>Year Level: {user.highSchoolYearLevel}</h2>
                                        <h2>Section: {user.section}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                                {user.educationLevel === 'Senior High School' && (
                                    <div  className=''>
                                        <h2>Strand: {user.shsStrand}</h2>
                                        <h2>Year Level: {user.seniorHighSchoolYearLevel}</h2>
                                        <h2>Grade Level: {user.gradeLevel}</h2>
                                        <h2>Section: {user.section}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                                {user.educationLevel === 'College' && (
                                    <div className=''>
                                        <h2>Course: {user.collegeCourse}</h2>
                                        <h2>Year Level: {user.collegeYearLevel}</h2>
                                        <h2>Subjects Enrolled: {user.subjects.join(', ')}</h2>
                                    </div>
                                )}
                            </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      

      <div className="divider divider-warning"></div>

      {/* Add Admin/Users */}
      <div className="w-full  mt-8 ">
        <h2 className="text-lg font-bold mb-4">Add Admin/Users</h2>

        
        <input
          type="text"
          className="input input-bordered input-success input-md w-full text-white bg-base-100 rounded-md shadow-xl "
          value={adminUserFilter}
          onChange={(e) => setAdminUserFilter(e.target.value)}
          placeholder="Filter by name, email, or admin type"
        />

        <div className="max-h-96 overflow-auto">
        <table className="w-full bg-white shadow-2xl rounded-2xl ">
          {/* Table Header */}
          <thead className='sticky top-0 z-10 '>
            <tr className=''>
              <th className="bg-green-700 text-white">Name</th>
              <th className="bg-green-700 text-white">Email</th>
              <th className="bg-green-700 text-white">Admin Type</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {filteredAdminUsers.map(user => (
              <tr key={user._id} onClick={() => handleAddMember(user._id)} className="cursor-pointer hover:bg-customyellow">
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.studentemail}</td>
                <td className="border px-4 py-2">
                {user.adminType === 'School Owner' && (
                  <div className="flex gap-2">
                    <div
                      className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-gray-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white">
                      <div className="absolute top-2/4 left-1.5 h-5 w-5 -translate-y-2/4">
                        <ShieldCheckIcon className="w-5 h-5" />
                      </div>
                      <span className="ml-[18px]">School Owner</span>
                    </div>
                  </div>
                )}
                {user.adminType === 'School Executive Admin' && (
                  <div className="flex gap-2">
                    <div
                      className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-blue-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white">
                      <div className="absolute top-2/4 left-1.5 h-5 w-5 -translate-y-2/4">
                        <ShieldCheckIcon className="w-5 h-5" />
                      </div>
                      <span className="ml-[18px]">School Executive Admin</span>
                    </div>
                  </div>
                )}
                {user.adminType === 'Program Head' && (
                  <div className="flex gap-2">
                    <div
                      className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-green-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white">
                      <div className="absolute top-2/4 left-1.5 h-5 w-5 -translate-y-2/4">
                        <AcademicCapIcon className="w-5 h-5" />
                      </div>
                      <span className="ml-[18px]">Program Head</span>
                    </div>
                  </div>
                )}
                {user.adminType === 'Organization Officer' && (
                  <div className="flex gap-2">
                    <div
                      className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-purple-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white">
                      <div className="absolute top-2/4 left-1.5 h-5 w-5 -translate-y-2/4">
                        <UserGroupIcon className="w-5 h-5" />
                      </div>
                      <span className="ml-[18px]">Organization Officer</span>
                    </div>
                  </div>
                )}
                {user.adminType === 'Instructor' && (
                  <div className="flex gap-2">
                    <div
                      className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-yellow-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white">
                      <div className="absolute top-2/4 left-1.5 h-5 w-5 -translate-y-2/4">
                        <UsersIcon className="w-5 h-5" />
                      </div>
                      <span className="ml-[18px]">Instructor</span>
                    </div>
                  </div>
                )}
                {user.adminType === 'Student Government' && (
                  <div className="flex gap-2">
                    <div
                      className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-red-500 py-1.5 px-3 font-sans text-xs font-bold uppercase text-white">
                      <div className="absolute top-2/4 left-1.5 h-5 w-5 -translate-y-2/4">
                        <IdentificationIcon className="w-5 h-5" />
                      </div>
                      <span className="ml-[18px]">Student Government</span>
                    </div>
                  </div>
                )}
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

            

     

      <div className="flex justify-end items-end">
      <button className="btn btn-error btn-wide  text-white font-bold py-2 px-4 rounded mt-4 " onClick={handleBack}>
        &lt; Back
      </button>
      </div>

            
    </div>
    
    <div className="bg-slate-200 my-5 rounded-xl p-3 shadow-xl max-h-full max-w-md fixed right-3 z-20 opacity-80">
         {/* Selected Members */}
      <div className="w-full max-w-lg mt-1">
        <div className="flex flex-row justify-between">
        <h2 className="flex text-lg font-bold mb-4 border-b border-black">Selected Members</h2>
        <button onClick={() => setSelectedMembers([])} className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Remove All</button>
        </div>
       
        
        <div className="bg-gradient-to-r from-white to-green-500 p-2 rounded-lg max-h-96 overflow-auto">
        
        <div className="bg-gradient-to-r from-white to-green-200 px-2 ">
          {selectedMembers.map(userId => {
            const user = mobileUsers.find(user => user._id === userId) || adminUsers.find(user => user._id === userId);
            return (
              <li key={userId} className="flex items-center justify-between  py-3 border-b-2 border-gray-500">
                {user && (
                  <div>
                    <strong>Name:</strong> {user.name} | <strong>Admin Type:</strong> {user.adminType || "Mobile User"}
                  </div>
                )}
                <button onClick={(e) => { e.stopPropagation(); handleRemoveMember(userId); }} className="btn btn-sm btn-error">Remove</button>
              </li>
            );
          })}

        </div>
        </div>
        
        
      </div>


      </div>

    </div>
  );
}
