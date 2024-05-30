import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useCommunityNotification = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    const handleNewCommunityAnnouncement = (announcement) => {
        setNotifications(prevNotifications => [...prevNotifications, announcement]);
    };

    useEffect(() => {
        let isSubscribed = true;

        if (isSubscribed && socket) {
            socket.on("newCommunityAnnouncement", handleNewCommunityAnnouncement);
        }

        return () => {
            isSubscribed = false;
            if (socket) {
                socket.off("newCommunityAnnouncement", handleNewCommunityAnnouncement);
            }
        };
    }, [socket, handleNewCommunityAnnouncement]);

    return notifications;
};

export default useCommunityNotification;
