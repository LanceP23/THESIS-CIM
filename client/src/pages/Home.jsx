import React from 'react'
import Navbar from '../components/Navbar'
import './Home.css'

export default function Home() {
  // Add event listener to enable scrolling when component unmounts

  
   
  return (
    < >
    <div className="background_image_container">
        <Navbar/>

        <div className="carousel w-full">
  <div id="wow" className="carousel-item w-full">
    <img src="../src/assets/398569058_739544134860223_1719844830869562449_n.jpg" className="w-full" />
  </div> 
 

  
</div> 
<div className="flex justify-center w-full py-2 gap-2">
  <a href="#wow" className="btn btn-xs">1</a> 
  <a href="#bow" className="btn btn-xs">2</a> 
  <a href="#tow" className="btn btn-xs">3</a> 

</div>

     
       

     
       </div>
    
    </>
  )
}
