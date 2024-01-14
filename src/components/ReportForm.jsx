import React, { useState, useEffect } from 'react'
import { Controller, useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdvancedMarker, APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import { conf } from "../conf/conf.js";
import { formatDateTime, removeTimeZone } from "../utils/date.js";
import { useTranslation } from 'react-i18next'
import { IoWarning } from "react-icons/io5";
import { ResponsiveContainer } from 'recharts';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function ReportForm({ report }) {
    const [latitudeDevice, setLatitudeDevice] = useState(null);
    const [longitudeDevice, setLongitudeDevice] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation();
    const userData = useSelector((state) => state.auth.userData)
    const [previewImageUrl, setPreviewImageUrl] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)

    useEffect(() => {
        async function retrievePosition() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error);
            } else {
                console.log("Geolocation not supported");
            }
        }

        retrievePosition();
    }, [])

    function success(position) {
        setLatitudeDevice(position.coords.latitude);
        setLongitudeDevice(position.coords.longitude);
    }

    function error() {
        console.log("Unable to retrieve your location");
    }


    const { register, handleSubmit, reset, setValue, control, getValues, watch } = useForm({
        defaultValues: {
            latitude: report?.latitude || latitudeDevice || defaultLatitude,
            longitude: report?.longitude || longitudeDevice || defaultLongitude,
            title: report?.title || '',
            description: report?.description || '',
            datetime: removeTimeZone(report?.datetime) || removeTimeZone(new Date(Date.now())),
            imageId: report?.imageId || ''
        }
    })

    const [markerPosition, setMarkerPosition] = useState({
        lat: Number(report?.latitude || latitudeDevice || defaultLatitude),
        lng: Number(report?.longitude || longitudeDevice || defaultLongitude)
    });

    const [centerPosition, setCenterPosition] = useState({
        lat: Number(report?.latitude || latitudeDevice || defaultLatitude),
        lng: Number(report?.longitude || longitudeDevice || defaultLongitude)
    });


    useEffect(() => {

        reset({
            latitude: report?.latitude || latitudeDevice || defaultLatitude,
            longitude: report?.longitude || longitudeDevice || defaultLongitude,
            title: report?.title || '',
            description: report?.description || '',
            datetime: removeTimeZone(report?.datetime) || removeTimeZone(new Date(Date.now())),
            imageId: report?.imageId || ''
        });


        if (!isNaN(getValues("latitude")) && !isNaN(getValues("longitude"))) {
            setMarkerPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
            setCenterPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
        }



    }, [reset, report, getValues, latitudeDevice, longitudeDevice]);

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
        if (report) {

            if (previewImage) {
                console.log('We have a previewImage...' + previewImage)
                file = await storageService.uploadImage(previewImage);
                if (file && report.imageId) {
                    console.log('Have to delete previous image')
                    storageService.deleteImage(report.imageId);
                }
            }

            const dbReport = await databaseService.updateReport(report.$id, { ...data, imageId: file ? file.$id : report.imageId, username: userData.prefs.username });
            if (dbReport) {
                navigate('/measures')
            }
        } else {

            if (previewImage) {
                file = await storageService.uploadImage(previewImage);
                if (file) {
                    data.imageId = file.$id;
                }
            }

            const dbReport = await databaseService.addReport({ ...data, userId: userData.$id, username: userData.prefs.username });
            if (dbReport) {
                navigate(`/measures`);
            }

        }

    }

    return (
        <>
            <div className='mb-4'>
                <label className='text-4xl pb-4'>{!report ? t('reportTitleNew') : getValues('title')}</label>
            </div>
            
            <div className="w-full">
                <div className="w-full h-72 " >
                    <APIProvider apiKey={conf.googleMapsAPIKey}>
                        <Map mapId={'bf51a910020fa25d'}
                            zoom={conf.defaultZoomLevel}
                            center={centerPosition}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                            onClick={(ev) => {
                                if (!report) {
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
                                <img src='/warning.png' className="w-12" />
                            </AdvancedMarker>
                        </Map>
                    </APIProvider>
                </div>
                <form onSubmit={handleSubmit(submit)} className="flex flex-wrap mt-4">
                    <div className="w-full">
                        <Input label={t('reportTitle') + ' *'}
                            className="mb-4"
                            {...register("title", { required: true, maxLength: 255 })}
                        />

                        <div className='w-full'>
                            <label htmlFor={'descriptionTxt'} className='w-full inline-block mb-1 pl-1 mr-2'>
                                {t('reportDescription') + ' *'}
                            </label>

                            <ResponsiveContainer>
                                <textarea id='descriptionTxt' className='px-3 py-2 rounded-lg w-full text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200'
                                    rows={5}
                                    cols={45}
                                    wrap="true"                                    
                                    {...register("description", { required: true, maxLength: 255 })}
                                />
                            </ResponsiveContainer>
                        </div>
                        {report &&
                            <>
                                <Input
                                    disabled
                                    label={t('measureGroupLatitude') + ' *'}
                                    placeholder="(i.e. 45.4637979)"
                                    className="mb-4 bg-gray-200"
                                    {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
                                />

                                <Input
                                    disabled
                                    label={t('measureGroupLongitude') + ' *'}
                                    placeholder="(i.e. 7.87375)"
                                    className="mb-4 bg-gray-200"
                                    {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
                                />
                            </>
                        }

                        {!report && (
                            <>
                                <Input label={t('measureGroupLatitude') + ' *'}
                                    placeholder="insert a latitude (i.e. 45.4637979"
                                    className="mb-4"
                                    {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
                                />

                                <Input label={t('measureGroupLongitude') + ' *'}
                                    placeholder="insert a longitude (i.e. 7.87375)"
                                    className="mb-4"
                                    {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
                                />
                            </>
                        )

                        }


                        <Input type="datetime-local" label={t('measureDate') + ' *'}
                            className="mb-4 lg:w-1/5"
                            {...register("datetime", { required: true, valueAsDate: true })}
                        />


                        {!report && (
                            <>
                                <Controller
                                    control={control}
                                    name={"image"}

                                    render={({ field: { value, onChange, ...field } }) => {
                                        return (
                                            <Input {...field} name='image' label={report ? t('measureGroupLocationImage') : t('measureGroupLocationImage') + ' *'}
                                                type="file" className="mb-4"
                                                accept="image/png, image/jpg, image/jpeg"

                                                onChange={(event) => {

                                                    if (event.target.files && event.target.files[0]) {
                                                        setPreviewImage(event.target.files[0]);
                                                        setPreviewImageUrl(URL.createObjectURL(event.target.files[0]));
                                                    }
                                                }}
                                            />
                                        );
                                    }}
                                />
                            </>
                        )}



                        {report && (<label className='mb-4 pl-1'>{t('measureGroupLastUpdate') + ' ' + formatDateTime(new Date(report.$updatedAt))}</label>)}


                        <div className='md:w-1/4'>
                            {report && (previewImageUrl || report.imageId) && (
                                <div className="w-full mb-4">
                                    <img src={previewImageUrl ? previewImageUrl : storageService.getPreviewImageUrl(report.imageId)} alt={report.title} className="rounded-lg w-full object-cover" />
                                </div>
                            )}
                            {!report && (
                                <div className="w-full mb-4">
                                    <img src={previewImageUrl} alt={getValues('title')} className="rounded-lg w-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <Button type="submit" bgColor={report ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full md:w-1/4 mt-8">
                            {report ? t('measureGroupUpdate') : t('measureGroupCreate')}
                        </Button>
                    </div>
                </form>
            </div>



        </>

    )
}

export default ReportForm