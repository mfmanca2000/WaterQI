import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import conf from "../conf/conf.js";
import Container from './Container.jsx';
import { formatDateTime } from '../utils/date.js'
import { Link } from 'react-router-dom';
import StorageService from '../appwrite/storage.js'
import MeasureGroupMarker from './MeasureGroupMarker.jsx';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function MeasureGroupForm({ measureGroup }) {


  const { register, handleSubmit, reset, setValue, getValues } = useForm({
    defaultValues: {
      description: measureGroup?.description || "",
      latitude: measureGroup?.latitude || defaultLatitude,
      longitude: measureGroup?.longitude || defaultLongitude,
      imageId: measureGroup?.imageId || "",
    }
  })

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData)
  const [markerRef, marker] = useMarkerRef();
  const measures = useRef([]);
  const [measureNumber, setMeasureNumber] = useState(0);

  const [markerPosition, setMarkerPosition] = useState({
    lat: Number(measureGroup?.latitude || defaultLatitude),
    lng: Number(measureGroup?.longitude || defaultLongitude)
  });

  const [centerPosition, setCenterPosition] = useState({
    lat: Number(measureGroup?.latitude || defaultLatitude),
    lng: Number(measureGroup?.longitude || defaultLongitude)
  });

  useEffect(() => {

    reset({
      description: measureGroup?.description || "",
      latitude: measureGroup?.latitude || defaultLatitude,
      longitude: measureGroup?.longitude || defaultLongitude,
      imageId: measureGroup?.imageId || ""
    });

    if (!isNaN(getValues("latitude")) && !isNaN(getValues("longitude"))) {
      setMarkerPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
      setCenterPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
    }


  }, [reset, measureGroup, getValues]);


  useEffect(() => {
    console.log('Passing by...')
    //console.log('Measures: ' + JSON.stringify(measureGroup?.measures))

    /*
    databaseService.getAllMeasures().then((returnedMeasures) => {

      if (returnedMeasures) {
        const filtered = returnedMeasures.documents.filter((m) => {
          return m.measureGroup == measureGroup.$id;
        });

        //setMeasures(returnedMeasures.documents);
        measures.current = filtered;
        //setMeasureNumber(filtered.length);
        //console.log('Passing by Measures.useEffect...' + measureNumber)
      }
    })

    */
  }, [measureGroup, measureNumber])


  function latitudeChangedHandler(event) {
    if (!isNaN(event.target.value)) {
      //console.log('Latitude changed: ' + event.target.value);
      setValue("latitude", Number(event.target.value))
    }
  }

  function longitudeChangedHandler(event) {

    if (!isNaN(event.target.value)) {
      setValue('longitude', Number(event.target.value))
    }
  }

  const handleAddMeasureToGroup = async (e) => {
    e.preventDefault();    

    if (measureGroup) {
      const desc = String(getValues("description")) + ' - ' + (measureGroup.measures.length + 1);
      const dbMeasure = await databaseService.addMeasure({ userId: userData.$id, latitude: getValues("latitude"), longitude: getValues("longitude"), placeDescription: desc, datetime: new Date(Date.now()), imageId: getValues("imageId") });
      if (dbMeasure) {
        measureGroup.measures.push(dbMeasure);
        await databaseService.updateMeasureGroup(measureGroup.$id, { ...measureGroup });
        measures.current = [...measures.current, dbMeasure];
        //navigate(`/measure/${dbMeasure.$id}`)          
        setMeasureNumber(measures.current.length)
      }
    }
  }

  const onDelete = (e, measure) => {
    e.preventDefault();
    
    if (databaseService.deleteMeasure(measure.$id)) {    
      const found = measureGroup.measures.indexOf(measure);  
      if (found !== -1){
        measureGroup.measures.splice(found, 1);        
      } 
      setMeasureNumber(measureGroup.measures.length);
    }
      
    
  }

  const submit = async (data) => {

    if (measureGroup) {
      const file = data.image[0] ? await storageService.uploadImage(data.image[0]) : null;
      if (file) {
        storageService.deleteImage(measureGroup.imageId);
      }

      const dbMeasureGroup = await databaseService.updateMeasureGroup(measureGroup.$id, { ...data, imageId: file ? file.$id : undefined });
      if (dbMeasureGroup) {
        //modify the lat and lng of all related measures
        dbMeasureGroup.measures.forEach(async (m) => {
          await databaseService.updateMeasure(m.$id, { ...m, imageId: dbMeasureGroup.imageId, latitude: dbMeasureGroup.latitude, longitude: dbMeasureGroup.longitude })
        });

        navigate(`/measures`)
      }
    } else {
      const file = await storageService.uploadImage(data.image[0]);
      if (file) {
        data.imageId = file.$id;
        const dbMeasureGroup = await databaseService.addMeasureGroup({ ...data, userId: userData.$id });
        if (dbMeasureGroup) {
          navigate(`/measureGroup/${dbMeasureGroup.$id}`);
        }
      }
    }
  }

  


  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-1/3 px-2">
        <Input label="Description *"
          placeholder="insert a description"
          className="mb-4"
          {...register("description", { required: true, maxLength: 255 })}
        />

        <Input label="Latitude *"
          placeholder="insert a latitude (i.e. 45.4637979"
          className="mb-4"
          {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
        />

        <Input label="Longitude *"
          placeholder="insert a longitude (i.e. 7.87375)"
          className="mb-4"
          {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
        />

        <Input label={measureGroup ? "Location image" : "Location image *"}
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg"
          {...register("image", { required: !measureGroup })}
        />
        {measureGroup && (
          <div className="w-full mb-4">
            <img src={storageService.getPreviewImageUrl(measureGroup.imageId)} alt={measureGroup.description} className="rounded-lg w-48" />
          </div>
        )}


        <Button type="submit" bgColor={measureGroup ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full">
          {measureGroup ? "Update" : "Insert"}
        </Button>
        <label className='font-thin'>All related measures will have the same location and image of the measure group</label>
      </div>

      <div className='w-2/3'>
        <div className={measureGroup ? "h-1/3 pl-8" : "h-full pl-8"}>
          <APIProvider apiKey={conf.googleMapsAPIKey}>
            <Map
              zoom={8}
              center={centerPosition}
              gestureHandling={'greedy'}
              disableDefaultUI={true}
              onClick={(ev) => {
                //console.log("latitide = ", ev.detail.latLng.lat);
                setValue("latitude", ev.detail.latLng.lat)
                //console.log("longitude = ", ev.detail.latLng.lng);
                setValue("longitude", ev.detail.latLng.lng);
                setMarkerPosition({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng })
              }}>
              <Marker ref={markerRef} clickable={true} position={markerPosition} />
            </Map>
          </APIProvider>
        </div>

        {measureGroup && (
          <div className='mt-8 ml-4'>
            <Container>
              <button onClick={handleAddMeasureToGroup} className='inline-block mx-2 px-6 py-2 duration-200 bg-green-500 hover:bg-casaleggio-btn-rgba rounded-full'>
                Add measure to group
              </button>

              {measureGroup.measures?.length > 0 && (
                <div className='flex flex-wrap mt-4 px-4 pb-4 bg-casaleggio-rgba rounded-xl border border-black/10'>
                  <table className='table-auto mt-4 w-full'>
                    <thead>
                      <tr>
                        <th></th>
                        <th className='text-left'>Description</th>
                        <th className='text-left'>Date</th>
                        <th className='text-left'>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {measureGroup.measures.map((measure) => (
                        <tr key={measure.$id}>
                          <td><img src={StorageService.getPreviewImageUrl(measure.imageId)} alt={measure.placeDescription} className='rounded-xl mt-2 w-10' /></td>
                          <td className='border-separate'>{measure.placeDescription}</td>
                          <td>{formatDateTime(new Date(measure.datetime))}</td>
                          <td><Link to={`/measure/${measure.$id}`}>Open</Link> </td>
                          <td><Link onClick={(e) => onDelete(e, measure)}>Delete</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Container>
          </div>
        )}
      </div>






    </form >
  )
}

export default MeasureGroupForm