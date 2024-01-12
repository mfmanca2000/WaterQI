import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdvancedMarker, APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import conf from "../conf/conf.js";
import { removeTimeZone } from "../utils/date.js";
import { Link } from "react-router-dom";
import { calculateWQI, getMarkerColor } from "../utils/wqi.js";
import { FileInput } from "flowbite-react";

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

export default function MeasureForm({ measure }) {

    const { register, handleSubmit, reset, setValue, control, getValues, watch } = useForm({
        defaultValues: {
            latitude: measure?.latitude || defaultLatitude,
            longitude: measure?.longitude || defaultLongitude,
            placeDescription: measure?.placeDescription || "",
            datetime: removeTimeZone(new Date(measure?.datetime)) || removeTimeZone(new Date(Date.now())),
            imageId: measure?.imageId || "",
            electricalConductivity: measure?.electricalConductivity || null,
            totalDissolvedSolids: measure?.totalDissolvedSolids || null,
            pH: measure?.pH || null,
            temperature: measure?.temperature || null,
            salinity: measure?.salinity || null
        }
    })



    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData)
    const [markerRef, marker] = useMarkerRef();

    const [markerPosition, setMarkerPosition] = useState({
        lat: Number(measure?.latitude || defaultLatitude),
        lng: Number(measure?.longitude || defaultLongitude)
    });

    const [centerPosition, setCenterPosition] = useState({
        lat: Number(measure?.latitude || defaultLatitude),
        lng: Number(measure?.longitude || defaultLongitude)
    });

    useEffect(() => {

        reset({
            latitude: measure?.latitude || defaultLatitude,
            longitude: measure?.longitude || defaultLongitude,
            placeDescription: measure?.placeDescription || "",
            datetime: measure ? removeTimeZone(new Date(measure.datetime)) : removeTimeZone(new Date(Date.now())),
            imageId: measure?.imageId || "",
            electricalConductivity: measure?.electricalConductivity || null,
            totalDissolvedSolids: measure?.totalDissolvedSolids || null,
            pH: measure?.pH || null,
            temperature: measure?.temperature || null,
            salinity: measure?.salinity || null
        });

        if (!isNaN(getValues("latitude")) && !isNaN(getValues("longitude"))) {
            setMarkerPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
            setCenterPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
        }



    }, [reset, measure, getValues]);

    function latitudeChangedHandler(event) {
        if (!isNaN(event.target.value)) {
            console.log('Latitude changed: ' + event.target.value);
            setMarkerPosition({ lat: Number(event.target.value), lng: Number(getValues("longitude")) })
        }
    }

    function longitudeChangedHandler(event) {

        if (!isNaN(event.target.value)) {
            console.log('Longitude changed: ' + event.target.value + ' Lat-->' + getValues("latitude"));
            setMarkerPosition({ lat: Number(getValues("latitude")), lng: Number(event.target.value) })
        }
    }



    const submit = async (data) => {
        let file = null;
        if (measure) {
            if (data.image) {
                file = data.image[0] ? await storageService.uploadImage(data.image[0]) : null;
                if (file) {
                    storageService.deleteImage(measure.imageId);
                }
            }
            const dbMeasure = await databaseService.updateMeasure(measure.$id, { ...data, imageId: file ? file.$id : measure.imageId, username: userData.prefs.username });
            if (dbMeasure) {
                navigate(`/measures`)
            }
        } else {
            const file = await storageService.uploadImage(data.image[0]);
            if (file) {
                console.log('Immagine salvata')
                data.imageId = file.$id;
                const dbMeasure = await databaseService.addMeasure({ ...data, userId: userData.$id, username: userData.prefs.username });
                if (dbMeasure) {
                    navigate(`/measures`);
                }
            }
        }

    }

    const [wqi, wqiText] = calculateWQI(measure);
    const imageName = window.location.origin + '/' + getMarkerColor(measure);

    return (
        <>
            <div className="w-full">
                <div className="w-full h-96 px-2" >
                    <APIProvider apiKey={conf.googleMapsAPIKey}>
                        <Map mapId={'bf51a910020fa25b'}
                            zoom={conf.defaultZoomLevel}
                            center={centerPosition}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                            onClick={(ev) => {
                                if (!measure || !measure.measureGroup) {
                                    //console.log("latitide = ", ev.detail.latLng.lat);
                                    setValue("latitude", ev.detail.latLng.lat)
                                    //console.log("longitude = ", ev.detail.latLng.lng);
                                    setValue("longitude", ev.detail.latLng.lng);
                                    setMarkerPosition({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng })
                                    //console.log(marker.position.lat)
                                }
                            }}>
                            {/* <Marker ref={markerRef} clickable={true} position={markerPosition}>
                                <img src={window.location.origin + '/' + getMarkerColor(measure)} className="w-10" title={wqiText} />
                            </Marker> */}
                            <AdvancedMarker position={markerPosition} clickable='true'>
                                <img src={imageName} className="w-16" title={wqiText} />
                            </AdvancedMarker>
                        </Map>
                    </APIProvider>
                </div>
                <form onSubmit={handleSubmit(submit)} className="flex flex-wrap mt-4">
                    <div className="w-1/2 px-8">
                        <Input label="Place Description *"
                            placeholder="insert a place description"
                            className="mb-4"
                            {...register("placeDescription", { required: true, maxLength: 255 })}
                        />

                        {measure && measure.measureGroup &&
                            <>
                                <label className='font-thin mb-6'>This measure is part of a group. To change its location, please change the location of the </label>
                                <Link className="underline" to={`/measureGroup/${measure.measureGroup.$id}`} >measure group</Link>
                                <Input
                                    disabled
                                    label="Latitude *"
                                    placeholder="insert a latitude (i.e. 45.4637979"
                                    className="mb-4 bg-gray-200"
                                    {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
                                />

                                <Input
                                    disabled
                                    label="Longitude *"
                                    placeholder="insert a longitude (i.e. 7.87375)"
                                    className="mb-4 bg-gray-200"
                                    {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
                                />
                            </>
                        }

                        {(!measure || !measure.measureGroup) && (
                            <>
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
                            </>
                        )

                        }


                        <Input type="datetime-local" label="Date *"
                            className="mb-4"
                            {...register("datetime", { required: true, valueAsDate: true })}
                        />

                        {measure && measure.measureGroup && (
                            <>
                                <label className='font-thin mb-6'>This measure is part of a group. To change its image, please change the image of the </label>
                                <Link className="underline" to={`/measureGroup/${measure.measureGroup.$id}`} >measure group</Link>
                            </>
                        )}

                        {(!measure || !measure.measureGroup) && (
                            // < Input
                            //     label={measure ? "Location image" : "Location image *"}
                            //     type="file"
                            //     className="mb-4"
                            //     accept="image/png, image/jpg, image/jpeg"
                            //     {...register("image", { required: !measure })}
                            // />
                            <>
                                <label>{measure ? "Location image" : "Location image *"}</label>
                                <FileInput id='file-upload-helper-text' helperText='PNG, JPG or JPEG.' sizing='sm' {...register("image", { required: !measure })} className='my-4' />
                            </>
                        )}
                        {measure && (
                            <div className="w-full my-4">
                                <img src={storageService.getPreviewImageUrl(measure.imageId)} alt={measure.placeDescription} className="rounded-lg w-48" />
                            </div>
                        )}



                        <Button type="submit" bgColor={measure ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full">
                            {measure ? "Update" : "Insert"}
                        </Button>
                    </div>

                    <div className="w-1/2 h-1/2 px-8 pb-4 bg-casaleggio-rgba rounded-xl border border-black/10">
                        <Input label="Electrical Conductivity (μS/cm)"
                            className="mb-2"
                            {...register("electricalConductivity")}
                        />

                        <Input label="Total Dissolved Solids (ppm)"
                            className="mb-2"
                            {...register("totalDissolvedSolids")}
                        />

                        <Input label="pH"
                            className="mb-2"
                            {...register("pH")}
                        />

                        <Input label="Temperature (°C)"
                            className="mb-2"
                            {...register("temperature")}
                        />

                        <Input label="Salinity"
                            className="mb-2"
                            {...register("salinity")}
                        />
                    </div>


                </form>
            </div>




        </>
    )
}