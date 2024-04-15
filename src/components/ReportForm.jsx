import React, { useState, useEffect } from 'react'
import { Controller, useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { conf } from "../conf/conf.js";
import { formatDateTime, removeTimeZone } from "../utils/date.js";
import { useTranslation } from 'react-i18next'
import { IoWarning } from "react-icons/io5";
import { ResponsiveContainer } from 'recharts';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import MapController from './MapController.jsx';
import { Icon } from 'leaflet';

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
    const [charsCount, setCharsCount] = useState(0)

    const warningIcon = new Icon({
        iconUrl: window.location.origin + '/warning.png',
        iconSize: [48, 48] // size of the icon
    });

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
        console.log('Position retrieved from the browser')
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
            datetime: report ? removeTimeZone(new Date(report.datetime)) : removeTimeZone(new Date(Date.now())),
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

        console.log('Report:' + JSON.stringify(report));

        reset({
            latitude: report?.latitude || latitudeDevice || defaultLatitude,
            longitude: report?.longitude || longitudeDevice || defaultLongitude,
            title: report?.title || '',
            description: report?.description || '',
            datetime: report ? removeTimeZone(new Date(report.datetime)) : removeTimeZone(new Date(Date.now())),
            imageId: report?.imageId || ''
        });


        if (!isNaN(getValues("latitude")) && !isNaN(getValues("longitude"))) {
            console.log('Setting both')
            setMarkerPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
            setCenterPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
        }



    }, [reset, report, getValues, latitudeDevice, longitudeDevice, charsCount]);

    function latitudeChangedHandler(event) {
        if (!isNaN(event.target.value)) {
            //console.log('Latitude changed: ' + event.target.value);
            setMarkerPosition({ lat: Number(event.target.value), lng: Number(getValues("longitude")) })
            setCenterPosition({ lat: Number(event.target.value), lng: Number(getValues("longitude")) })
        }
    }

    function longitudeChangedHandler(event) {

        if (!isNaN(event.target.value)) {
            //console.log('Longitude changed: ' + event.target.value + ' Lat-->' + getValues("latitude"));
            setMarkerPosition({ lat: Number(getValues("latitude")), lng: Number(event.target.value) })
            setCenterPosition({ lat: Number(getValues("latitude")), lng: Number(event.target.value) })
        }
    }

    const submit = async (data) => {
        let file = null;
        if (report) {

            if (previewImage) {
                //console.log('We have a previewImage...' + previewImage)
                file = await storageService.uploadImage(previewImage);
                if (file && report.imageId) {
                    //console.log('Have to delete previous image')
                    storageService.deleteImage(report.imageId);
                }
            }

            const dbReport = await databaseService.updateReport(report.$id, { ...data, imageId: file ? file.$id : report.imageId, username: userData.prefs.username });
            if (dbReport) {
                navigate('/locations')
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
                navigate(`/locations`);
            }
        }
    }

    function canModify() {
        //it's a new measure, or this user is an admin, or the measure was created by this user
        return !report || userData.labels.includes('admin') || userData.$id === report.userId;
    }    

    return (
        <>
            {console.log('Redrawing with centerposition: ' + centerPosition.lat + ' ' + centerPosition.lng)}
            <Link className='underline font-bold ' to={'/locations'}>
                {t('returnToMeasures')}
            </Link>

            <div className='mb-4'>
                <label className='text-4xl pb-4'>{!report ? t('reportTitleNew') : getValues('title')}</label>
                {report && <div>
                    <label className='text-sm'> {t('by') + ' ' + (report.username ? report.username : report.userId)}</label>
                </div>}
            </div>

            <div className="w-3/4">
                <div className="w-full h-72 " >                    

                    <MapContainer className='h-72 my-6' center={[centerPosition.lat, centerPosition.lng]} zoom={conf.defaultZoomLevel} >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[markerPosition.lat, markerPosition.lng]} icon={warningIcon} />
                        <MapController canModify={canModify()} setValue={setValue} setMarkerPosition={setMarkerPosition} setCenterPosition={setCenterPosition} center={centerPosition}/>
                    </MapContainer>
                </div>
                <form onSubmit={handleSubmit(submit)} className="flex flex-wrap mt-4">
                    <div className="w-full">
                        <Input label={t('reportTitle') + ' * ' + (watch('title') ? '(' + (watch('title').length) + '/255)' : '(max 255 chars)')}
                            disabled={!canModify()}
                            className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                            {...register("title", { required: true, maxLength: 255 })}
                        />

                        <div className='w-full'>
                            <label htmlFor={'descriptionTxt'} className={`w-full inline-block mb-1 pl-1 mr-2 ${watch('description') && watch('description').length > 255 ? 'text-red-600' : ''}`}>
                                {t('reportDescription') + ' * (' + (watch('description') ? (watch('description').length) + '/255)' : 'max 255 chars)')}

                            </label>

                            <ResponsiveContainer>
                                <textarea id='descriptionTxt'

                                    disabled={!canModify()}
                                    className={`px-3 py-2 rounded-lg w-full text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 ${!canModify() ? 'bg-gray-200' : ''}`}
                                    rows={5}
                                    cols={45}
                                    wrap="true"
                                    {...register("description", { required: true, maxLength: 255 })}
                                />
                            </ResponsiveContainer>
                        </div>


                        <Input
                            disabled={!canModify()}
                            label={t('measureGroupLatitude') + ' *'}
                            placeholder="(i.e. 45.4637979)"
                            className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                            {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
                        />

                        <Input
                            disabled={!canModify()}
                            label={t('measureGroupLongitude') + ' *'}
                            placeholder="(i.e. 7.87375)"
                            className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                            {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
                        />


                        <Input type="datetime-local" label={t('measureDate') + ' *'}
                            disabled={!canModify()}
                            className={`mb-4 lg:w-1/5 ${!canModify() ? 'bg-gray-200' : ''}`}
                            {...register("datetime", { required: true, valueAsDate: true })}
                        />


                        {canModify() && (
                            <>
                                <Controller
                                    control={control}
                                    name={"image"}

                                    render={({ field: { value, onChange, ...field } }) => {
                                        return (
                                            <Input required={conf.reportImageRequired === 'true' && !report?.imageId} {...field} name='image' label={report ? t('measureGroupLocationImage') : t('measureGroupLocationImage') + ' *'}
                                                type="file" className="mb-4"
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
                            </>
                        )}






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
                        {canModify() &&
                            <Button type="submit" bgColor={report ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full md:w-1/4 mt-8">
                                {report ? t('measureGroupUpdate') : t('measureGroupCreate')}
                            </Button>
                        }

                        {report && (<label className='mb-4 pl-1'>{t('measureGroupLastUpdate') + ' ' + formatDateTime(new Date(report.$updatedAt))}</label>)}
                    </div>
                </form>
            </div>
        </>

    )
}

export default ReportForm