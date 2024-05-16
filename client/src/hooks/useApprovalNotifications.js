import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useApprovalNotifications = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    const handleApprovalNotification = (notification) => {
        setNotifications(prevNotifications => [...prevNotifications, notification]);
    };

    useEffect(() => {
        let isSubscribed = true;

        if (isSubscribed) {
            if (socket) {
                socket.on("announcementApproved", handleApprovalNotification);
            } else {
                // Handle if not subscribed
            }
        }

        return () => {
            isSubscribed = false;
            if (socket) {
                socket.off("announcementApproved", handleApprovalNotification);
            }
        };
    }, [socket, handleApprovalNotification]);

    return notifications;
};

export default useApprovalNotifications;
