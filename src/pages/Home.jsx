import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import databaseService from '../appwrite/database'
import authService from '../appwrite/auth';
import Container from '../components/Container';
import { Link, useNavigate } from 'react-router-dom'

function Home() {
  const [measures, setMeasures] = useState([]);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();


  // useEffect(() => {
  //   databaseService.getMeasuresInTimeInterval(new Date('1900-01-01T00:00:00.000Z'), new Date(Date.now())).then((measures) => {
  //     if (measures) {
  //       setMeasures(measures.documents);
  //     }
  //   })
  // }, []);

  useEffect(() => {
    databaseService.getAllMeasures().then((measures) => {
      if (measures) {
        setMeasures(measures.documents);
      }
    })
  }, []);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) {
        setUserData(user);
      }
    })
  }, []);


  console.log('Measures : ' + measures.length)

  if (measures.length === 0) {
    return (
      <div className='flex flex-wrap py-8 text-lg justify-center'>
        <div className='w-1/4'>
          <img src='cleanWaterGoal.png' alt="Water quality goal" />
          <img className='py-2 w-full' src='clean-water.jpg' alt="Water quality goal" />
        </div>

        <div className='w-1/2 px-10 ' >
          <div className='flex flex-wrap'>
            <p>This service permits to show all the water quality measures collected by the community.</p>
            <h1>Login to see all the measures or sign up to create an account and start collecting water quality measures.</h1>
            <br/>
            <p>Data is provided as is and Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tenetur delectus similique quis magni ea blanditiis vitae, ratione magnam, odit doloremque sed quae deserunt hic iure optio facilis in quam placeat..</p>
            <br/>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus, id ipsa doloribus architecto, fugit nesciunt iste molestias vero blanditiis distinctio veritatis voluptate rem itaque et odit fuga minima magnam doloremque?</p>
            <br/>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A non placeat quas dolores delectus consectetur. Necessitatibus dolor sint culpa asperiores assumenda nihil aperiam veniam, voluptatem delectus, modi soluta pariatur labore.</p>
          </div>
        </div>        
      </div>
    )
  } else {


    return (
      <div className='flex flex-wrap text-lg justify-center'>

       

        <div className='pt-10 pl-10' >
          Welcome back <span className='font-extrabold'>{userData?.name}.<br /></span>
          <p>This is what you can do...</p>
          <ul>
            <li>
              <button onClick={() => navigate('/addMeasure')} className='inline-block ml-0 mt-8 px-6 py-2 duration-200 bg-casaleggio-rgba hover:bg-casaleggio-btn-rgba rounded-full'>
                Add a measure
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/measures")} className='inline-block ml-0 mt-8 px-6 py-2 duration-200 bg-casaleggio-rgba hover:bg-casaleggio-btn-rgba rounded-full'>
                See all measures
              </button>
            </li>
          </ul>
        </div>
        <div className='w-full'>
          <img className='w-full' src='water.avif' alt="drop" />
        </div>

      </div>
    )
  }
}

export default Home