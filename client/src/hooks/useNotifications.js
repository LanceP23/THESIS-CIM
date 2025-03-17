import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useNotifications = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const handleNewNotification = (notification) => {
            // Add the new notification to the current list
            setNotifications(prevNotifications => [...prevNotifications, notification]);
        };

        socket?.on("newNotification", handleNewNotification);

        return () => {
            // Clean up the event listener when the component unmounts
            socket?.off("newNotification", handleNewNotification);
        };
    }, [socket]);

    return notifications;
};

export default useNotifications;
