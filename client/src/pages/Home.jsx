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
import { faFacebook, faFacebookMessenger, } from '@fortawesome/free-brands-svg-icons';


import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Slider from "react-slick";

export default function Home() {
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [hoveredAnnouncement, setHoveredAnnouncement] = useState(null);

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

  const handleMouseEnter = (id) => {
    setHoveredAnnouncement(id);
  };

  const handleMouseLeave = () => {
    setHoveredAnnouncement(null);
  };

  

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,             // Enable auto-slide
    autoplaySpeed: 5000,        // Set slide interval to 5 seconds (5000 ms)

   
    


    
    responsive: [
      {
        breakpoint: 1024, // For tablets and small laptops
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600, // For most mobile devices
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480, // For small mobile screens
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  

  

  return (
    <div className=" w-full flex flex-wrap overflow-x-hidden overflow-y-hidden ">
      {/* Navbar */}
      <Navbar />

         



          {/* Hero Section */}
          <div className="hero-section bg-[url('/assets/CORPO_CIM/HOME_PLAIN.gif')] bg-cover bg-no-repeat bg-center w-full h-[100vh] flex justify-center items-center text-center relative  ">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
        <div className="hero-content z-10 flex"   >
          <h1 className="text-white font-bold text-5xl md:text-6xl mb-6  " data-aos="fade-right" >Stay Connected with Campus Life</h1>
          <p className="text-white font-medium text-xl md:text-2xl text-left" data-aos="fade-left">Discover the latest announcements and events around campus with</p>
        </div>
      </div>

      <div className=" bg-[url('/assets/home_image.jpg')] bg-cover bg-no-repeat bg-center w-full max-h-[90vh] flex justify-center items-center text-center relative p-4 flex-col">
      
      <div className="absolute inset-0 bg-black opacity-95"></div>
      <div className="flex flex-col justify-start my-4 text-left">
      <h1 className="text-white font-bold text-5xl border-b-2 border-white" data-aos="fade-right" >IN THE NEWS</h1>
     
      </div>

      
      <p className="text-white font-medium text-xl md:text-2xl" data-aos="fade-left">Latest school Announcements</p>
       
       {/* Announcements Slider */}
       <div className="flex w-[95vw] h-[95vh] flex-col ">
       
        {Array.isArray(recentAnnouncements) && recentAnnouncements.length > 0 ? (
          <Slider {...sliderSettings} className="max-w-[95vw]">
            {recentAnnouncements.slice(0, 5).map((announcement) => (
              <div
                key={announcement._id}
                className="w-full h-full border-b border-t  p-3"
              >
                {/* Media Section */}
                {announcement.mediaUrl ? (
                  <div
                    className="lg:w-full flex items-center justify-center relative flex-wrap"
                    onMouseEnter={() => handleMouseEnter(announcement._id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {announcement.contentType && announcement.contentType.startsWith('image') ? (
                      <div className="relative">
                        <img
                          src={announcement.mediaUrl}
                          alt="Announcement Media"
                          className="w-auto h-[50vh] object-cover transform transition-transform duration-300 ease-in-out hover:scale-105"
                        />
                        {/* Announcement header with smooth transition */}
                        <div
                          className={` w-full absolute bottom-0 left-0 pt-2 p-4  items-center text-center bg-black opacity-80 rounded-md transform transition-all duration-500 ${
                            hoveredAnnouncement === announcement._id
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-5'
                          }`}
                        >
                          <h4 className="font-semibold text-lg mb-2 text-white border-b-2 border-yellow-500">
                            {announcement.header}
                          </h4>
                        </div>
                      </div>
                    ) : announcement.contentType && announcement.contentType.startsWith('video') ? (
                      <>
                        <video controls className="w-auto h-[50vh] object-cover rounded-lg">
                          <source src={announcement.mediaUrl} type={announcement.contentType} />
                        </video>
                       {/* Announcement header with smooth transition */}
                       <div
                          className={` w-full absolute bottom-0 left-0 pt-2 p-4  items-center text-center bg-black opacity-80 rounded-md transform transition-all duration-500 ${
                            hoveredAnnouncement === announcement._id
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-5'
                          }`}
                        >
                          <h4 className="font-semibold text-lg mb-2 text-white border-b-2 border-yellow-500">
                            {announcement.header}
                          </h4>
                        </div>
                      </>
                    ) : announcement.contentType && announcement.contentType.startsWith('audio') ? (
                      <audio controls className="w-full h-auto">
                        <source src={announcement.mediaUrl} type={announcement.contentType} />
                      </audio>
                    ) : (
                      <div className="text-center border border-gray-200 p-6 rounded-lg">
                        <p>No media available</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center items-center border border-gray-200 p-6 rounded-lg">
                    <p>No media available</p>
                  </div>
                )}
              </div>
            ))}
            </Slider>
            

            
            ) : (
            <p className="text-gray-500 text-center">No recent announcements available.</p>
            )}
            </div>



     



      </div>

        {/* App Hero Section*/ }
      <div className="hero-section bg-[url('/assets/CORPO_CIM/HOME-APP-SECTION.jpg')] bg-cover bg-no-repeat bg-center w-full h-[95vh]">
      

       <div className="flex flex-row ">
          <div className="hero-content relative z-10 md:items-center md:justify-center ">
                 {/* Top Image (Visible on smaller screens) */}
              <div className="absolute inset-0 justify-center hidden sm:block md:block lg:block xl:block">
                <img
                  src="/assets/CORPO_CIM/HOME-APP-ASSET (5).png"
                  alt="car!"
                  className="w-[50vw] h-full opacity-90"
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

    <div className="flex flex-col sm:flex-col md:flex-col lg:flex-col xl:flex-row gap-4" data-aos="fade-up">

        <div className="card glass w-96 sm:w-[80vw] md:w-[80vw] lg:w-[80vw] xl:w-96 p-3 sm:card-side md:card-side lg:card-side xl:card">
            <figure className=''>
                <img src="/assets/CORPO_CIM/HOME_ASSET (1).png" alt="car!" className='w-32 h-auto sm:w-full md:w-full lg:w-full xl:w-32 ' />
            </figure>
            <div className="card-body">
                <h2 className="card-title text-white text-center border-b-2 border-yellow-500">Unified Campus Media platform for Announcements and Events</h2>
                <p className='text-gray-300'>
                    A centralized, regulated platform providing real-time updates to keep everyone informed and engaged with campus events.
                </p>
            </div>
        </div>

        <div className="card glass w-96 sm:w-[80vw] md:[80vw] lg:w-[80vw] xl:w-96 p-3 sm:card-side md:card-side lg:card-side xl:card">
            <figure>
                <img src="/assets/CORPO_CIM/HOME_ASSET(10).png" alt="car!" className='w-32 h-auto sm:w-full md:w-full lg:w-full xl:w-32' />
            </figure>
            <div className="card-body m-0">
                <h2 className="card-title text-white text-center border-b-2 border-yellow-500">Mobile Application for Easy Access</h2>
                <p className='text-gray-300'>
                    Catherinians can download the <strong>CIM mobile app</strong> to easily access the latest campus announcements and events, staying informed about everything the school has to offer.
                </p>
            </div>
        </div>

        <div className="card glass w-96 sm:w-[80vw] md:[80vw] lg:w-[80vw] xl:w-96 p-3 sm:card-side md:card-side lg:card-side xl:card">
            <figure>
                <img src="/assets/CORPO_CIM/HOME_ASSET (7).png" alt="car!" className='w-20 h-auto sm:w-full md:w-full lg:w-full xl:w-20' />
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
