import React from 'react'
import conf from "../conf/conf.js"
import { useEffect, useRef, useState } from 'react'
import databaseService from '../appwrite/database'
import Container from '../components/Container'
import MeasureCard from '../components/MeasureCard'
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps'
import MeasureMarker from '../components/MeasureMarker'
import MeasureGroupMarker from '../components/MeasureGroupMarker'
import { useSelector } from "react-redux"
import Input from '../components/Input.jsx'
import MeasureGroupCard from '../components/MeasureGroupCard.jsx'

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;


function Measures() {
  //const [measures, setMeasures] = useState([]);
  const standaloneMeasures = useRef([]);
  const measureGroups = useRef([]);
  const [onlyUserData, setOnlyUserData] = useState(false);
  const [showMeasures, setShowMeasures] = useState(true);
  const [showMeasuresGroups, setShowMeasuresGroups] = useState(true);
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
    console.log('Passing by');
    databaseService.getAllMeasures().then((returnedMeasures) => {
      //console.log('Passing by useEffect');
      const currentUserId = userData.$id;

      if (returnedMeasures) {
        const filtered = returnedMeasures.documents.filter((m) => {
          var dt = new Date(m.datetime).getTime();
          //console.log(m.placeDescription + ': ' + m.datetime + ' -- DateFrom:' + dateFrom + ' --> ' + ((!onlyUserMeasures || m.userId === currentUserId) && (!dateFrom || new Date(m.datetime).getTime > new Date(dateFrom))))   

          return showMeasures &&
            (!m.measureGroup) &&
            (!onlyUserData || m.userId === currentUserId) &&
            (!dateFrom || dt >= new Date(dateFrom).getTime()) &&
            (!dateTo || dt <= new Date(dateTo).getTime()) &&
            (!searchText || m.placeDescription.toLowerCase().includes(searchText.toLowerCase()));
        });

        //setMeasures(returnedMeasures.documents);
        standaloneMeasures.current = filtered;

        databaseService.getAllMeasureGroups().then((returnedMeasureGroups) => {
          const measureGroupsFiltered = returnedMeasureGroups.documents.filter((mg) => {
            return showMeasuresGroups &&
              (!onlyUserData || mg.userId === currentUserId) &&
              (!searchText || mg.gescription.toLowerCase().includes(searchText.toLowerCase()));
          });

          measureGroups.current = measureGroupsFiltered;

          setMeasureNumber(filtered.length + measureGroupsFiltered.length);
        });




        //console.log('Passing by Measures.useEffect...' + measureNumber)
      }
    })


  }, [onlyUserData, userData, dateFrom, dateTo, standaloneMeasures, searchText, measureNumber, showMeasures, showMeasuresGroups]);

  const onDelete = (e, $id) => {
    e.preventDefault();
    console.log('HERE');

    databaseService.deleteMeasure($id);
    setMeasureNumber(measureNumber - 1)
  }

  return (
    <div className='w-full py-8'>

      <Container>

        <div className='flex'>
          <div className='flex w-full'>
            <input type="checkbox" checked={onlyUserData} id='onlyYourMeasures' label="Show your data only" className="mb-4 mr-4" onChange={(e) => {
              setOnlyUserData((prev) => !prev)
            }} />
            <label className="mb-4 mr-4" htmlFor='onlyYourMeasures'>Show your data only</label>

            <input type="checkbox" checked={showMeasures} id='showMeasures' label="Show standalone measures" className="mb-4 mr-4" onChange={(e) => {
              setShowMeasures((prev) => !prev)
            }} />
            <label className="mb-4 mr-4" htmlFor='showMeasures'>Show standalone measures</label>

            <input type="checkbox" checked={showMeasuresGroups} id='showMeasureGroups' label="Show measure groups" className="mb-4 mr-4" onChange={(e) => {
              setShowMeasuresGroups((prev) => !prev)
            }} />
            <label className="mb-4 mr-4" htmlFor='showMeasureGroups'>Show measure groups</label>
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
            {standaloneMeasures.current?.map((measure) => (
              <div className='p-2 w-1/4' key={measure.$id}>
                <MeasureMarker measure={measure} clickable={true} />
              </div>
            ))}

            {measureGroups.current?.map((measureGroup) => (
              <div className='p-2 w-1/4' key={measureGroup.$id}>
                <MeasureGroupMarker measureGroup={measureGroup} clickable={true} />
              </div>
            ))}
          </Map>
        </APIProvider>
      </Container>


      <Container>
        <div className='flex flex-wrap mt-4'>
          {standaloneMeasures.current?.map((measure) => (
            <div className='p-2 w-1/4' key={measure.$id}>
              <MeasureCard measure={measure} onDelete={onDelete} />
            </div>
          ))}
        </div>
      </Container>

      <Container>
        <div className='flex flex-wrap'>
          {measureGroups.current?.map((measureGroup) => (
            <div className='p-2 w-1/4' key={measureGroup.$id}>
              <MeasureGroupCard {...measureGroup} />
            </div>
          ))}
        </div>
      </Container>

      <div className='text-gray-300 text-xs text-center w-full'>
        Map Markers by Hea Poh Lin from<a href="https://thenounproject.com/browse/icons/term/map-markers/" title="Map Markers Icons">Noun Project</a>
      </div>
    </div>



    //Map Markers by Hea Poh Lin from <a href="https://thenounproject.com/browse/icons/term/map-markers/" target="_blank" title="Map Markers Icons">Noun Project</a> (CC BY 3.0)
  )
}

export default Measures