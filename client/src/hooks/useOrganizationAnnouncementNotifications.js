import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useOrganizationAnnouncementNotifications = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    const handleNewOrganizationAnnouncement = (announcement) => {
        console.log("Received announcement:", announcement);
        setNotifications(prevNotifications => [...prevNotifications, announcement]);
    };

    useEffect(() => {
        let isSubscribed = true;

        if (isSubscribed) {
            if (socket) {
                socket.on("newOrganizationAnnouncement", handleNewOrganizationAnnouncement);
            }
        }

        return () => {
            isSubscribed = false;
            if (socket) {
                socket.off("newOrganizationAnnouncement", handleNewOrganizationAnnouncement);
            }
        };
    }, [socket]);

    return notifications;
};

export default useOrganizationAnnouncementNotifications;