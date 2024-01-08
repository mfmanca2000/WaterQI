import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import databaseService from '../appwrite/database'
import authService from '../appwrite/auth';
import Container from '../components/Container';
import { Link, useNavigate } from 'react-router-dom'
import HomeMenuItem from '../components/HomeMenuItem';

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
    });

    authService.getCurrentUser().then((user) => {
      if (user) {
        setUserData(user);
      }
    });
  }, []);


  const menuItems = [
    {
      title: 'Add a new group of measures',
      description: 'If you want to collect several measures for the same location, choose this option. You will be able to follow how the measures change through the years.',
      path: '/addMeasureGroup',
      image: 'multiple-measurements.png'
    },
    {
      title: "Add a new measure",
      description: 'If you want to collect just one measure at a specific location and you already know you will not need historical data for this location, choose this option.',
      path: '/addMeasure',
      image: 'measuring-cup.png'
    },
    // {
    //   title: "See all measure groups",
    //   description: 'See all the locations where people have collected multiple data through the years',
    //   path: '/measureGroups',
    //   image: 'eco.png'
    // },
    {
      title: "See all measures",
      description: 'See all measures collected through the years and look for a place near you to know the calculated Water Quality Index at a specific point in time',
      path: '/measures',
      image: 'map.png'
    }
  ]

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
            <br />
            <p>Data is provided as is and Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tenetur delectus similique quis magni ea blanditiis vitae, ratione magnam, odit doloremque sed quae deserunt hic iure optio facilis in quam placeat..</p>
            <br />
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus, id ipsa doloribus architecto, fugit nesciunt iste molestias vero blanditiis distinctio veritatis voluptate rem itaque et odit fuga minima magnam doloremque?</p>
            <br />
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. A non placeat quas dolores delectus consectetur. Necessitatibus dolor sint culpa asperiores assumenda nihil aperiam veniam, voluptatem delectus, modi soluta pariatur labore.</p>
          </div>
        </div>
      </div>
    )
  } else {


    return (
      <div className="flex flex-wrap text-lg justify-center">
        <div className="pt-10 pl-10"  >
          Welcome back <span className='font-extrabold'>{userData?.name}.<br /></span>
          <p>This is what you can do...</p>

          <Container>
            <div className='flex flex-wrap mt-4'>
              {menuItems.map((m) => (
                <div className='p-2 w-1/4' key={m.title}>
                  <HomeMenuItem menuItem={m} />
                </div>
              ))}
            </div>
          </Container>
        </div>

        <div className='text-gray-300 text-xs text-center w-full'>
          <a href="https://www.flaticon.com/free-icons/measuring-cup" title="measuring cup icons">Measuring cup icons created by DinosoftLabs</a>{' '}
          <a href="https://www.flaticon.com/free-icons/3" title="3 icons">3 icons created by Freepik</a>{' '}
          <a href="https://www.flaticon.com/free-icons/location" title="location icons">Location icons created by Freepik</a>{' '}
          <a href="https://www.flaticon.com/free-icons/history" title="history icons">History icons created by Freepik</a>{' '}
        </div>
      </div>
    )
  }
}

export default Home