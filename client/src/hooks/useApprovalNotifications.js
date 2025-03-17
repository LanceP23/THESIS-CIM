import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useApprovalNotifications = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    const handleNotification = (notification) => {
        setNotifications(prevNotifications => [...prevNotifications, notification]);
    };

    useEffect(() => {
        let isSubscribed = true;

        if (isSubscribed && socket) {
            socket.on("announcementApproved", handleNotification);
            socket.on("announcementRejected", handleNotification); // Add listener for rejection
        }

        return () => {
            isSubscribed = false;
            if (socket) {
                socket.off("announcementApproved", handleNotification);
                socket.off("announcementRejected", handleNotification); // Remove rejection listener
            }
        };
    }, [socket]);

    return notifications;
};

export default useApprovalNotifications;
