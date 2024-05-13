import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useAnnouncementNotifications = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    const handleNewAnnouncement = (announcement) => {
        setNotifications(prevNotifications => [...prevNotifications, announcement]);
    };

    useEffect(() => {
        let isSubscribed = true; 
        

        if (isSubscribed) {
            if (socket) {
                socket.on("newAnnouncement", handleNewAnnouncement); 
            } else {
            }
        }

        return () => {
            isSubscribed = false; 
            if (socket) {
                socket.off("newAnnouncement", handleNewAnnouncement); // Update event name
            }
        };
    }, [socket, handleNewAnnouncement]);

    return notifications;
};


export default useAnnouncementNotifications;
