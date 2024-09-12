import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './Home.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import carousel styles

export default function Home() {
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleTabKey);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  useEffect(() => {
    const fetchRecentAnnouncements = async () => {
      try {
        const response = await axios.get('/recent-announcements');
        setRecentAnnouncements(response.data);
      } catch (error) {
        console.error('Error fetching approved announcements:', error);
      }
    };

    fetchRecentAnnouncements();
  }, []);

  return (
    <div>
      <Navbar />
     
        <div className="my-36 w-1/2 h-80 p-2 absolute left-16">
          <h2 className="p-2 text-white font-semibold font-serif text-3xl shadow-inner animate-text-reveal text-left">
            Stay informed and connected <br /> with the latest news and
            happenings <br /> around the campus with
          </h2>
        </div>

      {/* Announcements Carousel */}
      <div className="announcements-container p-4 bg-white rounded-lg shadow-md m-8">
        <h3 className="text-xl font-bold mb-4">Recent Announcements</h3>
        {recentAnnouncements.length > 0 ? (
          <Carousel showThumbs={false} infiniteLoop autoPlay interval={5000} className="w-full">
            {recentAnnouncements.slice(0, 5).map((announcement) => (
              <div
                key={announcement._id}
                className="card card-side bg-slate-200 shadow-2xl p-0 m-5 transition-transform duration-300 ease-in-out transform hover:scale-105"
              >
                {announcement.mediaUrl ? (
                  <div className="p-0">
                    {announcement.contentType && announcement.contentType.startsWith('image') ? (
                      <img src={announcement.mediaUrl} alt="Announcement Media" className="max-w-xl h-full" />
                    ) : announcement.contentType && announcement.contentType.startsWith('video') ? (
                      <figure>
                        <video controls className="max-w-xl h-full">
                          <source src={announcement.mediaUrl} type={announcement.contentType} />
                        </video>
                      </figure>
                    ) : announcement.contentType && announcement.contentType.startsWith('audio') ? (
                      <audio controls className="max-w-xl h-full">
                        <source src={announcement.mediaUrl} type={announcement.contentType} />
                      </audio>
                    ) : (
                      <p className="flex justify-center items-center border-2 border-white max-w-xl h-full">No media available</p>
                    )}
                  </div>
                ) : (
                  <p className="flex justify-center items-center border-2 border-white max-w-xl h-full">No media available</p>
                )}

                <div className="p-4">
                  <h4 className="font-semibold text-lg">{announcement.header}</h4>
                  <p className="text-gray-600">{announcement.body}</p>
                  
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <p className="text-gray-500">No recent announcements available.</p>
        )}
      </div>

      <footer className="w-full position-fixed top left-0 right-0 bottom-0 h">
        <h2 className="p-2 text-white font-semibold font-serif text-sm shadow-inner animate-text-reveal text-center">
          Powered By College of St. Catherine Quezon City
        </h2>
      </footer>
    </div>
  );
}
