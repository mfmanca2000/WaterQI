import React from 'react'
import conf from "../conf/conf.js";
import { useEffect } from 'react';
import { useState } from 'react'
import databaseService from '../appwrite/database'
import Container from '../components/Container';
import MeasureCard from '../components/MeasureCard';
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import MarkerWithInfowindow from '../components/MarkerWithInfoWindow.jsx';

const defaultLatitude = 45.3820004786078;
const defaultLongitude = 7.852158015084898;


function Measures() {
  const [measures, setMeasures] = useState([]);
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

  return (
    <div className='w-full py-8'>

      <Container>
        <APIProvider apiKey={conf.googleMapsAPIKey}>
          <Map className='h-96'
            mapId={'bf51a910020fa25a'}
            zoom={8}
            center={{ lat: defaultLatitude, lng: defaultLongitude }}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
          >
            {measures.map((measure) => (
              <div className='p-2 w-1/4' key={measure.$id}>
                <MarkerWithInfowindow measure={measure} clickable={true} />
              </div>
            ))}
          </Map>
        </APIProvider>
      </Container>


      <Container>
        <div className='flex flex-wrap'>
          {measures.map((measure) => (
            <div className='p-2 w-1/4' key={measure.$id}>
              <MeasureCard {...measure} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Measures