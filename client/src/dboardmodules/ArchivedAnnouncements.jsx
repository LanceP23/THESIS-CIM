import React, { useEffect, useState } from 'react';
import './ArchiveAnnouncements.css';
import axios from 'axios';
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid';
import { toast } from 'react-hot-toast';

const ArchiveAnnouncement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [showConfirm, setShowConfirm] = useState(false); // State for confirmation dialog
    const [announcementToRepost, setAnnouncementToRepost] = useState(null); // Announcement to repost

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
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
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
                        className="card bg-white shadow-lg rounded-lg p-4 mb-4 border border-gray-200"
                    >
                        <div className="card-body space-y-4">
                            <div className="flex justify-between items-center">
                                {editingId === announcement._id ? (
                                    <input
                                        type="text"
                                        className="text-2xl font-semibold border-b border-gray-300 focus:outline-none focus:border-blue-500"
                                        value={editedData.header || ''}
                                        onChange={(e) =>
                                            setEditedData({ ...editedData, header: e.target.value })
                                        }
                                    />
                                ) : (
                                    <h3 className="text-2xl font-semibold">
                                        {announcement.header}
                                    </h3>
                                )}

                                <span className="text-sm text-gray-500">
                                    {new Date(announcement.postingDate).toLocaleDateString()}
                                </span>
                            </div>

                            {editingId === announcement._id ? (
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                                    rows="3"
                                    value={editedData.body || ''}
                                    onChange={(e) =>
                                        setEditedData({ ...editedData, body: e.target.value })
                                    }
                                />
                            ) : (
                                <p className="text-md text-gray-700">{announcement.body}</p>
                            )}

                            {announcement.mediaUrl && (
                                <div className="media-container mt-4">
                                    {announcement.contentType?.includes('image') && (
                                        <img
                                            src={announcement.mediaUrl}
                                            alt="Announcement media"
                                            className="w-full h-auto rounded-lg"
                                        />
                                    )}
                                    {announcement.contentType?.includes('video') && (
                                        <video controls className="w-full h-auto rounded-lg mt-2">
                                            <source src={announcement.mediaUrl} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                    {announcement.contentType?.includes('audio') && (
                                        <audio controls className="w-full h-auto mt-2 rounded-lg">
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

                            <div className="flex justify-between items-center mt-4">
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
                                        className="btn btn-primary text-sm"
                                        onClick={() => handleEdit(announcement._id, announcement)}
                                    >
                                        Edit
                                    </button>
                                )}

                                <div className="text-sm text-gray-400">
                                    Expired on: {new Date(announcement.expirationDate).toLocaleDateString()}
                                </div>

                                {/* Repost Button */}
                                <button
                                    className="btn btn-warning text-sm"
                                    onClick={() => handleRepost(announcement._id)}
                                >
                                    Repost
                                </button>
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
    );
};

export default ArchiveAnnouncement;
