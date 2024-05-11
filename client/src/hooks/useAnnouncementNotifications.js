import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useAnnouncementNotifications = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        let isSubscribed = true; // Flag to track if component is still mounted
        
        if (isSubscribed) {
            console.log("Attempting to subscribe to 'newAnnouncement' event..."); // Update event name
            const handleNewAnnouncement = (announcement) => { // Rename the handler
                console.log("New announcement received:", announcement);
                // Add the new announcement to the current list
                setNotifications(prevNotifications => [...prevNotifications, announcement]);
            };

            if (socket) {
                socket.on("newAnnouncement", handleNewAnnouncement); // Update event name
                console.log("Successfully subscribed to 'newAnnouncement' event."); // Update event name
            } else {
                console.log("Socket object is null or undefined.");
            }
        }

        return () => {
            isSubscribed = false; // Clean up when component unmounts
            // Clean up the event listener when the component unmounts
            if (socket) {
                socket.off("newAnnouncement", handleNewAnnouncement); // Update event name
                console.log("Event listener for 'newAnnouncement' event removed."); // Update event name
            }
        };
    }, [socket]);

    return notifications;
};


export default useAnnouncementNotifications;
