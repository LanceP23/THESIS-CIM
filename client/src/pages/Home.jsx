import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './Home.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import carousel styles

export default function Home() {
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

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
    <div className="home-page">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="hero-section bg-cover bg-center w-full h-screen flex justify-center items-center text-center relative"
        style={{ backgroundImage: "url('../src/assets/CORPO_CIM/gradeint_cover.gif')" }}>
        <div className="overlay absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
        <div className="hero-content z-10">
          <h1 className="text-white font-bold text-5xl md:text-6xl shadow-lg mb-6">Stay Connected with Campus Life</h1>
          <p className="text-white font-medium text-xl md:text-2xl">Discover the latest announcements and events around campus.</p>
        </div>
      </div>

      {/* Announcements Section */}
      <section className="announcements-section bg-gray-100 py-16 px-8">
        <div className="container mx-auto">
          <h2 className="text-center text-3xl font-bold mb-12">Recent Announcements</h2>

          {recentAnnouncements.length > 0 ? (
            <Carousel showThumbs={false} infiniteLoop autoPlay interval={5000} className="w-full">
              {recentAnnouncements.slice(0, 5).map((announcement) => (
                <div
                  key={announcement._id}
                  className="card bg-white shadow-lg rounded-lg p-6 flex flex-col md:flex-row transition-transform duration-300 ease-in-out transform hover:scale-105"
                >
                  {/* Media Section */}
                  {announcement.mediaUrl ? (
                    <div className="media-section md:w-1/2">
                      {announcement.contentType && announcement.contentType.startsWith('image') ? (
                        <img src={announcement.mediaUrl} alt="Announcement Media" className="w-full h-full object-cover rounded-lg" />
                      ) : announcement.contentType && announcement.contentType.startsWith('video') ? (
                        <video controls className="w-full h-full rounded-lg">
                          <source src={announcement.mediaUrl} type={announcement.contentType} />
                        </video>
                      ) : announcement.contentType && announcement.contentType.startsWith('audio') ? (
                        <audio controls className="w-full h-full">
                          <source src={announcement.mediaUrl} type={announcement.contentType} />
                        </audio>
                      ) : (
                        <p className="text-center border border-gray-200 p-6 rounded-lg">No media available</p>
                      )}
                    </div>
                  ) : (
                    <div className="md:w-1/2 flex justify-center items-center border border-gray-200 p-6 rounded-lg">
                      <p>No media available</p>
                    </div>
                  )}

                  {/* Announcement Text Section */}
                  <div className="announcement-details md:w-1/2 md:pl-8 mt-4 md:mt-0">
                    <h4 className="font-semibold text-2xl mb-2">{announcement.header}</h4>
                    <p className="text-gray-700 mb-4">{announcement.body}</p>
                    <span className="text-sm text-gray-500">
                      Posted on: {new Date(announcement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </Carousel>
          ) : (
            <p className="text-gray-500 text-center">No recent announcements available.</p>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer bg-gray-800 py-4">
        <div className="container mx-auto text-center">
          <p className="text-white text-sm font-light">Powered By College of St. Catherine Quezon City</p>
        </div>
      </footer>
    </div>
  );
}
