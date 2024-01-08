import React from 'react'
import conf from "../conf/conf.js";
import { useEffect, useRef, useState } from 'react';
import databaseService from '../appwrite/database'
import Container from '../components/Container';
import MeasureCard from '../components/MeasureCard';
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import MeasureMarker from '../components/MeasureMarker';
import { useSelector } from "react-redux";
import Input from '../components/Input.jsx';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;


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
      console.log('Passing by useEffect');
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
        //console.log('Passing by Measures.useEffect...' + measureNumber)
      }
    })
    

  }, [onlyUserMeasures, userData, dateFrom, dateTo, measures, searchText, measureNumber]);

  const onDelete = (e, $id) => {
    e.preventDefault();
    console.log('HERE');

    databaseService.deleteMeasure($id);
    setMeasureNumber(measureNumber-1)
  }

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
          <div className='flex w-1/3 m-2'>
            <Input className="w-1/2" label="From" type="datetime-local" onChange={(e) => {
              setDateFrom(e.target.value);
            }} />
          </div>

          <div className='flex w-1/3 m-2'>
            <Input className="w-1/2" label="To" type="datetime-local" onChange={(e) => {
              setDateTo(e.target.value);
            }} />
          </div>


          <div className='flex w-1/3 m-2'>
            <Input className="w-1/2" label="Search" onChange={(e) => {
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
                <MeasureMarker measure={measure} clickable={true} />
              </div>
            ))}
          </Map>
        </APIProvider>
      </Container>


      <Container>
        <div className='flex flex-wrap mt-4'>
          {measures.current?.map((measure) => (
            <div className='p-2 w-1/4' key={measure.$id}>
              <MeasureCard measure={measure} onDelete={onDelete}/>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Measures