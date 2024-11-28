import React, { useEffect, useState } from 'react';
import './ArchiveAnnouncements.css';
import axios from 'axios';
import { ThumbUpIcon, ThumbDownIcon, ArrowCircleLeftIcon} from '@heroicons/react/solid';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ArchiveAnnouncement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [showConfirm, setShowConfirm] = useState(false); // State for confirmation dialog
    const [announcementToRepost, setAnnouncementToRepost] = useState(null); // Announcement to repost
    const [showImageModal, setShowImageModal] = useState(false); // State for image modal
    const [selectedImage, setSelectedImage] = useState(null); // Selected image to display in modal


    // Function to handle image click and open modal
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // Function to close the image modal
    const closeImageModal = () => {
        setSelectedImage(null);
        setShowImageModal(false);
    };


    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/archived-announcements?page=${page}&limit=10`);
                if (response.data.success) {
                    const newAnnouncements = response.data.data;

                    setAnnouncements((prev) =>
                        [...prev, ...newAnnouncements].filter(
                            (announcement, index, self) =>
                                index === self.findIndex((a) => a._id === announcement._id) // Ensure unique announcements
                        )
                    );
                } else {
                    toast.error('Failed to fetch announcements.');
                }
            } catch (error) {
                console.error('Error fetching announcements:', error);
                toast.error('Error fetching announcements.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [page]);

    const handleEdit = (id, announcement) => {
        setEditingId(id);
        setEditedData({ ...announcement });
    };

    const handleSave = async (id) => {
        try {
            const response = await axios.put(`/archived-announcement/${id}`, editedData);
            if (response.data.success) {
                setAnnouncements((prev) =>
                    prev.map((a) => (a._id === id ? { ...a, ...editedData } : a))
                );
                setEditingId(null);
                toast.success('Announcement updated successfully.');
            } else {
                toast.error('Failed to update announcement.');
            }
        } catch (error) {
            console.error('Error saving announcement:', error);
            toast.error('Error saving announcement.');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditedData({});
    };

    const handleRepost = (id) => {
        // Show the confirmation modal
        setShowConfirm(true);
        setAnnouncementToRepost(id);
    };

    const confirmRepost = async () => {
        // Repost the announcement after confirmation
        try {
            const response = await axios.post(`/repost-announcement/${announcementToRepost}`);
            if (response.data.success) {
                // Remove reposted announcement from the archived list
                setAnnouncements((prev) =>
                    prev.filter((announcement) => announcement._id !== announcementToRepost)
                );
                toast.success('Announcement reposted successfully.');
            } else {
                toast.error('Failed to repost announcement.');
            }
        } catch (error) {
            console.error('Error reposting announcement:', error);
            toast.error('Error reposting announcement.');
        } finally {
            setShowConfirm(false); // Close the confirmation dialog
            setAnnouncementToRepost(null);
        }
    };

    const cancelRepost = () => {
        // Hide the confirmation modal
        setShowConfirm(false);
        setAnnouncementToRepost(null);
    };

    return (
        <div className="mt-16 ml-12 pt-4 mr-5">
            <div className="  p-3 pr-5 w-full h-full shadow-md rounded-3 bg-slate-200 border ">
                <div className="flex flex-row justify-between">
            <h2 className='text-3xl text-green-800 border-b-2 border-yellow-500 py-2 mb-3'>Posted Announcement Archives</h2>

            <Link to="/createannouncement">
                <button className=""><ArrowCircleLeftIcon className="w-10 h-10 text-red-600" /></button>
            </Link>
            </div>
            <div className="max-h-[70vh] overflow-y-auto ">
            {loading && page === 1 ? (
                <div className="text-center text-xl font-semibold">Loading...</div>
            ) : announcements.length === 0 ? (
                <div className="text-center text-xl font-semibold text-gray-500">
                    No announcements available.
                </div>
            ) : (
                announcements.map((announcement) => (
                    <div
                        key={announcement._id}
                        className="card bg-slate-100 shadow-lg rounded-lg p-4 mb-4 border border-gray-200"
                    >
                        <div className="card-body ">
                            <div className=" flex flex-row justify-between items-center">
                                {editingId === announcement._id ? (
                                    <input
                                        type="text"
                                        className="input input-bordered input-success input-md w-full dark:text-white  rounded-md shadow-xl"
                                        value={editedData.header || ''}
                                        onChange={(e) =>
                                            setEditedData({ ...editedData, header: e.target.value })
                                        }
                                    />
                                ) : (
                                    
                                    <h3 className="mb-2 text-2xl text-green-700 font-bold text-left border-b border-yellow-500">
                                        {announcement.header}
                                    </h3>
                                )}

                                <span className="text-sm text-gray-500">
                                    {new Date(announcement.postingDate).toLocaleDateString()}
                                </span>
                            </div>

                            {editingId === announcement._id ? (
                                <textarea
                                    className="textarea textarea-success w-full dark:text-white rounded-md shadow-xl"
                                    rows="3"
                                    value={editedData.body || ''}
                                    onChange={(e) =>
                                        setEditedData({ ...editedData, body: e.target.value })
                                    }
                                />
                            ) : (
                                <p className="mb-2 font-bold text-left text-gray-700">{announcement.body}</p>
                            )}

                            {announcement.mediaUrl && (
                                <div className="media-container mt-4">
                                    {announcement.contentType?.includes('image') && (
                                        <img
                                            src={announcement.mediaUrl}
                                            alt="Announcement media"
                                            className="w-auto h-72 shadow-lg cursor-pointer"
                                            onClick={() => handleImageClick(announcement.mediaUrl)} 
                                        />
                                        
                                    )}
                                    {announcement.contentType?.includes('video') && (
                                        <video controls className="w-auto max-h-96 shadow-lg">
                                            <source src={announcement.mediaUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                    {announcement.contentType?.includes('audio') && (
                                        <audio controls className="w-auto max-h-96 shadow-lg">
                                            <source src={announcement.mediaUrl} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-start space-x-4 mt-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <ThumbUpIcon className="w-5 h-5 text-blue-500" />
                                    <span className="font-semibold">Likes:</span>
                                    <span>{announcement.like || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <ThumbDownIcon className="w-5 h-5 text-red-500" />
                                    <span className="font-semibold">Dislikes:</span>
                                    <span>{announcement.dislike || 0}</span>
                                </div>
                            </div>

                            <div className=" flex text-sm text-gray-400 justify-start">
                                    Expired on: {new Date(announcement.expirationDate).toLocaleDateString()}
                                </div>

                            <div className="flex justify-between items-center mt-4">
                                

                              

                                {/* Repost Button */}
                                <button
                                    className="btn btn-warning text-sm"
                                    onClick={() => handleRepost(announcement._id)}
                                >
                                    Repost
                                </button>

                                {editingId === announcement._id ? (
                                    <div className="flex space-x-4">
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleSave(announcement._id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-success text-sm"
                                        onClick={() => handleEdit(announcement._id, announcement)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
                        <h3 className="text-xl font-semibold mb-4">Are you sure you want to repost?</h3>
                        <div className="flex justify-between space-x-4">
                            <button
                                className="btn btn-danger"
                                onClick={cancelRepost}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={confirmRepost}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {announcements.length > 0 && (
                <div className="text-center mt-4">
                    <button
                        className="btn btn-primary text-white"
                        onClick={() => setPage((prevPage) => prevPage + 1)}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
            </div>
            </div>

             {/* Modal for Image Preview */}
             {showImageModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="relative  rounded-lg shadow-lg w-[60vw] max-h-[80vh]  ">
                            <button className="btn btn-circle btn-sm absolute top-2 right-2  " onClick={closeImageModal}>
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                </button>
                                <img
                                    src={selectedImage}
                                    alt="Preview"
                                    className="w-full h-[88vh] rounded-md shadow-lg"
                                />
                            </div>
                        </div>
                    )}
        </div>
    );
};

export default ArchiveAnnouncement;
