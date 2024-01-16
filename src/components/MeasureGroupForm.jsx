import React, { useCallback, useEffect, useState, useRef } from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IoOpenOutline, IoTrash } from "react-icons/io5";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { AdvancedMarker, APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import { conf } from "../conf/conf.js";
import Container from './Container.jsx';
import { formatDateTime } from '../utils/date.js'
import { Link } from 'react-router-dom';
import StorageService from '../appwrite/storage.js'
import { useTranslation } from 'react-i18next'
import MeasureChart from './MeasureChart.jsx';
import { calculateWQI, calculateWQIMeasureGroup, getMarkerColor, getMarkerColorMeasureGroup } from '../utils/wqi.js';


const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function MeasureGroupForm({ measureGroup }) {


    const { register, handleSubmit, reset, setValue, control, getValues } = useForm({
        defaultValues: {
            description: measureGroup?.description || "",
            latitude: measureGroup?.latitude || defaultLatitude,
            longitude: measureGroup?.longitude || defaultLongitude,
            imageId: measureGroup?.imageId || ""
        }
    })

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userData = useSelector((state) => state.auth.userData)
    const [markerRef, marker] = useMarkerRef();
    const measures = useRef([]);
    const [measureNumber, setMeasureNumber] = useState(0);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)

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
        //console.log('2nd useEffect')  
        //console.log('MeasureGroup: ' + JSON.stringify(measureGroup))    
    }, [measureGroup, measureNumber, lastUpdatedAt])


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
        console.log('HandleAdd');
        e.preventDefault();

        if (measureGroup) {
            const desc = String(getValues("description")) + ' - ' + (measureGroup.measures.length + 1);
            const dbMeasure = await databaseService.addMeasure({ userId: userData.$id, username: userData.prefs.username, latitude: getValues("latitude"), longitude: getValues("longitude"), placeDescription: desc, datetime: new Date(Date.now()), imageId: getValues("imageId") });
            if (dbMeasure) {
                measureGroup.measures.push(dbMeasure);
                //measures.current = measureGroup.measures;

                const newMg = await databaseService.updateMeasureGroup(measureGroup.$id, { ...measureGroup, username: userData.prefs.username, lastOperationTime: new Date(Date.now()) });

                setLastUpdatedAt(newMg.$updatedAt)
                setMeasureNumber(newMg.measures.length)

                //navigate(`/measure/${dbMeasure.$id}`)  
            }
        }
    }

    const handleDeleteMeasure = async (e, measure) => {
        e.preventDefault();

        if (databaseService.deleteMeasure(measure.$id)) {
            const found = measureGroup.measures.indexOf(measure);
            if (found !== -1) {
                console.log('Found at index ' + found + ' out of ' + measureGroup.measures.length);
                const deleted = measureGroup.measures.splice(found, 1);
                measures.current.splice(found, 1);
                // console.log('After splice: ' + measures.current.length)
                // console.log('Before databaseService.updateMeasureGroup updatedAt is ' + measureGroup.$updatedAt)
                const newMg = await databaseService.updateMeasureGroup(measureGroup.$id, { ...measureGroup, username: userData.prefs.username, lastOperationTime: new Date(Date.now()) });
                if (newMg) {
                    // console.log('After databaseService.updateMeasureGroup updatedAt is ' + newMg.$updatedAt)
                    // console.log('After databaseService.updateMeasureGroup lastOperationTime is ' + newMg.lastOperationTime)
                    // console.log('After removal ' + measures.current.length + ' are left')
                    setLastUpdatedAt(newMg.$updatedAt)
                    setMeasureNumber(newMg.measures.length);
                } else {
                    console.log('Unable to update Measure Group')
                    window.location.reload(false);
                }
            } else {
                console.log('What is going on here??')
            }

        }
    }

    const submit = async (data) => {

        let file = null;

        if (measureGroup) {

            if (previewImage) {
                console.log('We have a previewImage...' + previewImage)
                file = await storageService.uploadImage(previewImage);
                if (file && measureGroup.imageId) {
                    console.log('Have to delete previous image')
                    storageService.deleteImage(measureGroup.imageId);
                }
            }

            const dbMeasureGroup = await databaseService.updateMeasureGroup(measureGroup.$id, { ...data, username: userData.prefs.username, imageId: file?.$id });
            if (dbMeasureGroup) {
                //modify the image, lat and lng of all related measures
                dbMeasureGroup.measures.forEach(async (m) => {
                    await databaseService.updateMeasure(m.$id, { ...m, username: userData.prefs.username, imageId: dbMeasureGroup.imageId, latitude: dbMeasureGroup.latitude, longitude: dbMeasureGroup.longitude })
                });

                navigate(`/measures`)
            }
        } else {

            if (previewImage) {
                file = await storageService.uploadImage(previewImage);
                if (file) {
                    data.imageId = file.$id;
                }
            }

            const dbMeasureGroup = await databaseService.addMeasureGroup({ ...data, userId: userData.$id, username: userData.prefs.username });
            if (dbMeasureGroup) {
                navigate(`/measureGroup/${dbMeasureGroup.$id}`);
            }

        }
    }

    const dateFormatter = date => {
        return formatDateTime(new Date(date)).slice(0, 10);
    };

    function canModify() {
        //it's a new measureGroup, or this user is an admin, or the measureGroup was created by this user
        return !measureGroup || userData.labels.includes('admin') || userData.$id === measureGroup.userId;
    }

    function CustomTooltip({ payload, label, active }) {
        if (active) {
            return (
                <div className="custom-tooltip bg-white border p-2">
                    <p className="font-bold">{`${formatDateTime(new Date(payload[0].payload.datetime))}`}</p>
                    <p className="font-thin">{`EC: ${payload[0].payload.electricalConductivity ?? '-'}`}</p>
                    <p className="font-thin">{`TDS: ${payload[0].payload.totalDissolvedSolids ?? '-'}`}</p>
                    <p className="font-thin">{`pH: ${payload[0].payload.pH ?? '-'}'`}</p>
                    <p className="font-thin">{`Temp: ${payload[0].payload.temperature ?? '-'}`}</p>
                    <p className="font-thin">{`Salinity: ${payload[0].payload.salinity ?? '-'}`}</p>
                </div>
            );
        }

        return null;
    }

    const [wqi, wqiText] = calculateWQIMeasureGroup(measureGroup);
    const imageName = window.location.origin + '/' + (getMarkerColorMeasureGroup(measureGroup) ?? 'multiplemarker.png');

    return (
        <>
            <Link className='underline font-bold ' to={'/measures'}>
                {t('returnToMeasures')}
            </Link>

            <div className='mb-4 align-middle'>
                <label className='text-4xl pb-4'>{!measureGroup ? t('measureGroupTitleNew') : getValues('description')}</label>
                {measureGroup && <div>
                    <label className='text-sm'> {t('by') + ' ' + (measureGroup.username ? measureGroup.username : measureGroup.userId)}</label>
                </div>}
            </div>

            <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
                <div className='w-full h-72'>
                    <APIProvider apiKey={conf.googleMapsAPIKey}>
                        <Map mapId={'bf51a910020fa25c'}
                            zoom={conf.defaultZoomLevel}
                            center={centerPosition}
                            gestureHandling={'greedy'}
                            disableDefaultUI={true}
                            onClick={(ev) => {
                                if (canModify()) {
                                    //console.log("latitide = ", ev.detail.latLng.lat);
                                    setValue("latitude", ev.detail.latLng.lat)
                                    //console.log("longitude = ", ev.detail.latLng.lng);
                                    setValue("longitude", ev.detail.latLng.lng);
                                    setMarkerPosition({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng })
                                }
                            }}>
                            <AdvancedMarker ref={markerRef} clickable={true} position={markerPosition}>
                                <img src={imageName} className="w-8" title={wqiText} />
                            </AdvancedMarker>
                        </Map>
                    </APIProvider>
                </div>



                <div className="w-full">
                    <Input label={t('measureGroupDescription') + ' *'}
                        disabled={!canModify()}
                        className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                        {...register("description", { required: true, maxLength: 255 })}
                    />

                    <Input label={t('measureGroupLatitude') + ' *'}
                        placeholder="(i.e. 45.4637979)"
                        className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                        {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
                    />

                    <Input label={t('measureGroupLongitude') + ' *'}
                        placeholder="(i.e. 7.87375)"
                        className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                        {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
                    />

                    {measureGroup && (<label className='mb-4 pl-1'>{t('measureGroupLastUpdate') + ' ' + formatDateTime(lastUpdatedAt ? new Date(lastUpdatedAt) : new Date(measureGroup.$updatedAt))}</label>)}

                    {canModify() && (<>
                        <Controller
                            control={control}
                            name={"image"}

                            render={({ field: { value, onChange, ...field } }) => {
                                return (
                                    <Input required={!measureGroup && conf.measureGroupImageRequired === 'true'} {...field} name='image' label={measureGroup ? t('measureGroupLocationImage') : t('measureGroupLocationImage') + ' *'}
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
                                    />);
                            }}
                        />
                        <label>{t('uploadExplaination')}</label>
                        <p className="font-extralight">{t('uploadImageDisclaimer')}</p>
                    </>)}

                    <div className='md:w-1/4'>
                        {measureGroup && (previewImageUrl || measureGroup.imageId) && (
                            <div className="w-full mb-4">
                                <img src={previewImageUrl ? previewImageUrl : storageService.getPreviewImageUrl(measureGroup.imageId)} alt={measureGroup.description} className="rounded-lg w-full object-cover" />
                            </div>
                        )}
                        {!measureGroup && (
                            <div className="w-full mb-4">
                                <img src={previewImageUrl} alt={getValues('description')} className="rounded-lg w-full object-cover" />
                            </div>
                        )}
                        {canModify() && (
                            <>
                                <Button type="submit" bgColor={measureGroup ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full md:mt-8">
                                    {measureGroup ? t('measureGroupUpdate') : t('measureGroupCreate')}
                                </Button>
                                {measureGroup && (<label className='font-thin'>{t('measureGroupExplaination')}</label>)}
                            </>
                        )}
                    </div>
                </div>

                <div className='w-full'>

                    {measureGroup && (
                        <div className='mt-8'>

                            <div className='text-right'>
                                <Button onClick={handleAddMeasureToGroup} className='duration-200 bg-green-500 hover:bg-casaleggio-btn-rgba w-full md:w-1/4'>
                                    {t('measureGroupAddMeasure')}
                                </Button>
                            </div>

                            {measureGroup.measures?.length > 0 && (<>
                                <div className='flex flex-wrap max-h-64 mt-4 px-4 pb-4 bg-casaleggio-rgba  border border-black/10 overflow-x-hidden overflow-y-scroll'>
                                    <table className='table-auto mt-4 w-full'>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th className='text-left'>{t('measureDescription')}</th>
                                                <th className='text-left px-6'>{t('measureDate')}</th>
                                                <th className='text-left'>{t('measureActions')}</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {measureGroup.measures.sort(function (a, b) {
                                                return new Date(a.datetime) - new Date(b.datetime);
                                            }).map(
                                                (measure) => {
                                                    const [wqi, wqiText] = calculateWQI(measure);
                                                    return (
                                                        <tr key={measure.$id}>
                                                            <td className='w-10'><img src={window.location.origin + '/' + getMarkerColor(measure)} className="w-10" title={t(wqiText)} /></td>
                                                            <td className='border-separate'>{measure.placeDescription?.slice(0, 50) + (measure.placeDescription?.length > 50 ? '...' : '')}</td>
                                                            <td className='px-6 py-4'>{formatDateTime(new Date(measure.datetime))}</td>
                                                            <td><Link to={`/measure/${measure.$id}`}><IoOpenOutline className='size-6' /></Link> </td>
                                                            <td>{canModify() && (<Link onClick={(e) => handleDeleteMeasure(e, measure)}><IoTrash className='size-6' /></Link>)}</td>
                                                        </tr>
                                                    )
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='my-16'>
                                    <MeasureChart values={measureGroup.measures.sort(function (a, b) {
                                        return new Date(a.datetime) - new Date(b.datetime);
                                    })} />
                                </div>
                            </>
                            )}

                        </div>
                    )}
                </div>
            </form >
        </>
    )
}

export default MeasureGroupForm