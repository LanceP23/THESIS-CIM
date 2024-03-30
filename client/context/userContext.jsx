import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!user && !authenticated) {
      axios.get('/profile').then(({ data }) => {
        setUser(data);
        setAuthenticated(true); 
      });
    }
  }, [user, authenticated]);

  return (
    <UserContext.Provider value={{ user, setUser, authenticated }}>
      {children}
    </UserContext.Provider>
  );
}