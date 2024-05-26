import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'

const Analytics_report = () => {
  return (
    <div className='flex flex-row  my-5 w-full h-full animate-fade-in '>
        
        <div className="bg-slate-100 p-3  rounded-3xl shadow-inner shadow-slate-950 w-full h-auto mx-2">
            <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faChartBar} className=' text-yellow-500 mx-1'/>Analytics</h2>

            <div className="flex flex-col justify-between">

                
                    <div className="container flex flex-row w-auto h-auto">
                        <div className=" p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                            <div className="flex flex-col gap-4 w-52">
                                <div className="flex gap-4 items-center">
                                    <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                                        <div className="flex flex-col gap-4">
                                        <div className="skeleton h-4 w-20"></div>
                                        <div className="skeleton h-4 w-28"></div>
                                    </div>
                                </div>
                                <div className="skeleton h-32 w-full"></div>
                            </div>
                        </div>
                        
                        <div className=" p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                            <div className="flex flex-col gap-4 w-52">
                                <div className="flex gap-4 items-center">
                                    <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                                        <div className="flex flex-col gap-4">
                                        <div className="skeleton h-4 w-20"></div>
                                        <div className="skeleton h-4 w-28"></div>
                                    </div>
                                </div>
                                <div className="skeleton h-32 w-full"></div>
                            </div>
                        </div>
                    </div>


                    <div className="container flex flex-row w-auto h-auto">
                        <div className=" p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                            <div className="flex flex-col gap-4 w-52">
                                <div className="flex gap-4 items-center">
                                    <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                                        <div className="flex flex-col gap-4">
                                        <div className="skeleton h-4 w-20"></div>
                                        <div className="skeleton h-4 w-28"></div>
                                    </div>
                                </div>
                                <div className="skeleton h-32 w-full"></div>
                            </div>
                        </div>
                        
                        <div className=" p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-full  shadow-md rounded-2 border">
                            <div className="flex flex-col gap-4 w-52">
                                <div className="flex gap-4 items-center">
                                    <div className="skeleton w-16 h-16 rounded-full shrink-0"></div>
                                        <div className="flex flex-col gap-4">
                                        <div className="skeleton h-4 w-20"></div>
                                        <div className="skeleton h-4 w-28"></div>
                                    </div>
                                </div>
                                <div className="skeleton h-32 w-full"></div>
                            </div>
                        </div>
                    </div>
            </div>

        </div>

        <div className=" flex flex-col justify-between">

            <div className=" flex flex-row">

                <div className=" bg-slate-100 p-3  rounded-3xl shadow-inner shadow-slate-950 w-full h-auto mx-2">
                <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faChartBar} className=' text-yellow-500 mx-1'/>Reactions</h2>

                <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-auto  shadow-md rounded-2 border">
         
                    <div className="stat">
                        <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current text-success"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </div>
                        <div className="stat-title">Total Likes</div>
                        <div className="stat-value text-primary text-success">25.6K</div>
                        <div className="stat-desc">21% more than last month</div>
                    </div>
                    </div>


                </div>
                <div className=" bg-slate-100 p-3  rounded-3xl shadow-inner shadow-slate-950 w-full h-auto mx-2">
                <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faChartBar} className=' text-yellow-500 mx-1'/>Views</h2>
                <div className="p-2 my-2 md:p-5 lg:p-10 md:m-2 lg:m-5 max-w-full lg:w-auto h-auto shadow-md rounded-2 border">
                   

                    
  
                        <div className="stat">
                            <div className="stat-title">Total Page Views</div>
                            <div className="stat-value">89,400</div>
                            <div className="stat-desc">21% more than last month</div>
                        </div>
                        
                        </div>
                </div>

            </div>
            <div className="bg-slate-100 p-3 mt-3 ml-1 rounded-3xl shadow-inner shadow-slate-950 h-full">
            <h2 className='text-3xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faChartBar} className=' text-yellow-500 mx-1'/>Minigames</h2>
            <div className="stats shadow">
  
                <div className="stat place-items-center">
                    <div className="stat-title">Downloads</div>
                    <div className="stat-value">31K</div>
                    <div className="stat-desc">From January 1st to February 1st</div>
                </div>
                
                <div className="stat place-items-center">
                    <div className="stat-title">Users</div>
                    <div className="stat-value text-secondary">4,200</div>
                    <div className="stat-desc text-secondary">↗︎ 40 (2%)</div>
                </div>
                
                <div className="stat place-items-center">
                    <div className="stat-title">New Registers</div>
                    <div className="stat-value">1,200</div>
                    <div className="stat-desc">↘︎ 90 (14%)</div>
                </div>
                
                </div>
            </div>

        </div>
    </div>
  )
}

export default Analytics_report