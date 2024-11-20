import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Function to check if the user is authenticated
    const checkAuth = async () => {
      try {
        // Call the backend to check if the session is valid
        const { data } = await axios.get('/check-auth', { withCredentials: true });

        if (data.authenticated) {
          // If authenticated, fetch the user profile
          const profileResponse = await axios.get('/profile', { withCredentials: true });
          setUser(profileResponse.data);
          setAuthenticated(true);
        } else {
          // If not authenticated, reset user context
          setUser(null);
          setAuthenticated(false);
        }
      } catch (error) {
        // If there's an error with the request, assume not authenticated
        setUser(null);
        setAuthenticated(false);
      }
    };

    // Call checkAuth on initial load
    checkAuth();

    // Optional: if you want to listen for logout events, handle that as well
    const handleStorageChange = (e) => {
      if (e.key === 'logout') {
        // Clear user context if logout event is triggered
        setUser(null);
        setAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this effect runs once on mount

  return (
    <UserContext.Provider value={{ user, setUser, authenticated, setAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}
