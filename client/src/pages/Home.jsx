import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import './Home.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import carousel styles
import { convertLength } from '@mui/material/styles/cssUtils';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faMessage}from '@fortawesome/free-solid-svg-icons';


export default function Home() {
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 1200, // Duration of the animations
      // You can add other configuration options here
      once: false,

    });
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
    <div className="">
      {/* Navbar */}
      <Navbar />

      <div className=" w-full h-[95vh]">
  {recentAnnouncements.length > 0 ? (
    <Carousel showThumbs={false} infiniteLoop autoPlay interval={5000} className="w-full">
      {recentAnnouncements.slice(0, 5).map((announcement) => (
        <div
          key={announcement._id}
          className="pt-20 shadow-lg w-full h-[95vh] relative bg-green-950"
        >
          {/* Media Section */}
          {announcement.mediaUrl ? (
            <div className="lg:w-full flex items-center justify-center relative"> {/* Centering media and making it relative */}
              {announcement.contentType && announcement.contentType.startsWith('image') ? (
                <>
                  <img
                    src={announcement.mediaUrl}
                    alt="Announcement Media"
                    className="w-full h-[85vh] object-cover opacity-45 "
                  />
                  {/* Text Overlay */}
                  <div className="absolute bottom-0 left-0 pt-2 p-4 w-full text-center bg-black bg-opacity-50  ">
                    <h4 className="font-semibold text-2xl mb-2 text-white border-b-2 border-yellow-500">{announcement.header}</h4>
                    <p className="text-md text-white">{announcement.body}</p>
                  </div>
                </>
              ) : announcement.contentType && announcement.contentType.startsWith('video') ? (
                <>
                  <video controls className="w-full h-[80vh] object-cover rounded-lg">
                    <source src={announcement.mediaUrl} type={announcement.contentType} />
                  </video>
                  {/* Text Overlay */}
                  <div className="absolute bottom-0 bg-black bg-opacity-50 text-white p-4 w-full">
                    <h4 className="font-semibold text-xl mb-1">{announcement.header}</h4>
                    <p className="text-sm">{announcement.body}</p>
                  </div>
                </>
              ) : announcement.contentType && announcement.contentType.startsWith('audio') ? (
                <audio controls className="w-full h-auto">
                  <source src={announcement.mediaUrl} type={announcement.contentType} />
                </audio>
              ) : (
                <div className="  ">
                <p className="text-center border border-gray-200 p-6 rounded-lg just">No media available</p>
                </div>
              )}
            </div>
          ) : (
            <div className=" flex justify-center items-center border border-gray-200 p-6 rounded-lg">
              <p>No media available</p>
            </div>
          )}
        </div>
      ))}
    </Carousel>
  ) : (
    <p className="text-gray-500 text-center">No recent announcements available.</p>
  )}
</div>


          {/* Hero Section */}
          <div className="hero-section bg-[url('../src/assets/CORPO_CIM/gradeint_cover.gif')] bg-cover bg-no-repeat bg-center w-full h-screen flex justify-center items-center text-center relative ">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70"></div>
        <div className="hero-content z-10 flex"   >
          <h1 className="text-white font-bold text-5xl md:text-6xl mb-6 " data-aos="fade-right" >Stay Connected with Campus Life</h1>
          <p className="text-white font-medium text-xl md:text-2xl" data-aos="fade-left">Discover the latest announcements and events around campus with</p>
        </div>
      </div>

      <div className=" hero-section bg-[url('../src/assets/home_image.jpg')] bg-cover bg-no-repeat bg-center w-full h-screen flex justify-center items-center text-center relative" >
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70" ></div>
        <div className="flex lg:flex-row md:flex-col sm:flex-col gap-5 "  data-aos="fade-up">
          <div className="card glass w-96">

            <figure>
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="car!" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-white text-center border-b-2 border-yellow-500">Unified Campus Media platform for Announcements and Events</h2>
              <p className='text-gray-300'>A centralized, regulated platform providing 
                real-time updates to keep everyone informed and engaged with campus events.
               </p>
             
            </div>
          </div>

          <div className="card glass w-96">
            <figure>
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="car!" />
            </figure>
            <div className="card-body ">
              <h2 className="card-title text-white text-center border-b-2 border-yellow-500">Mobile Application for Easy Access </h2>
              <p className='text-gray-300'> Catherinians can download the CIM mobile app to easily access the latest campus announcements and events, 
                staying informed about everything the school has to offer.</p>
             
            </div>
          </div>

          <div className="card glass w-96">
            <figure>
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="car!" />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-white text-center text-md border-b-2 border-yellow-500">Interactive Announcements for Enhanced User Engagement</h2>
              <p className='text-gray-300'>Users can enjoy a participative experience that 
                captures their attention through simple games about certain events.</p>
             
            </div>
          </div>



        </div>








      </div>

      <div className="w-full h-[10vh] bg-green-950 flex items-center justify-end px-3 gap-3"  >

        <div className="text-white text-md animate-fade-in" >
          <p>Created and powered by College of St. Catherine Quezon City</p>
        </div>

      <button className="btn btn-circle btn-outline">
       <FontAwesomeIcon icon={faMessage} className='text-yellow-500 text-lg'/>
      </button>

      <button className="btn btn-circle btn-outline">
       <FontAwesomeIcon icon={faMessage} className='text-yellow-500 text-lg '/>
      </button>
      </div>

     

    </div>
  );
}
