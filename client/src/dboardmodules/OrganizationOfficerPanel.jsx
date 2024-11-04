import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleArrows, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

export default function OrganizationOfficerPanel() {
  const { user } = useContext(UserContext);
  const [organizationData, setOrganizationData] = useState(null);
  const [members, setMembers] = useState([]);
  const [showPotentialMembersModal, setShowPotentialMembersModal] = useState(false);
  const [potentialMembers, setPotentialMembers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [announcements, setAnnouncements] = useState([]); // State for announcements
  const [adminType, setAdminType] = useState('');
  const modalRef = useRef();
  const navigate = useNavigate();
  const userWithId = { ...user, id: user?.id || '' };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/check-auth');
        if (!response.data.authenticated) {
          navigate('/login');
        } else {
          setAdminType(localStorage.getItem('adminType'));
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const fetchAnnouncements = async (organization) => {
    try {
      const token = getCookie('token');
      const userId = user?.id;
      const response = await axios.get(`/organization-announcements/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setAnnouncements(response.data); // Set announcements data
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    }
  };

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const token = getCookie('token');
        const userId = user?.id;

        if (!token || !userId) {
          console.error('Token or User ID is not defined');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          },
        };
        const response = await axios.get(`/organization-data/${userId}`, config);
        setOrganizationData(response.data);
        if (response.data.organization) {
          fetchMembers(response.data.organization);
          fetchAnnouncements(response.data.organization); 
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        toast.error('Failed to fetch organization data');
      }
    };

    fetchOrgData();
  }, []);

  const fetchMembers = async (organization) => {
    try {
      const token = getCookie('token');
      const response = await axios.get(`/organization/${organization}/members`, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    }
  };

  // Fetch announcements from the server
 

  const fetchPotentialMembers = async (organization) => {
    try {
      const token = getCookie('token');
      const response = await axios.get(`/organization/${organization}/potential_members`, { headers: { Authorization: `Bearer ${token}` } });
      setPotentialMembers(response.data);
      setShowPotentialMembersModal(true);
    } catch (error) {
      console.error('Error fetching potential members:', error);
      toast.error('Failed to fetch potential members');
    }
  };

  const addPotentialMember = async (potentialMemberId) => {
    try {
      const token = getCookie('token');
      if (!organizationData.organization) {
        console.error('Organization name is null');
        return;
      }
      const encodedOrgName = encodeURIComponent(organizationData.organization);
      const response = await axios.post(
        `/organization/${encodedOrgName}/add_members`,
        { potentialMemberIds: [potentialMemberId] },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 200) {
        toast.success('Potential member added to organization');

        // Update the members state to include the new member
        const newMember = potentialMembers.find(member => member._id === potentialMemberId);
        setMembers(prevMembers => ({
          ...prevMembers,
          addedMembers: [...prevMembers.addedMembers, newMember]
        }));

        // Remove the added member from potential members list
        setPotentialMembers(prevPotentialMembers => 
          prevPotentialMembers.filter(member => member._id !== potentialMemberId)
        );

        setShowPotentialMembersModal(false);
      } else {
        toast.error('Failed to add potential member to organization');
      }
    } catch (error) {
      console.error('Error adding potential member to organization:', error);
      toast.error('Failed to add potential member to organization');
    }
  };

  const updateMember = async (memberId, updatedData) => {
    try {
      const token = getCookie('token');
      const response = await axios.put(
        `/organizations/${organizationData.organization}/members/${memberId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        toast.success('Member updated successfully');

        // Update the members state with the updated member data
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member._id === memberId ? { ...member, ...updatedData } : member
          )
        );
      } else {
        toast.error('Failed to update member');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Failed to update member');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowPotentialMembersModal(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="">
      <div className="p-3 pr-5 mt-20 w-full h-full shadow-md rounded-3 bg-white border">
        <h2 className='text-4xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3'>
          <FontAwesomeIcon icon={faPeopleArrows} className=' text-yellow-500 mx-1 '/>
          {organizationData && organizationData.organization}
        </h2>

        <div className="max-h-96 overflow-auto">
          <table className="w-full bg-white shadow-2xl rounded-2xl">
            <thead className='sticky top-0 z-10'>
              <tr colSpan="4" className='centered-header'>
                <th>Members</th>
              </tr>
              <tr className='text-left'>
                <th className="bg-green-700 text-white">Name</th>
                <th className="bg-green-700 text-white">Email</th>
                <th className="bg-green-700 text-white">Position</th>
                <th className="bg-green-700 text-white">School Year</th>
              </tr>
            </thead>
            <tbody>
              {members && members.addedMembers && members.addedMembers.map((member, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                  <td className="border py-2">{member.name}</td>
                  <td className="border py-2">{member.studentemail}</td>
                  <td className="border py-2">{member.position}</td>
                  <td className="border py-2">{member.schoolYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end">
          <button onClick={() => fetchPotentialMembers(organizationData.organization)} className='btn btn-success mt-2 flex justify-float-end'>Show Potential Members</button>
        </div>
        
        {showPotentialMembersModal && (
          <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg relative">
              <div className="flex flex-row justify-between">
                <h2 className="text-xl font-bold mb-4 border-b border-yellow-500 text-green-800">Potential Members</h2>

                <button className="btn btn-circle btn-ghost btn-xs" onClick={() => setShowPotentialMembersModal(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="bg-green-700 text-white">Name</th>
                    <th className="bg-green-700 text-white">Email</th>
                    <th className="bg-green-700 text-white">Position</th>
                    <th className="bg-green-700 text-white">School Year</th>
                    <th className="bg-green-700 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {potentialMembers.length > 0 ? (
                    potentialMembers.map((member, index) => (
                      <tr key={index}>
                        <td>{member.name}</td>
                        <td>{member.studentemail}</td>
                        <td>{member.position}</td>
                        <td>{member.schoolYear}</td>
                        <td>
                          <button onClick={() => addPotentialMember(member._id)} className="bg-blue-500 text-white px-2 py-1 rounded">
                            Add
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No potential members</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 pr-5 mt-4 w-full h-full shadow-md rounded-3 bg-white border border-gray-300">
  <h2 className='text-3xl text-green-800 font-bold border-b-2 border-yellow-500 py-2 mb-3'>
    {organizationData && organizationData.organization} Posts
  </h2>
  <div className="overflow-auto max-h-[100vh] w-full">
    {announcements.length > 0 ? (
      announcements.map((announcement, index) => (
        <div key={index} className="card lg:card-side bg-gray-50 shadow-lg mb-4 border border-gray-200 rounded-lg">
          {announcement.mediaUrl ? (
            <div className="p-0">
              {announcement.contentType && announcement.contentType.startsWith("image") ? (
                <img
                  src={announcement.mediaUrl}
                  alt="Announcement Media"
                  className="w-[50vw] max-h-[55vh] object-cover cursor-pointer rounded-t-lg"
                  onClick={() => openModal(announcement.mediaUrl)} // Function to handle modal opening
                />
              ) : announcement.contentType && announcement.contentType.startsWith("video") ? (
                <figure>
                  <video controls className="max-w-xl h-full rounded-t-lg">
                    <source src={announcement.mediaUrl} type={announcement.contentType} />
                  </video>
                </figure>
              ) : announcement.contentType && announcement.contentType.startsWith("audio") ? (
                <audio controls className="max-w-xl h-full rounded-t-lg">
                  <source src={announcement.mediaUrl} type={announcement.contentType} />
                </audio>
              ) : (
                <p className="flex justify-center items-center border-2 border-gray-300 rounded-md p-2">
                  No media available
                </p>
              )}
            </div>
          ) : (
            <p className="flex justify-center items-center border-2 border-gray-300 rounded-md p-2">
              No media available
            </p>
          )}

          <div className="card-body">
            <h2 className="card-title text-blue-700">{announcement.header}</h2>
            <div className="body_container p-2 w-full h-32 rounded-md text-left overflow-auto max-h-full border-2 border-gray-300">
              <p className="text-gray-700">{announcement.body}</p>
            </div>
            <div className="grid grid-cols-2 shadow-inner">
              <div className="max-w-[50vw] p-3 shadow-inner">
                <FontAwesomeIcon className="text-green-500 text-2xl" icon={faThumbsUp} />
                <label className="mx-2 text-gray-800">{announcement.likes} Likes</label>
              </div>
              <div className="max-w-[50vw] p-3 shadow-inner">
                <FontAwesomeIcon className="text-red-500 text-2xl" icon={faThumbsDown} />
                <label className="mx-2 text-gray-800">{announcement.dislikes} Dislikes</label>
              </div>
            </div>
            <div className="card-actions justify-end">
              <button className="btn btn-primary bg-green-600 hover:bg-green-700 text-white rounded-md">
                View
              </button>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-600 text-center">No announcements available.</p>
    )}
  </div>
</div>



      <div className="p-3 pr-5 mt-4 w-full h-full shadow-md rounded-3 bg-white border">
        <h2 className='text-3xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3'>{organizationData && organizationData.organization} Analytics</h2>
        {/* Analytics content here */}
      </div>
    </div>
  );
}
