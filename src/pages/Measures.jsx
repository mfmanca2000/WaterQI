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
import authService from '../appwrite/auth.js'

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;


function Measures() {
  const filteredStandaloneMeasures = useRef([]);
  const sortedStandaloneMeasures = useRef([]);
  const filteredMeasureGroups = useRef([]);
  const sortedMeasureGroups = useRef([]);

  useEffect(() => {
    async function load() {
      const prefs = await authService.loadPreferences();
      if (prefs) {
        //console.log('USE EFFECT prefs: ' + JSON.stringify(prefs));
        //console.log('---> showYourDataOnly: ' + prefs.showYourDataOnly);
        setOnlyUserData(prefs.showYourDataOnly);    
        //console.log('---> showStandaloneMeasures: ' + prefs.showStandaloneMeasures);
        setShowMeasures(prefs.showStandaloneMeasures);
        //console.log('---> showMeasureGroups: ' + prefs.showMeasureGroups);
        setShowMeasuresGroups(prefs.showMeasureGroups);
      } else {
        console.log('Empty prefs')
      }
    }
    load();    

  }, [])

  const [showYourDataOnly, setOnlyUserData] = useState(false);
  const [showMeasures, setShowMeasures] = useState(true);
  const [showMeasureGroups, setShowMeasuresGroups] = useState(true);

  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [measureNumber, setMeasureNumber] = useState();
  const [searchText, setSearchText] = useState();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    async function save() {
      //const prefs = { showYourDataOnly: showYourDataOnly, showStandaloneMeasures: showMeasures, showMeasureGroups: showMeasureGroups }
      const prefs = { showYourDataOnly: showYourDataOnly, showStandaloneMeasures: showMeasures, showMeasureGroups: showMeasureGroups }
      console.log('Saving prefs: ' + JSON.stringify(prefs))
      const res = await authService.savePreferences(prefs);
      console.log('Saved: ' + res);
    }
    save();
  }, [showYourDataOnly, showMeasures, showMeasureGroups])

  useEffect(() => {
    //console.log('Passing by');
    databaseService.getAllMeasures().then((returnedMeasures) => {
      const currentUserId = userData.$id;

      if (returnedMeasures) {
        sortedStandaloneMeasures.current = returnedMeasures.documents.slice(0, conf.lastInsertedMeasuresNumber);

        filteredStandaloneMeasures.current = returnedMeasures.documents.filter((m) => {
          var dt = new Date(m.datetime).getTime();
          //console.log(m.placeDescription + ': ' + m.datetime + ' -- DateFrom:' + dateFrom + ' --> ' + ((!onlyUserMeasures || m.userId === currentUserId) && (!dateFrom || new Date(m.datetime).getTime > new Date(dateFrom))))   

          return showMeasures &&
            (!m.measureGroup) &&
            (!showYourDataOnly || m.userId === currentUserId) &&
            (!dateFrom || dt >= new Date(dateFrom).getTime()) &&
            (!dateTo || dt <= new Date(dateTo).getTime()) &&
            (!searchText || m.placeDescription.toLowerCase().includes(searchText.toLowerCase()));
        });

        databaseService.getAllMeasureGroups().then((returnedMeasureGroups) => {
          sortedMeasureGroups.current = returnedMeasureGroups.documents.slice(0, conf.lastModifiedMeasureGroupsNumber);

          filteredMeasureGroups.current = returnedMeasureGroups.documents.filter((mg) => {
            return showMeasureGroups &&
              (!showYourDataOnly || mg.userId === currentUserId) &&
              (!searchText || mg.gescription.toLowerCase().includes(searchText.toLowerCase()));
          });

          setMeasureNumber(filteredStandaloneMeasures.current.length + filteredMeasureGroups.current.length);
        });
      }
    })


  }, [showYourDataOnly, userData, dateFrom, dateTo, filteredStandaloneMeasures, searchText, measureNumber, showMeasures, showMeasureGroups]);




  const onDeleteStandaloneMeasure = (e, $id) => {
    e.preventDefault();

    databaseService.deleteMeasure($id);
    setMeasureNumber(measureNumber - 1);
  }

  const onDeleteMeasureGroup = (e, $id) => {
    e.preventDefault();

    databaseService.deleteMeasureGroup($id);
    setMeasureNumber(measureNumber - 1);
  }

  return (
    <div className='w-full py-8'>

      <Container>

        <div className='flex'>
          <div className='flex w-full'>
            <input type="checkbox" checked={showYourDataOnly} id='onlyYourMeasures' label="Show your data only" className="mb-4 mr-4" onChange={(e) => {
              setOnlyUserData((prev) => !prev)
            }} />
            <label className="mb-4 mr-4" htmlFor='onlyYourMeasures'>Show your data only</label>

            <input type="checkbox" checked={showMeasures} id='showMeasures' label="Show standalone measures" className="mb-4 mr-4" onChange={(e) => {
              setShowMeasures((prev) => !prev)
            }} />
            <label className="mb-4 mr-4" htmlFor='showMeasures'>Show standalone measures</label>

            <input type="checkbox" checked={showMeasureGroups} id='showMeasureGroups' label="Show measure groups" className="mb-4 mr-4" onChange={(e) => {
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
          <Map className='h-96 mt-6'
            mapId={'bf51a910020fa25a'}
            zoom={conf.defaultZoomLevel}
            center={{ lat: defaultLatitude, lng: defaultLongitude }}
            gestureHandling={'greedy'}
            disableDefaultUI={true}>
            {filteredStandaloneMeasures.current?.map((measure) => (
              <div className='p-2 w-1/4' key={measure.$id}>
                <MeasureMarker measure={measure} clickable={true} />
              </div>
            ))}

            {filteredMeasureGroups.current?.map((measureGroup) => (
              <div className='p-2 w-1/4' key={measureGroup.$id}>
                <MeasureGroupMarker measureGroup={measureGroup} clickable={true} />
              </div>
            ))}
          </Map>
        </APIProvider>
      </Container>


      <Container>
        <div className='text-3xl mt-4 p-4 font-bold'>
          LAST INSERTED STANDALONE MEASURES
        </div>
      </Container>

      <Container>
        <div className='flex flex-wrap mt-4'>
          {sortedStandaloneMeasures.current?.map((measure) => (
            <div className='p-2 w-1/4' key={measure.$id}>
              <MeasureCard measure={measure} onDelete={onDeleteStandaloneMeasure} />
            </div>
          ))}
        </div>
      </Container>

      <Container>
        <div className='text-3xl mt-4 p-4 font-bold'>
          LAST MODIFIED MEASURE GROUPS
        </div>
      </Container>

      <Container>
        <div className='flex flex-wrap mt-4'>
          {sortedMeasureGroups.current?.map((measureGroup) => (
            <div className='p-2 w-1/4' key={measureGroup.$id}>
              <MeasureGroupCard measureGroup={measureGroup} onDelete={onDeleteMeasureGroup} />
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