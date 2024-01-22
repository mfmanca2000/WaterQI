import React, { useCallback, useEffect, useState } from "react";
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
import { Link } from "react-router-dom";
import { calculateWQI, calculateWQILocation, getMarkerColor, getMarkerColorLocation } from "../utils/wqi.js";
import { useTranslation } from 'react-i18next'
import { Modal } from "flowbite-react";
import { TbMapPinQuestion } from "react-icons/tb";

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

export default function MeasureForm({ measure }) {

    const { register, handleSubmit, reset, setValue, control, getValues, watch } = useForm({
        defaultValues: {
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
        }
    })



    const navigate = useNavigate();
    const { t } = useTranslation();
    const userData = useSelector((state) => state.auth.userData)
    const [previewImageUrl, setPreviewImageUrl] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const [markerRef, marker] = useMarkerRef();
    const [openModal, setOpenModal] = useState(false);
    const [locationsAround, setLocationsAround] = useState(null)

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

            if (previewImage) {
                //console.log('We have a previewImage...' + previewImage)
                file = await storageService.uploadImage(previewImage);
                if (file && measure.imageId) {
                    console.log('Have to delete previous image')
                    storageService.deleteImage(measure.imageId);
                }
            }

            const dbMeasure = await databaseService.updateMeasure(measure.$id, { ...data, imageId: file ? file.$id : measure.imageId, username: userData.prefs.username });
            if (dbMeasure) {
                if (measure.location) {
                    navigate('/location/' + measure.location.$id)
                } else {
                    navigate('/locations')
                }
            }
        } else {

            //console.log(JSON.stringify(data));

            if (previewImage) {
                file = await storageService.uploadImage(previewImage);
                if (file) {
                    data.imageId = file.$id;
                }
            }

            const locAround = await databaseService.getAllLocationsAround(data.latitude, data.longitude);

            if (locAround.documents.length > 0) {
                setLocationsAround(locAround);
                setOpenModal(true);
            } else {
                const dbLocation = await databaseService.addLocation({
                    userId: userData.$id, username: userData.prefs.username, name: getValues('placeDescription'), latitude: data.latitude, longitude: data.longitude, imageId: data.imageId, measures: [
                        { ...data, userId: userData.$id, username: userData.prefs.username }
                    ]
                })

                if (dbLocation) {
                    navigate(`/locations`);
                }
            }
        }
    }

    function canModify() {
        //it's a new measure, or this user is an admin, or the measure was created by this user
        return !measure || userData.labels.includes('admin') || userData.$id === measure.userId;
    }

    const [wqi, wqiText] = calculateWQI(measure);
    const imageName = window.location.origin + '/' + getMarkerColor(measure);


    const onAddMeasureToNearestLocation = async (e, location) => {
        //console.log('HERE');
        e.preventDefault();

        console.log('Object: ' + JSON.stringify({ ...getValues(), userId: userData.$id, username: userData.prefs.username, location: locationsAround.documents[0].$id }))

        const dbMeasure = await databaseService.addMeasure({ ...getValues(), userId: userData.$id, username: userData.prefs.username, location: locationsAround.documents[0].$id });

        console.log('dbMeasure: ' + JSON.stringify(dbMeasure))

        if (dbMeasure) {
            console.log('Measure added to location')
            // setToggle(!toggle);
            navigate(`/locations`);
        }
    }

    const onAddMeasureToNewLocation = async (e) => {
        e.preventDefault();

        const dbLocation = await databaseService.addLocation({
            userId: userData.$id, username: userData.prefs.username, name: getValues('placeDescription'), latitude: getValues('latitude'), longitude: getValues('longitude'), imageId: getValues('imageId'), measures: [
                { ...getValues(), userId: userData.$id, username: userData.prefs.username }
            ]
        })

        if (dbLocation) {
            navigate(`/locations`);
        }
    }

    return (
        <>
            <Link className='underline font-bold ' to={measure?.location ? '/location/' + measure.location.$id : '/locations'}>
                {measure?.location ? t('returnToLocation') : t('returnToMeasures')}
            </Link>

            <div className='mb-4'>
                <label className='text-4xl pb-4'>{!measure ? t('measureTitleNew') : getValues('placeDescription')}</label>
                {measure && <div>
                    <label className='text-sm'> {t('by') + ' ' + (measure.username ? measure.username : measure.userId)}</label>
                </div>}
            </div>

            <div className="w-full">
                <div className="w-full h-72 " >
                    <APIProvider apiKey={conf.googleMapsAPIKey}>
                        <Map mapId={'bf51a910020fa25b'}
                            zoom={conf.defaultZoomLevel}
                            center={centerPosition}
                            gestureHandling={'greedy'}
                            scaleControl={true}
                            disableDefaultUI={true}
                            onClick={(ev) => {
                                if (canModify() && !(measure?.location)) {
                                    //console.log("latitude = ", ev.detail.latLng.lat);
                                    setValue("latitude", ev.detail.latLng.lat)
                                    //console.log("longitude = ", ev.detail.latLng.lng);
                                    setValue("longitude", ev.detail.latLng.lng);
                                    setMarkerPosition({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng })
                                    //console.log(marker.position.lat)
                                }
                            }}>

                            <AdvancedMarker position={markerPosition} clickable='true'>
                                <img src={imageName} className="w-16" title={wqiText} />
                            </AdvancedMarker>
                        </Map>
                    </APIProvider>
                </div>
                <form onSubmit={handleSubmit(submit)} className="flex flex-wrap mt-4">

                    <Modal show={openModal} onClose={() => setOpenModal(false)} popup>
                        <Modal.Header />
                        <Modal.Body>
                            <div className="text-center">
                                <TbMapPinQuestion className="mx-auto mb-4 h-14 w-14 text-casaleggio-rgba dark:text-gray-200" />
                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    {t('addMeasureModalDescription1', { distance: conf.maxDistanceMeters})}
                                </h3>
                                <h6 className='text-base font-thin leading-relaxed justify-normal text-gray-500 dark:text-gray-400'>
                                    {t('addMeasureModalDescription2')}
                                </h6>
                                {console.log('LocationsAround: ' + JSON.stringify(locationsAround))}
                                {locationsAround && (<div className="w-full h-36 mt-4" >
                                    <APIProvider apiKey={conf.googleMapsAPIKey}>
                                        <Map mapId={'bf51a910020fa25b'}
                                            zoom={16}
                                            center={{ lat: locationsAround.documents[0].latitude, lng: locationsAround.documents[0].longitude }}
                                            gestureHandling={'greedy'}
                                            disableDefaultUI={true}
                                            scaleControl={true}
                                        >

                                            <AdvancedMarker position={{ lat: locationsAround.documents[0].latitude, lng: locationsAround.documents[0].longitude }} clickable='true'>
                                                {/* <img src={window.location.origin + '/' + (getMarkerColorLocation(locationsAround.documents[0]) ?? 'multiplemarker.png')} className="w-16" title={calculateWQILocation(locationsAround.documents[0])[1]} /> */}
                                                <img src={window.location.origin + '/' + (getMarkerColorLocation(locationsAround.documents[0]) ?? 'multiplemarker.png')} className="w-16" title='PROVA' />
                                            </AdvancedMarker>

                                            <AdvancedMarker position={{ lat: getValues('latitude'), lng: getValues('longitude') }} clickable='true'>
                                                <img src={window.location.origin + '/markerGray.png'} className="w-16" title={t('measureTitleNew')} />
                                            </AdvancedMarker>
                                        </Map>
                                    </APIProvider>
                                </div>)}


                                <div className="flex justify-center gap-4 mt-8">

                                    <Button className="bg-green-600" onClick={(e) => {
                                        onAddMeasureToNearestLocation(e, location);
                                        setOpenModal(false)
                                    }}>
                                        {t('addMeasureToNearestLocation')}
                                    </Button>
                                    <Button className="bg-red-600" onClick={(e) => {
                                        onAddMeasureToNewLocation(e, location);
                                        setOpenModal(false)
                                    }}>
                                        {t('addMeasureCreateNewLocation')}
                                    </Button>
                                    <Button color="gray" onClick={() => {
                                        setOpenModal(false)
                                    }}>
                                        {t('addMeasureModalCancel')}
                                    </Button>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer />
                    </Modal>



                    <div className="w-full">
                        <Input label={t('measurePlaceDescription') + ' *'}
                            disabled={!canModify()}
                            className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                            {...register("placeDescription", { required: true, maxLength: 255 })}
                        />

                        {(measure && measure.location) && (<>
                            <label className='font-thin mb-6'>{t('measureExplaination')} </label>
                            <Link className="underline" to={`/location/${measure.location.$id}`} >{t('location')}</Link>
                        </>)}
                        <Input label={t('locationLatitude') + ' *'}
                            placeholder="insert a latitude (i.e. 45.4637979)"
                            disabled={!canModify() || measure?.location}
                            className={`mb-4 ${(!canModify() || measure?.location) ? 'bg-gray-200' : ''}`}
                            {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
                        />

                        <Input label={t('locationLongitude') + ' *'}
                            placeholder="insert a longitude (i.e. 7.87375)"
                            disabled={!canModify() || measure?.location}
                            className={`mb-4 ${(!canModify() || measure?.location) ? 'bg-gray-200' : ''}`}
                            {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
                        />


                        <Input type="datetime-local" label={t('measureDate') + ' *'}
                            disabled={!canModify()}
                            className={`mb-4 lg:w-1/5 ${!canModify() ? 'bg-gray-200' : ''}`}

                            {...register("datetime", { required: true, valueAsDate: true })}
                        />

                        {/* {console.log('Required:' + (conf.measureImageRequired === 'true'))} */}
                        {(canModify() && !(measure?.location)) && (
                            <>
                                <Controller
                                    control={control}
                                    name={"image"}

                                    render={({ field: { value, onChange, ...field } }) => {
                                        return (
                                            <Input required={conf.measureImageRequired === 'true'} {...field} name='image' label={measure ? t('locationImage') : t('locationImage') + ' *'}
                                                type="file" className="mb-2"
                                                accept="image/png, image/jpg, image/jpeg"

                                                onChange={(event) => {

                                                    if (event.target.files && event.target.files[0] && event.target.files[0].size < conf.maxUploadFileSizeKB) {
                                                        setPreviewImage(event.target.files[0]);
                                                        setPreviewImageUrl(URL.createObjectURL(event.target.files[0]));
                                                    } else {
                                                        alert('File size too big');
                                                        setPreviewImage(null);
                                                        setPreviewImageUrl(null);
                                                        event.target.value = null;
                                                        return false;
                                                    }
                                                }}
                                            />

                                        );
                                    }}
                                />
                                <label>{t('uploadExplaination')}</label>
                                <p className="font-extralight">{t('uploadImageDisclaimer')}</p>
                            </>
                        )}

                        <div className='md:w-1/4'>
                            {measure && (previewImageUrl || measure.imageId) && (
                                <div className="w-full mb-4">
                                    <img src={previewImageUrl ? previewImageUrl : storageService.getPreviewImageUrl(measure.imageId)} alt={measure.placeDescription} className="rounded-lg w-full object-cover" />
                                </div>
                            )}
                            {!measure && (
                                <div className="w-full mb-4">
                                    <img src={previewImageUrl} alt={getValues('description')} className="rounded-lg w-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="w-full md:w-1/4 mt-4 px-4 pb-4 bg-casaleggio-rgba rounded-xl border border-black/10">
                            <Input label="Electrical Conductivity (μS/cm)"
                                disabled={!canModify()}
                                className={`mb-2 ${!canModify() ? 'bg-gray-200' : ''}`}
                                {...register("electricalConductivity")}
                            />

                            <Input label="Total Dissolved Solids (ppm)"
                                disabled={!canModify()}
                                className={`mb-2 ${!canModify() ? 'bg-gray-200' : ''}`}
                                {...register("totalDissolvedSolids")}
                            />

                            <Input label="pH"
                                disabled={!canModify()}
                                className={`mb-2 ${!canModify() ? 'bg-gray-200' : ''}`}
                                {...register("pH")}
                            />

                            <Input label="Temperature (°C)"
                                disabled={!canModify()}
                                className={`mb-2 ${!canModify() ? 'bg-gray-200' : ''}`}
                                {...register("temperature")}
                            />

                            <Input label="Salinity"
                                disabled={!canModify()}
                                className={`mb-2 ${!canModify() ? 'bg-gray-200' : ''}`}
                                {...register("salinity")}
                            />
                        </div>

                        {canModify() &&
                            <Button type="submit" bgColor={measure ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full md:w-1/4 mt-8">
                                {measure ? t('locationUpdate') : t('locationCreate')}
                            </Button>
                        }

                        {measure && (<label className='mb-4 pl-1'>{t('locationLastUpdate') + ' ' + formatDateTime(new Date(measure.$updatedAt))}</label>)}
                    </div>
                </form>
            </div>
        </>
    )
}