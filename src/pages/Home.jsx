import React, { useEffect, useRef, useState } from 'react'
import databaseService from '../appwrite/database'
import authService from '../appwrite/auth';
import Container from '../components/Container';
import HomeMenuItem from '../components/HomeMenuItem';
import { useTranslation } from 'react-i18next'
import Counters from '../components/Counters';
import { useSelector } from 'react-redux';
import { Carousel, Label, Tooltip } from 'flowbite-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { conf } from '../conf/conf';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { divIcon, Icon, point } from 'leaflet';
import { calculateWQILocation, getLocationIcon } from '../utils/wqi';
import { Link } from 'react-router-dom';
import MeasureChart from '../components/MeasureChart';
import { formatDateTime } from '../utils/date';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function Home() {

  const userData = useSelector((state) => state.auth.userData);
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation();

  const locations = useRef([]);
  const reports = useRef([]);

  const warningIcon = new Icon({
    // iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
    iconUrl: window.location.origin + '/warning.png',
    iconSize: [36, 31] // size of the icon
  });

  const createClusterCustomIcon = function (cluster) {
    return new divIcon({
      html: `<span style="background-color: #56c6eb;height: 2em;width: 2em;color: #fff;display: flex;align-items: center;justify-content: center;border-radius: 50%;font-size: 1.2rem;box-shadow: 0 0 0px 5px #fff;">${cluster.getChildCount()}</span>`,
      className: "custom-marker-cluster",
      iconSize: point(33, 33, true)
    });
  };

  useEffect(() => {

    setIsLoading(true)

    databaseService.getAllLocations(null, '', 100000)
      .then((returnedLocations) => {

        if (returnedLocations) {
          locations.current = returnedLocations.documents;
        }

        databaseService.getAllReports(null, '', 100000)
          .then((returnedReports) => {
            if (returnedReports) {
              reports.current = returnedReports.documents;              
              setIsLoading(false)    
            }
          })

      })      
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


      <div className="relative bg-gradient-to-r from-casaleggio-rgba to-blue-600 h-screen text-white overflow-hidden">

        <div className="absolute inset-0">
          <img alt='Fiume' src="./fiume.jpg" className="object-cover object-center w-full h-full" />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <MapContainer className='h-[30vh] lg:h-[50vh] lg:m-24' center={[defaultLatitude, defaultLongitude]} zoom={conf.defaultZoomLevel}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false}>

            {/* {console.log('Filter:' + JSON.stringify(filteredLocations.current))} */}

            {locations?.current.map((l) => {                      
              return (

                <Marker key={l.$id} position={[l.latitude, l.longitude]} icon={getLocationIcon(l)} eventHandlers={{
                  click: async (e) => {
                    setSelectedLocation(await databaseService.getLocation(l.$id))
                  },
                }}>
                  (<Popup>
                    <div className='w-[300px]'>
                      <div className='w-full bg-casaleggio-rgba p-2 text-3xl font-bold'>
                        <Label className='font-bold text-xl text-white'>{selectedLocation?.name}</Label>
                      </div>
                      <div className='w-full text-md text-right font-bold'>
                        {selectedLocation?.measures?.length + ' ' + ((selectedLocation?.measures?.length == 0 || selectedLocation?.measures?.length > 1) ? t('measuresLabel') : t('measureLabel'))}
                      </div>
                      <div>
                        <MeasureChart height={200} values={selectedLocation?.measures?.sort(function (a, b) {
                          return new Date(a.datetime) - new Date(b.datetime);
                        })} />
                      </div>
                    </div>
                  </Popup>)
                  {/* <Tooltip>{t(calculateWQILocation(l)[1])}</Tooltip> */}
                </Marker>
              )
            })}

            {reports?.current.map((r) => {
              return (
                <Marker key={'r_' + r.$id} position={[r.latitude, r.longitude]} icon={warningIcon}>
                  <Popup>
                    <div className='w-[300px]'>
                      <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
                        <Link className='underline font-bold' to={`/report/${r.$id}`}>{r.title}</Link>
                      </div>
                      <div className='w-full text-md text-right font-bold '>
                        {formatDateTime(new Date(r.datetime))}
                      </div>
                      <div>
                        <p className='my-2 text-wrap text-justify' >{r.description}</p>
                      </div>
                      <div className='w-48 mx-auto'>
                        <img src={storageService.getPreviewImageUrl(r.imageId)} alt={r.title} className='rounded-lg w-48 object-fill' />
                      </div>
                    </div>
                  </Popup>
                  <Tooltip>{r.title}</Tooltip>
                </Marker>
              )
            })}
          </MarkerClusterGroup>
        </MapContainer>



        <div className="relative z-10 flex flex-col justify-center items-center text-xs h-1/2 lg:h-1/3 text-center lg:text-3xl lg:mt-8">
          <Carousel className='w-2/3' slideInterval={10000} indicators={true} pauseOnHover leftControl="&nbsp;" rightControl="&nbsp;">
            <span className='whitespace-pre-line'>{t('homePageFirstParagraph')}</span>
            <span className='whitespace-pre-line'>{t('homePageSecondParagraph')}</span>
            <span className='whitespace-pre-line'>{t('homePageThirdParagraph')}</span>
            <span className='whitespace-pre-line'>{t('homePageFourthParagraph')}</span>
            <span className='whitespace-pre-line'>{t('homePageFifthParagraph')}</span>
          </Carousel>

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



          <Container>
            {t('homeWelcome')} <span className='font-extrabold'>{userData?.name}.<br /></span>
            <p>{t('homeIntroText')}</p>

            <div className='flex flex-wrap'>
              {menuItems.map((m) => (
                <div className='px-2 mt-4 lg:w-1/4 sm:w-1/2' key={m.title}>
                  <HomeMenuItem menuItem={m} />
                </div>
              ))}
            </div>
          </Container>


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