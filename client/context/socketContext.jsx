import { createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "./userContext";
import io from "socket.io-client";

export const socketContext = createContext();
export const useSocketContext = () => {
    return useContext(socketContext);
}
export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            // Define an array of URLs to attempt connecting
            const connectionURLs = [
             // Hardcoded IP address
                "http://localhost:8000",//local
                "http://192.168.1.2:8000" //local network
            ];

            // Attempt to connect using each URL until successful
            let socket;
            for (const url of connectionURLs) {
                socket = io(url, {
                    query: {
                        userId: user.id,
                    }
                });
                // If connection is successful, break out of the loop
                socket.on("connect", () => {
                    setSocket(socket);
                    socket.on("getOnlineUsers", (users) => {
                        setOnlineUsers(users);
                    });
                    return;
                });
            }

            return () => {
                if (socket) {
                    socket.close();
                    setSocket(null);
                }
                setOnlineUsers([]);
            };
        }
    }, [user]);

    return (
        <socketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </socketContext.Provider>
    );
};
