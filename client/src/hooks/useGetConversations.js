import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from 'axios'

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);

    const getToken = () => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!token) {
          throw new Error('Token not found');
        }
        return token.split('=')[1];
      };

	useEffect(() => {
		const getConversations = async () => {
			setLoading(true);
			try {
                const token = getToken(); 
				const res = await axios.get("/api/users",{
                    headers: {
                        Authorization: `Bearer ${token}`, 
                      },   
                });
				const data = res.data;
				if (data.error) {
					throw new Error(data.error);
				}
				setConversations(data);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		getConversations();
	}, []);

	return { loading, conversations };
};
export default useGetConversations