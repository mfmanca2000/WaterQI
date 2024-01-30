import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database'
import authService from '../appwrite/auth';
import Container from '../components/Container';
import HomeMenuItem from '../components/HomeMenuItem';
import { useTranslation } from 'react-i18next'
import Counters from '../components/Counters';
import { useSelector } from 'react-redux';


function Home() {
  const [measures, setMeasures] = useState([]);
  //const [userData, setUserData] = useState(null);
  const userData = useSelector((state) => state.auth.userData);

  const { t, i18n } = useTranslation();
  // useEffect(() => {
  //   databaseService.getMeasuresInTimeInterval(new Date('1900-01-01T00:00:00.000Z'), new Date(Date.now())).then((measures) => {
  //     if (measures) {
  //       setMeasures(measures.documents);
  //     }
  //   })
  // }, []);

  useEffect(() => {

    if (userData) {
      databaseService.getAllMeasures().then((measures) => {
        if (measures) {
          setMeasures(measures.documents);
        }
      });
    }

    // authService.getCurrentUser().then((user) => {
    //   if (user) {
    //     setUserData(user);

    //     databaseService.getAllMeasures().then((measures) => {
    //       if (measures) {
    //         setMeasures(measures.documents);
    //       }
    //     });
    //   }
    // });
  }, []);


  const menuItems = [    
    {
      title: `${t('menuItemAllMeasuresTitle')}`,
      description: `${t('menuItemAllMeasuresDescription')}`,
      path: '/locations',
      image: '/map.png'
    },
    {
      title: `${t('menuItemAddMeasureTitle')}`,
      description: `${t('menuItemAddMeasureDescription')}`,
      path: '/addMeasure',
      image: '/measuring-cup.png'
    },
    {
      title: `${t('menuItemAddReportTitle')}`,
      description: `${t('menuItemAddReportDescription')}`,
      path: '/addReport',
      image: '/warningBig.png'
    },   
    {
      title: `${t('menuItemFindSensorTitle')}`,
      description: `${t('menuItemFindSensorDescription')}`,
      path: '',
      image: '/sensors.png'
    }
  ]

  //if (measures.length === 0) {
  if (!userData) {
    return (
      <div className='flex flex-wrap py-8 text-lg justify-center'>
        <div className='w-1/4'>
          <img src='cleanWaterGoal.png' alt="Water quality goal" />
          <img className='py-2 w-full' src='clean-water.jpg' alt="Water quality goal" />
        </div>

        <div className='w-1/2 px-10 ' >
          <div className='flex flex-wrap' dangerouslySetInnerHTML={
            { __html: t('homePageIntro', { interpolation: { escapeValue: false } }) }
          } />

        </div>
      </div >
    )
  } else {
    return (
      <>
        <div className='flex justify-center'>
          <Counters />
        </div>
        <div className="flex flex-wrap text-lg justify-center">
          <div className="pt-2 pl-10"  >
            {t('homeWelcome')} <span className='font-extrabold'>{userData?.name}.<br /></span>
            <p>{t('homeIntroText')}</p>

            <Container>
              <div className='flex flex-wrap mt-4'>
                {menuItems.map((m) => (
                  <div className='p-2 lg:w-1/4 sm:w-1/2' key={m.title}>
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
            <a href="https://www.flaticon.com/free-icons/alert" title="alert icons">Alert icons created by Freepik - Flaticon</a>
          </div>
        </div>
      </>
    )
  }
}

export default Home