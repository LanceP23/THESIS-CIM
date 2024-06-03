import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartBar } from '@fortawesome/free-solid-svg-icons'
import { BarChart } from '@mui/x-charts/BarChart';



const chartSetting = {
    xAxis: [
      {
        label: 'rainfall (mm)',
      },
    ],
    width: 500,
    height: 400,
  };
  const dataset = [
    {
      london: 59,
      paris: 57,
      newYork: 86,
      seoul: 21,
      month: 'Jan',
    },
    {
      london: 50,
      paris: 52,
      newYork: 78,
      seoul: 28,
      month: 'Fev',
    },
    {
      london: 47,
      paris: 53,
      newYork: 106,
      seoul: 41,
      month: 'Mar',
    },
    {
      london: 54,
      paris: 56,
      newYork: 92,
      seoul: 73,
      month: 'Apr',
    },
    {
      london: 57,
      paris: 69,
      newYork: 92,
      seoul: 99,
      month: 'May',
    },
    {
      london: 60,
      paris: 63,
      newYork: 103,
      seoul: 144,
      month: 'June',
    },
    {
      london: 59,
      paris: 60,
      newYork: 105,
      seoul: 319,
      month: 'July',
    },
    {
      london: 65,
      paris: 60,
      newYork: 106,
      seoul: 249,
      month: 'Aug',
    },
    {
      london: 51,
      paris: 51,
      newYork: 95,
      seoul: 131,
      month: 'Sept',
    },
    {
      london: 60,
      paris: 65,
      newYork: 97,
      seoul: 55,
      month: 'Oct',
    },
    {
      london: 67,
      paris: 64,
      newYork: 76,
      seoul: 48,
      month: 'Nov',
    },
    {
      london: 61,
      paris: 70,
      newYork: 103,
      seoul: 25,
      month: 'Dec',
    },
  ];
  
  const valueFormatter = (value) => `${value}mm`;
  



const Analytics_report = () => {
  return (

    
    <div className='flex flex-row  my-5 w-full h-full animate-fade-in '>

        <div className="bg-slate-100 p-3  rounded-2xl shadow-inner shadow-slate-950 w-full h-auto mx-2">
            <h2 className='text-2xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faChartBar} className=' text-yellow-500 mx-1'/>Analytics</h2>

            <div className="flex flex-col justify-between">

            <h2 className='text-2xl text-green-800 pt-5'>Top Post </h2>

                

            <LineChart
      xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
      series={[
        {
          data: [2, 5.5, 2, 8.5, 1.5, 5],
          area: true,
        },
      ]}
      width={500}
      height={300}
    />
           
           
           
            </div>

        </div>

        <div className=" flex flex-col justify-between">

            <div className=" flex flex-row">

                <div className=" bg-slate-100 p-3  rounded-2xl shadow-inner shadow-slate-950 w-full h-auto mx-2">
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
                <div className=" bg-slate-100 p-3  rounded-2xl shadow-inner shadow-slate-950 w-full h-auto mx-2">
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
            <div className=" flex flex-col bg-slate-100 p-3 mt-3 ml-1 rounded-2xl shadow-inner shadow-slate-950 h-full">
            <h2 className='text-3xl text-green-800 border-b-2 border-yellow-500 py-2'>  <FontAwesomeIcon icon={faChartBar} className=' text-yellow-500 mx-1'/>Minigames</h2>
            <div className="stats shadow">
  
                <div className="stat place-items-center">
                    <div className="stat-title">Players</div>
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

                
        <div className="div">
                        <BarChart
            dataset={dataset}
            yAxis={[{ scaleType: 'band', dataKey: 'month' }]}
            series={[{ dataKey: 'seoul', label: 'Seoul rainfall', valueFormatter }]}
            layout="horizontal"
            {...chartSetting}
            />
       </div>
            </div>

        </div>
    </div>
  )
}

export default Analytics_report