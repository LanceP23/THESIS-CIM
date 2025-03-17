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
    <FontAwesomeIcon icon={faPeopleArrows} className='text-yellow-500 mx-1 '/>
    {organizationData && organizationData.organization}
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
    {members && members.addedMembers && members.addedMembers.map((member, index) => (
      <div key={index} className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden transition-all transform hover:scale-105">
        <div className="p-4 bg-green-700 text-white text-xl font-semibold">
          {member.name}
        </div>
        <div className="flex flex-col p-4">
          <p className="text-gray-800"><strong>Email:</strong> {member.studentemail}</p>
          <p className="text-gray-800"><strong>Position:</strong> {member.position}</p>
          <p className="text-gray-800"><strong>School Year:</strong> {member.schoolYear}</p>
        </div>
      </div>
    ))}
  </div>

  <div className="flex justify-end mt-4">
    <button onClick={() => fetchPotentialMembers(organizationData.organization)} className='btn bg-green-600 text-white hover:bg-green-700 rounded-md px-6 py-2'>
      Show Potential Members
    </button>
  </div>

  {showPotentialMembersModal && (
    <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg relative max-w-3xl w-full">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-4 border-b border-yellow-500 text-green-800">Potential Members</h2>
          <button className="btn btn-circle btn-ghost btn-xs" onClick={() => setShowPotentialMembersModal(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {potentialMembers.length > 0 ? (
            potentialMembers.map((member, index) => (
              <div key={index} className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden transition-all">
                <div className="p-4 bg-green-700 text-white text-xl font-semibold">
                  {member.name}
                </div>
                <div className="flex flex-col p-4">
                  <p className="text-gray-800"><strong>Email:</strong> {member.studentemail}</p>
                  <p className="text-gray-800"><strong>Position:</strong> {member.position}</p>
                  <p className="text-gray-800"><strong>School Year:</strong> {member.schoolYear}</p>
                </div>
                <div className="p-4 flex justify-end">
                  <button onClick={() => addPotentialMember(member._id)} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-600">No potential members</div>
          )}
        </div>
      </div>
    </div>
  )}
</div>

{/* Announcements Section */}
<div className="p-3 pr-5 mt-4 w-full h-full shadow-md rounded-3 bg-white border border-gray-300">
  <h2 className='text-3xl text-green-800 font-bold border-b-2 border-yellow-500 py-2 mb-3'>
    {organizationData && organizationData.organization} Posts
  </h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {announcements.length > 0 ? (
      announcements.map((announcement, index) => (
        <div key={index} className="card bg-gray-50 shadow-lg rounded-lg overflow-hidden">
          {announcement.mediaUrl && (
            <div className="overflow-hidden">
              {announcement.contentType.startsWith("image") ? (
                <img
                  src={announcement.mediaUrl}
                  alt="Announcement Media"
                  className="w-full max-h-64 object-cover cursor-pointer"
                  onClick={() => openModal(announcement.mediaUrl)}
                />
              ) : announcement.contentType.startsWith("video") ? (
                <video controls className="w-full max-h-64 object-cover">
                  <source src={announcement.mediaUrl} type={announcement.contentType} />
                </video>
              ) : announcement.contentType.startsWith("audio") ? (
                <audio controls className="w-full max-h-64 object-cover">
                  <source src={announcement.mediaUrl} type={announcement.contentType} />
                </audio>
              ) : (
                <div className="text-center p-4">No media available</div>
              )}
            </div>
          )}
          
          <div className="p-4">
            <h3 className="text-blue-700 text-xl font-semibold">{announcement.header}</h3>
            <p className="text-gray-700">{announcement.body}</p>
          </div>
          
          <div className="flex justify-between p-4">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faThumbsUp} className="text-green-500" />
              <span className="ml-2">{announcement.likes} Likes</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faThumbsDown} className="text-red-500" />
              <span className="ml-2">{announcement.dislikes} Dislikes</span>
            </div>
          </div>
          
          <div className="p-4 flex justify-end">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md">
              View
            </button>
          </div>
        </div>
      ))
    ) : (
      <p className="text-gray-600 text-center">No announcements available.</p>
    )}
  </div>
</div>

{/* Analytics Section */}
<div className="p-3 pr-5 mt-4 w-full h-full shadow-md rounded-3 bg-white border">
  <h2 className='text-3xl text-green-800 font-bold border-b-2 border-yellow-500 py-2 mb-3'>
    {organizationData && organizationData.organization} Analytics
  </h2>
  {/* Analytics content */}
</div>

    </div>
  );
}
