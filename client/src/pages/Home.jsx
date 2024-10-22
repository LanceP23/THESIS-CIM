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
import { faFacebook, faFacebookMessenger } from '@fortawesome/free-brands-svg-icons';
import {faMessage}from '@fortawesome/free-solid-svg-icons';


export default function Home() {
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    AOS.init({
      duration: 1500, // Duration of the animations
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
    <div className=" w-full flex flex-wrap overflow-x-hidden overflow-y-hidden">
      {/* Navbar */}
      <Navbar />

      <div className=" flex w-full h-[96vh] ">
      {Array.isArray(recentAnnouncements) && recentAnnouncements.length > 0 ? (
    <Carousel showThumbs={false} infiniteLoop autoPlay interval={5000} className="w-full">
      {recentAnnouncements.slice(0, 5).map((announcement) => (
        <div
          key={announcement._id}
          className="pt-20 shadow-lg w-auto h-[95vh] relative bg-green-950"
        >
          {/* Media Section */}
          {announcement.mediaUrl ? (
            <div className="lg:w-full flex items-center justify-center relative flex-wrap"> {/* Centering media and making it relative */}
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
                  <video controls className="w-screen h-[80vh] object-cover rounded-lg">
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
          <div className="hero-section bg-[url('/assets/CORPO_CIM/gradeint_cover.gif')] bg-cover bg-no-repeat bg-center w-full h-[80vh] flex justify-center items-center text-center relative ">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70"></div>
        <div className="hero-content z-10 flex"   >
          <h1 className="text-white font-bold text-5xl md:text-6xl mb-6 " data-aos="fade-right" >Stay Connected with Campus Life</h1>
          <p className="text-white font-medium text-xl md:text-2xl" data-aos="fade-left">Discover the latest announcements and events around campus with</p>
        </div>
      </div>

        {/* App Hero Section*/ }
      <div className="w-full max-h-[95vh] bg-green-950 ">
      

       <div className="flex flex-row ">
          <div className="hero-content relative z-10 md:items-center md:justify-center ">
                 {/* Top Image (Visible on smaller screens) */}
              <div className="absolute inset-0 justify-center hidden sm:block md:block lg:block xl:block">
                <img
                  src="/assets/CORPO_CIM/HOME_ASSET (6).png"
                  alt="car!"
                  className="w-[50vw] h-full opacity-30"
                  data-aos="flip-right"
                />
              </div>

              {/* Bottom Image (Visible on larger screens) */}
              <div className="absolute inset-0 justify-self-end block sm:hidden md:hidden lg:hidden xl:hidden">
                <img
                  src="/assets/CORPO_CIM/HOME_ASSET (2).png"
                  alt="car!"
                  className="max-w-[70vw] max-h-[50vh] opacity-50"
                  data-aos="fade-left"
                />
              </div>

              

                <div className="flex flex-col relative justify-center md:items-center md:justify-center  ">
                  {/* Background div for opacity */}
                  <div className="absolute inset-0 bg-black opacity-50 rounded-lg z-10 " data-aos="fade-right" />

                  <div className="text-left z-20 p-6 ">
                    <h1 className="text-white font-bold text-5xl text-left mb-6" data-aos="fade-right">
                      CIM Application
                    </h1>
                    <div className="w-[50vw] ">
                      <p className="text-white font-sm text-md text-left relative z-20" data-aos="fade-right">
                        Experience our app on the go with our mobile version, available for download now. Whether you are at home or on the move, stay connected and enjoy seamless functionality across all your devices.
                      </p>
                    </div>
                  </div>
                </div>

            </div>

            


              <div className="hidden sm:block md:block lg:block xl:block ">
              <img
                      src="/assets/CORPO_CIM/HOME_ASSET (2).png"
                      alt="car!"
                      className=' w-[45vw] h-[95vh] opacity-45 '
                      data-aos="fade-left" />

              </div>

        </div>
        

       </div>

       <div className=" bg-[url('/assets/home_image.jpg')] bg-cover bg-no-repeat bg-center w-full max-h-[280vh] flex justify-center items-center text-center relative p-4" >
    <div className="absolute inset-0 bg-black opacity-70"></div>

    <div className="flex flex-col sm:flex-col md:flex-col lg:flex-row xl:flex-row gap-4" data-aos="fade-up">

        <div className="card glass w-96 sm:w-[80vw] md:[80vw] lg:w-96 xl:w-96 p-3 sm:card-side md:card-side lg:card xl:card">
            <figure className=''>
                <img src="/assets/CORPO_CIM/HOME_ASSET (1).png" alt="car!" className='w-32 h-auto sm:w-full md:w-full lg:w-32 xl:w-32 ' />
            </figure>
            <div className="card-body">
                <h2 className="card-title text-white text-center border-b-2 border-yellow-500">Unified Campus Media platform for Announcements and Events</h2>
                <p className='text-gray-300'>
                    A centralized, regulated platform providing real-time updates to keep everyone informed and engaged with campus events.
                </p>
            </div>
        </div>

        <div className="card glass w-96 sm:w-[80vw] md:[80vw] lg:w-96 xl:w-96 p-3 sm:card-side md:card-side lg:card xl:card">
            <figure>
                <img src="/assets/CORPO_CIM/HOME_ASSET(10).png" alt="car!" className='w-32 h-auto sm:w-full md:w-full lg:w-32 xl:w-32' />
            </figure>
            <div className="card-body m-0">
                <h2 className="card-title text-white text-center border-b-2 border-yellow-500">Mobile Application for Easy Access</h2>
                <p className='text-gray-300'>
                    Catherinians can download the <strong>CIM mobile app</strong> to easily access the latest campus announcements and events, staying informed about everything the school has to offer.
                </p>
            </div>
        </div>

        <div className="card glass w-96 sm:w-[80vw] md:[80vw] lg:w-96 xl:w-96 p-3 sm:card-side md:card-side lg:card xl:card">
            <figure>
                <img src="/assets/CORPO_CIM/HOME_ASSET (7).png" alt="car!" className='w-20 h-auto sm:w-full md:w-full lg:w-32 xl:w-20' />
            </figure>
            <div className="card-body">
                <h2 className="card-title text-white text-center text-md border-b-2 border-yellow-500">Interactive Announcements for Enhanced User Engagement</h2>
                <p className='text-gray-300'>
                    Catherinians can enjoy a participative experience that captures their attention through simple games about certain events.
                </p>
            </div>
        </div>
    </div>
</div>

      

      <div className="w-full h-[10vh] bg-green-900 flex items-center justify-end px-3 gap-3"  >

        <div className="text-white text-md animate-fade-in" >
          <p>Created and powered by College of St. Catherine Quezon City</p>
        </div>

      <button className="btn btn-circle btn-outline">
         <a href="https://www.facebook.com/CollegeofStCatherine" target="_blank" rel="noopener noreferrer">
         <FontAwesomeIcon icon={faFacebook} className='text-yellow-500 text-lg' />
         </a>
      
      
      </button>

      <button className="btn btn-circle btn-outline">
      <a href="https://www.messenger.com/t/254530691580913?fbclid=IwY2xjawFbc_9leHRuA2FlbQIxMAABHZHk-iowlkmHed3RcJZJpr_O7pJPT9N7Oki6wefpy6urXGImbQKGfnvApQ_aem_U_zzNH0VYiOOCqqsgE2hgQ" target="_blank" rel="noopener noreferrer">
      <FontAwesomeIcon icon={faFacebookMessenger} className='text-yellow-500 text-lg '/>
      </a>
       
      </button>
      </div>

     

    </div>
  );
}
