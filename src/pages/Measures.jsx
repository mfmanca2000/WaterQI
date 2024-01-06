import React from 'react'
import conf from "../conf/conf.js";
import { useEffect, useRef, useState } from 'react';
import databaseService from '../appwrite/database'
import Container from '../components/Container';
import MeasureCard from '../components/MeasureCard';
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import MarkerWithInfowindow from '../components/MarkerWithInfowindow';
import { useSelector } from "react-redux";
import Input from '../components/Input.jsx';

const defaultLatitude = 45.3820004786078;
const defaultLongitude = 7.852158015084898;


function Measures() {
  //const [measures, setMeasures] = useState([]);
  const measures = useRef([]);
  const [onlyUserMeasures, setOnlyUserMeasures] = useState(false);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [measureNumber, setMeasureNumber] = useState();
  const [searchText, setSearchText] = useState();
  const userData = useSelector((state) => state.auth.userData);

  

  // useEffect(() => {
  //   databaseService.getMeasuresInTimeInterval(new Date('1900-01-01T00:00:00.000Z'), new Date(Date.now())).then((measures) => {
  //     if (measures) {
  //       setMeasures(measures.documents);
  //     }
  //   })
  // }, []);

  useEffect(() => {
    databaseService.getAllMeasures().then((returnedMeasures) => {
      
      const currentUserId = userData.$id;

      if (returnedMeasures) {
        const filtered = returnedMeasures.documents.filter((m) => {
          var dt = new Date(m.datetime).getTime();
          //console.log(m.placeDescription + ': ' + m.datetime + ' -- DateFrom:' + dateFrom + ' --> ' + ((!onlyUserMeasures || m.userId === currentUserId) && (!dateFrom || new Date(m.datetime).getTime > new Date(dateFrom))))         
          return (!onlyUserMeasures || m.userId === currentUserId) &&
            (!dateFrom || dt >= new Date(dateFrom).getTime()) &&
            (!dateTo || dt <= new Date(dateTo).getTime()) &&
            (!searchText || m.placeDescription.toLowerCase().includes(searchText.toLowerCase()));
        });

        //setMeasures(returnedMeasures.documents);
        measures.current = filtered;
        setMeasureNumber(filtered.length);
        console.log('Passing by Measures.useEffect...' + measureNumber)
      }
    })


    // databaseService.getAllMeasures().then((returnedMeasures) => {
    //   if (returnedMeasures) {
        
    //     //setMeasures(measures.documents);
    //     measures.current = returnedMeasures.documents;
    //     setMeasureNumber(returnedMeasures.documents.length);
    //     console.log('Passing by Measures.useEffect...' + measures.current)
    //   }
    // })

  }, [onlyUserMeasures, userData, dateFrom, dateTo, measures, searchText, measureNumber]);


  return (
    <div className='w-full py-8'>

      <Container>

        <div className='flex'>
          <div className='felx w-1/2'>
            <input type="checkbox" id='onlyYourMeasures' label="Only your measures" className="mb-4 mr-4" onChange={(e) => {              
              setOnlyUserMeasures((prev) => !prev)
            }}
            />
            <label className="mb-4 mr-4" htmlFor='onlyYourMeasures'>Only your measures</label>
          </div>



          <div className='w-1/2 text-right'>
            <label className="mb-4 mr-4 font-extrabold">Results {measureNumber}</label>
          </div>
        </div>

        <div className='flex'>
          <div className='flex w-2/3'>
            <Input className="m-4 w-1/2" label="From" type="datetime-local" onChange={(e) => {              
              setDateFrom(e.target.value);
            }} />
            <Input className="m-4 w-1/2" label="To" type="datetime-local" onChange={(e) => {              
              setDateTo(e.target.value);
            }} />
          </div>

          <div className='flex w-1/3'>
            <Input className="m-4 w-1/2" label="Search" onChange={(e) => {              
              setSearchText(e.target.value);
            }} />
          </div>
        </div>
      </Container>

      <Container>
        <APIProvider apiKey={conf.googleMapsAPIKey}>
          <Map className='h-96'
            mapId={'bf51a910020fa25a'}
            zoom={8}
            center={{ lat: defaultLatitude, lng: defaultLongitude }}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
          >
            {measures.current?.map((measure) => (
              <div className='p-2 w-1/4' key={measure.$id}>
                <MarkerWithInfowindow measure={measure} clickable={true} />
              </div>
            ))}
          </Map>
        </APIProvider>
      </Container>


      <Container>
        <div className='flex flex-wrap'>
          {measures.current?.map((measure) => (
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