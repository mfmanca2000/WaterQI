import React from 'react'
import {conf} from "../conf/conf.js";
import { useEffect, useRef, useState } from 'react';
import databaseService from '../appwrite/database'
import Container from '../components/Container';
import MeasureGroupCard from '../components/MeasureGroupCard';
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import { useSelector } from "react-redux";
import Input from '../components/Input.jsx';
import MeasureGroupMarker from '../components/MeasureGroupMarker.jsx';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function MeasureGroups() {

  const measureGroups = useRef([]);
  const [onlyUserMeasureGroups, setOnlyUserMeasureGroups] = useState(false);  
  const [measureGroupsNumber, setMeasureGroupsNumber] = useState();
  const [searchText, setSearchText] = useState();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    databaseService.getAllMeasureGroups().then((returnedMeasureGroups) => {
      
      const currentUserId = userData.$id;

      if (returnedMeasureGroups) {
        const filtered = returnedMeasureGroups.documents.filter((mg) => {
          return (!onlyUserMeasureGroups || mg.userId === currentUserId) &&            
            (!searchText || mg.description.toLowerCase().includes(searchText.toLowerCase()));
        });

        //setMeasures(returnedMeasures.documents);
        measureGroups.current = filtered;
        setMeasureGroupsNumber(filtered.length);        
      }
    })
    

  }, [onlyUserMeasureGroups, userData, searchText, measureGroupsNumber]);


  return (
    <div className='w-full py-8'>

      <Container>

        <div className='flex'>
          <div className='felx w-1/4'>
            <input type="checkbox" id='onlyYourMeasures' className="mt-5 mr-4" onChange={(e) => {              
              setOnlyUserMeasureGroups((prev) => !prev)
            }}
            />
            <label className="mb-4 mr-4" htmlFor='onlyYourMeasures'>Only your measure groups</label>
          </div>

          <div className='flex w-1/2 content-baseline'>
            <label className='mt-4 pl-1 mr-2' htmlFor='searchTextInput'>Search</label>
            <input id="searchTextInput" className="m-2 px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full" label="Search" onChange={(e) => {              
              setSearchText(e.target.value);
            }} />
          </div>

          <div className='mt-4 w-1/4 text-right'>
            <label className="mb-4 mr-4 font-extrabold">Results {measureGroupsNumber}</label>
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
            scaleControl={true}
            disableDefaultUI={true}
          >
            {measureGroups.current?.map((measureGroup) => (
              <div className='p-2 w-1/4' key={measureGroup.$id}>
                <MeasureGroupMarker measureGroup={measureGroup} clickable={true} />
              </div>
            ))}
          </Map>
        </APIProvider>
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
    </div>
  )
}

export default MeasureGroups