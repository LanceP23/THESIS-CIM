import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import './Home.css'
import { Carousel } from 'react-responsive-carousel';
export default function Home() {
  // Add event listener to enable scrolling when component unmounts

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

  
   
  return (
    <div >
    <Navbar/>
    <div className="bg-[url('../src/assets/CORPO_CIM/gradeint_cover.gif')] flex justify-center absolute top-0 left-0 bg-cover bg-center w-full h-full">
        <div className=' my-36  w-1/2 h-80 p-2 absolute left-16 bottom-28'>


          <h2 className=' p-2 text-white font-semibold font-serif text-3xl shadow-inner animate-text-reveal text-left'>
            Stay informed and connected <br/>with the latest news and 
            happenings <br/> around the campus with
        </h2>

     
       
       
          </div>
         

     </div>   
    


      


      


     
     <footer className='  w-full  position-fixed top left-0 right-0 bottom-0 h'>
        <h2 className=' p-2 text-white font-semibold font-serif text-sm shadow-inner animate-text-reveal text-center'>
           Powered By St. Catherine Quezon City
        </h2>

         </footer>

     
       
    
    </div>
  )
}
