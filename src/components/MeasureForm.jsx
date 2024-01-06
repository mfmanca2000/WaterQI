import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import conf from "../conf/conf.js";
import { removeTimeZone } from "../utils/date.js";


const defaultLatitude = 45.3820004786078;
const defaultLongitude = 7.852158015084898;

export default function MeasureForm({ measure }) {

    const { register, handleSubmit, reset, setValue, control, getValues } = useForm({
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

    useEffect(() => {

        reset({
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
        });

        if (!isNaN(getValues("latitude")) && !isNaN(getValues("longitude"))) {
            setMarkerPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
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

    const [markerPosition, setMarkerPosition] = useState({
        lat: Number(getValues("latitude")),
        lng: Number(getValues("longitude"))
    });

    const submit = async (data) => {

        if (measure) {
            const file = data.image[0] ? await storageService.uploadImage(data.image[0]) : null;
            if (file) {
                storageService.deleteImage(measure.imageId);
            }
            const dbMeasure = await databaseService.updateMeasure(measure.$id, { ...data, imageId: file ? file.$id : undefined });
            if (dbMeasure) {
                navigate(`/measures`)
            }
        } else {
            const file = await storageService.uploadImage(data.image[0]);
            if (file) {
                data.imageId = file.$id;
                const dbMeasure = await databaseService.addMeasure({ ...data, userId: userData.$id });
                if (dbMeasure) {
                    navigate(`/measures`);
                }
            }
        }

    }

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-1/3 px-2">
                <Input label="Place Description *"
                    placeholder="insert a place description"
                    className="mb-4"
                    {...register("placeDescription", { required: true, maxLength: 255 })}
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

                <Input type="datetime-local" label="Date *"
                    className="mb-4"
                    {...register("datetime", { required: true, valueAsDate: true })}
                />

                <Input label="Electrical Conductivity"
                    className="mb-4"
                    {...register("electricalConductivity")}
                />

                <Input label="Total Dissolved Solids"
                    className="mb-4"
                    {...register("totalDissolvedSolids")}
                />

                <Input label="pH"
                    className="mb-4"
                    {...register("pH")}
                />

                <Input label="Temperature (°C)"
                    className="mb-4"
                    {...register("temperature")}
                />

                <Input label="Salinity"
                    className="mb-4"
                    {...register("salinity")}
                />

                <Input label={measure ? "Location image" : "Location image *"}
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg"
                    {...register("image", { required: !measure })}
                />
                {measure && (
                    <div className="w-full mb-4">
                        <img src={storageService.getPreviewImageUrl(measure.imageId)} alt={measure.placeDescription} className="rounded-lg" />
                    </div>
                )}


                <Button type="submit" bgColor={measure ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full">
                    {measure ? "Update" : "Insert"}
                </Button>
            </div>

            <div className="w-2/3 px-2">
                <APIProvider apiKey={conf.googleMapsAPIKey}>
                    <Map
                        zoom={8}
                        center={{ lat: Number(getValues("latitude")), lng: Number(getValues("longitude")) }}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        onClick={(ev) => {
                            //console.log("latitide = ", ev.detail.latLng.lat);
                            setValue("latitude", ev.detail.latLng.lat)
                            //console.log("longitude = ", ev.detail.latLng.lng);
                            setValue("longitude", ev.detail.latLng.lng);
                            setMarkerPosition({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng })
                            console.log(marker.position.lat)
                        }}
                    >
                        <Marker ref={markerRef} clickable={true} position={markerPosition} />
                    </Map>
                </APIProvider>
            </div>

        </form>
    )
}