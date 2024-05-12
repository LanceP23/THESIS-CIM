import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../../context/socketContext';

const useEventNotifications = () => {
    const { socket } = useContext(socketContext);
    const [notifications, setNotifications] = useState([]);

    const handleNewEvent = (event) => {
        setNotifications(prevNotifications => [...prevNotifications, event]);
    };

    useEffect(() => {
        let isSubscribed = true; 
        
        if (socket && isSubscribed) {
            socket.on("newEvent", handleNewEvent);
        } else {
            console.log("Socket object is null or undefined.");
        }

        return () => {
            if (socket) {
                socket.off("newEvent", handleNewEvent);
            }
            isSubscribed = false;
        };
    }, [socket, handleNewEvent]);

    return notifications;
};

export default useEventNotifications;
