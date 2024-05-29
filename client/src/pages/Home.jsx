import React from 'react'
import Navbar from '../components/Navbar'
import './Home.css'
import { Carousel } from 'react-responsive-carousel';
export default function Home() {
  // Add event listener to enable scrolling when component unmounts

  
   
  return (
    < >
    <Navbar/>
    <div className="bg-[url('../src/assets/Cover_gif.gif')] flex justify-center absolute top-0 left-0 bg-cover bg-center w-full h-full">
        <div className=' my-36  w-1/2 h-80 p-2 absolute left-28'>


          <h2 className=' p-2 text-yellow-500 font-semibold font-serif text-3xl shadow-inner animate-text-reveal text-left'>
            Stay informed and connected <br/>with the latest news and <br/>
            happenings around the campus with
        </h2>
          </div>
     </div>   
    


      

     

      


     
       

     
       
    
    </>
  )
}
