import React, { useEffect, useRef, useState } from "react";
import { IoOpenOutline, IoTrash } from "react-icons/io5";
import { Controller, useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import storageService from "../appwrite/storage.js"
import databaseService from "../appwrite/database.js"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdvancedMarker, APIProvider, Map, Marker, useMarkerRef } from '@vis.gl/react-google-maps';
import { conf } from "../conf/conf.js";
import { formatDateTime } from "../utils/date.js";
import { Link } from "react-router-dom";
import { calculateWQI, calculateWQILocation, getMarkerColor, getMarkerColorLocation } from "../utils/wqi.js";
import { useTranslation } from 'react-i18next';
import MeasureChart from './MeasureChart.jsx';
import { Accordion, Modal, Table } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { deleteLocation } from '../utils/dataAccess.js'

function LocationForm({ location }) {

    const defaultLatitude = conf.defaultLatitude;
    const defaultLongitude = conf.defaultLongitude;

    const { register, handleSubmit, reset, control, setValue, getValues, formState: { isDirty, dirtyFields } } = useForm({
        defaultValues: {
            name: location?.name || "",
            latitude: location?.latitude || defaultLatitude,
            longitude: location?.longitude || defaultLongitude,
            imageId: location?.imageId || ""
        }
    })

    useEffect(() => {

        reset({
            name: location?.name || "",
            latitude: location?.latitude || defaultLatitude,
            longitude: location?.longitude || defaultLongitude,
            imageId: location?.imageId || ""
        });

        if (!isNaN(getValues("latitude")) && !isNaN(getValues("longitude"))) {
            setMarkerPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
            setCenterPosition({ lat: getValues("latitude"), lng: getValues("longitude") });
        }


    }, [reset, location, getValues, defaultLatitude, defaultLongitude]);

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userData = useSelector((state) => state.auth.userData)
    const [markerRef, marker] = useMarkerRef();
    const measures = useRef([]);
    const [measureNumber, setMeasureNumber] = useState(0);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null)
    const [previewImage, setPreviewImage] = useState(null)
    const [openModal, setOpenModal] = useState(false);
    const [toggle, setToggle] = useState(false);

    const [markerPosition, setMarkerPosition] = useState({
        lat: Number(location?.latitude || defaultLatitude),
        lng: Number(location?.longitude || defaultLongitude)
    });

    const [centerPosition, setCenterPosition] = useState({
        lat: Number(location?.latitude || defaultLatitude),
        lng: Number(location?.longitude || defaultLongitude)
    });

    function latitudeChangedHandler(event) {
        if (!isNaN(event.target.value)) {
            //console.log('Latitude changed: ' + event.target.value);
            setValue("latitude", Number(event.target.value), { shouldDirty: true })
        }
    }

    function longitudeChangedHandler(event) {

        if (!isNaN(event.target.value)) {
            setValue('longitude', Number(event.target.value), { shouldDirty: true })
        }
    }

    const handleAddMeasureToLocation = async (e) => {
        e.preventDefault();

        if (location) {
            const desc = String(getValues("name")) + ' - ' + (location.measures.length + 1);
            const dbMeasure = await databaseService.addMeasure({ userId: userData.$id, username: userData.prefs.username, latitude: getValues("latitude"), longitude: getValues("longitude"), placeDescription: desc, datetime: new Date(Date.now()), imageId: getValues("imageId") });
            if (dbMeasure) {
                location.measures.push(dbMeasure);
                //measures.current = location.measures;

                const newLoc = await databaseService.updateLocation(location.$id, { ...location, lastOperationTime: new Date(Date.now()) });

                setLastUpdatedAt(newLoc.$updatedAt)
                setMeasureNumber(newLoc.measures.length)

                //navigate(`/measure/${dbMeasure.$id}`)  
            }
        }
    }


    const handleDeleteMeasure = async (e, measure) => {
        e.preventDefault();

        if (databaseService.deleteMeasure(measure.$id)) {
            const found = location.measures.indexOf(measure);
            if (found !== -1) {
                console.log('Found at index ' + found + ' out of ' + location.measures.length);
                const deleted = location.measures.splice(found, 1);
                measures.current.splice(found, 1);
                // console.log('After splice: ' + measures.current.length)
                // console.log('Before databaseService.updateLocation updatedAt is ' + location.$updatedAt)
                const newLoc = await databaseService.updateLocation(location.$id, { ...location, lastOperationTime: new Date(Date.now()) });
                if (newLoc) {
                    // console.log('After databaseService.updateLocation updatedAt is ' + newLoc.$updatedAt)
                    // console.log('After databaseService.updateLocation lastOperationTime is ' + newLoc.lastOperationTime)
                    // console.log('After removal ' + measures.current.length + ' are left')
                    setLastUpdatedAt(newLoc.$updatedAt)
                    setMeasureNumber(newLoc.measures.length);
                } else {
                    console.log('Unable to update Location')
                    window.location.reload(false);
                }
            } else {
                console.log('What is going on here??')
            }

        }
    }


    const submit = async (data) => {

        let file = null;

        if (location) {

            if (previewImage) {
                console.log('We have a previewImage...' + previewImage)
                file = await storageService.uploadImage(previewImage);
                if (file && location.imageId) {
                    console.log('Have to delete previous image')
                    storageService.deleteImage(location.imageId);
                }
            }

            const dbLocation = await databaseService.updateLocation(location.$id, { ...data, username: userData.prefs.username, imageId: file?.$id });
            if (dbLocation) {
                //modify the image, lat and lng of all related measures
                dbLocation.measures.forEach(async (m) => {
                    await databaseService.updateMeasure(m.$id, { ...m, imageId: dbLocation.imageId })
                });

                navigate(`/locations`)
            }
        } else {

            if (previewImage) {
                file = await storageService.uploadImage(previewImage);
                if (file) {
                    data.imageId = file.$id;
                }
            }

            const dbLocation = await databaseService.addLocation({ ...data, userId: userData.$id, username: userData.prefs.username });
            if (dbLocation) {
                navigate(`/location/${dbLocation.$id}`);
            }

        }
    }

    const dateFormatter = date => {
        return formatDateTime(new Date(date)).slice(0, 10);
    };

    function canModify() {
        //it's a new Location, or this user is an admin, or the location was created by this user
        return !location || userData.labels.includes('admin') || userData.$id === location.userId;
    }

    function canDelete() {
        return location && userData.labels.includes('admin');
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

    const handleDelete = (e) => {
        e.preventDefault();
        setOpenModal(true);
    }

    const onDeleteLocation = async (e, location) => {
        //console.log('HERE');
        e.preventDefault();

        if (await deleteLocation(location)) {
            console.log('MeasureGroup deleted')
           // setToggle(!toggle);
        }
    }

    const [wqi, wqiText] = calculateWQILocation(location);
    const imageName = window.location.origin + '/' + (getMarkerColorLocation(location) ?? 'multiplemarker.png');


    return (
        <>
            <Link className='underline font-bold ' to={'/locations'}>
                {t('returnToMeasures')}
            </Link>

            <div className='mb-4 align-middle'>
                {!location && (
                    <label className='text-4xl pb-4'>{t('locationTitleNew')}</label>
                )}


                {location && (
                    <div>
                        <label className='text-4xl pb-4'>{location.name}</label><label className="ml-4 align-baseline font-extrabold text-red-600">{isDirty ? t('edited') : ''}</label>
                        <div>
                            <label className='text-sm'> {t('by') + ' ' + (location.username ? location.username : location.userId)}</label>
                        </div>
                    </div>
                )}


            </div>

            <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
                <div className='w-full h-72'>
                    <APIProvider apiKey={conf.googleMapsAPIKey}>
                        <Map mapId={'bf51a910020fa25c'}
                            zoom={conf.defaultZoomLevel}
                            center={centerPosition}
                            gestureHandling={'greedy'}
                            scaleControl={true}
                            disableDefaultUI={true}
                            onClick={(ev) => {
                                console.log('HERE2')
                                if (canModify()) {
                                    //console.log("latitide = ", ev.detail.latLng.lat);
                                    setValue("latitude", ev.detail.latLng.lat, { shouldDirty: true })
                                    //console.log("longitude = ", ev.detail.latLng.lng);
                                    setValue("longitude", ev.detail.latLng.lng, { shouldDirty: true });
                                    setMarkerPosition({ lat: ev.detail.latLng.lat, lng: ev.detail.latLng.lng })
                                }
                            }}>
                            <AdvancedMarker ref={markerRef} clickable={true} position={markerPosition}>
                                <img src={imageName} className="w-8" title={wqiText} />
                            </AdvancedMarker>
                        </Map>
                    </APIProvider>
                </div>

                <Accordion collapseAll className="w-full mt-4">
                    <Accordion.Panel>
                        <Accordion.Title>Edit</Accordion.Title>
                        <Accordion.Content>
                            <div className="w-full">
                                <Input label={t('locationName') + ' *'}
                                    disabled={!canModify()}
                                    className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                                    {...register("name", { required: true, maxLength: 255 })}
                                />

                                <Input label={t('locationLatitude') + ' *'}
                                    placeholder="(i.e. 45.4637979)"
                                    className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                                    {...register("latitude", { required: true, onChange: latitudeChangedHandler })}
                                />

                                <Input label={t('locationLongitude') + ' *'}
                                    placeholder="(i.e. 7.87375)"
                                    className={`mb-4 ${!canModify() ? 'bg-gray-200' : ''}`}
                                    {...register("longitude", { required: true, onChange: longitudeChangedHandler })}
                                />

                                {location && (<label className='mb-4 pl-1'>{t('locationLastUpdate') + ' ' + formatDateTime(lastUpdatedAt ? new Date(lastUpdatedAt) : new Date(location.$updatedAt))}</label>)}

                                {canModify() && (<>
                                    <Controller
                                        control={control}
                                        name={"image"}

                                        render={({ field: { value, onChange, ...field } }) => {
                                            return (
                                                <Input required={!location && conf.locationImageRequired === 'true'} {...field} name='image' label={location ? t('locationImage') : t('locationImage') + ' *'}
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
                                    {location && (previewImageUrl || location.imageId) && (
                                        <div className="w-full mb-4">
                                            <img src={previewImageUrl ? previewImageUrl : storageService.getPreviewImageUrl(location.imageId)} alt={location.description} className="rounded-lg w-full object-cover" />
                                        </div>
                                    )}
                                    {!location && (
                                        <div className="w-full mb-4">
                                            <img src={previewImageUrl} alt={getValues('description')} className="rounded-lg w-full object-cover" />
                                        </div>
                                    )}

                                </div>
                            </div>
                        </Accordion.Content>
                    </Accordion.Panel>
                </Accordion>

                {canModify() && isDirty && (
                    <>
                        <Button type="submit" bgColor={location ? "bg-casaleggio-rgba" : "bg-casaleggio-btn-rgba"} className="w-full md:mt-8">
                            {location ? t('locationUpdate') : t('locationCreate')}
                        </Button>
                        {location && (<label className='font-thin'>{t('locationExplaination')}</label>)}
                    </>
                )}

                {canDelete() && (
                    <>
                        <Button className="w-full md:mt-8 bg-red-600" onClick={handleDelete}>
                            {t('measuresDelete')}
                        </Button>
                    </>
                )}

                <Modal show={openModal} onClose={() => setOpenModal(false)} popup>                    
                    <Modal.Header />
                    <Modal.Body>
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                {t('deleteLocationModalDescription1')}
                            </h3>
                            <h6 className='text-base font-thin leading-relaxed text-gray-500 dark:text-gray-400'>
                                {t('deleteLocationModalDescription2')}
                            </h6>
                            <div className="flex justify-center gap-4 mt-8">

                                <Button className="bg-red-600" onClick={(e) => {
                                    onDeleteLocation(e, location);
                                    setOpenModal(false)
                                }}>
                                    {t('deleteLocationModalDeleteAll')}
                                </Button>
                                <Button color="gray" onClick={() => {
                                    setOpenModal(false)
                                }}>
                                    {t('deleteModalCancel')}
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer />
                </Modal>


                <div className='w-full'>

                    {location && (
                        <div className='mt-8'>

                            <div className='text-right'>
                                <Button onClick={handleAddMeasureToLocation} className='duration-200 bg-green-500 hover:bg-casaleggio-btn-rgba w-full md:w-1/4'>
                                    {t('locationAddMeasure')}
                                </Button>
                            </div>

                            {location.measures?.length > 0 && (<>
                                {/* <div className='flex flex-wrap max-h-64 mt-4 px-4 pb-4 bg-casaleggio-rgba  border border-black/10 overflow-x-hidden overflow-y-scroll'> */}

                                <Table striped className="mt-4">
                                    <Table.Head>
                                        <Table.HeadCell>
                                            <span className="sr-only">Icon</span>
                                        </Table.HeadCell>
                                        <Table.HeadCell>{t('measureDescription')}</Table.HeadCell>
                                        <Table.HeadCell>{t('measureDate')}</Table.HeadCell>
                                        <Table.HeadCell colSpan={2}>{t('measureActions')}</Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y">
                                        {location.measures.sort(function (a, b) {
                                            return new Date(a.datetime) - new Date(b.datetime);
                                        }).map(
                                            (measure) => {
                                                const [wqi, wqiText] = calculateWQI(measure);
                                                return (
                                                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={measure.$id}>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            <img src={window.location.origin + '/' + getMarkerColor(measure)} className="w-10" title={t(wqiText)} />
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            {measure.placeDescription?.slice(0, 50) + (measure.placeDescription?.length > 50 ? '...' : '')}
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            {formatDateTime(new Date(measure.datetime))}
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            <Link to={`/measure/${measure.$id}`}><IoOpenOutline className='size-6' /></Link>
                                                        </Table.Cell>
                                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                                            {canModify() && (<Link onClick={(e) => handleDeleteMeasure(e, measure)}><IoTrash className='size-6' /></Link>)}
                                                        </Table.Cell>
                                                    </Table.Row>
                                                )
                                            }
                                        )}

                                    </Table.Body>
                                </Table>
                                {/* </div> */}

                                <div className='my-16'>
                                    <MeasureChart values={location.measures.sort(function (a, b) {
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

export default LocationForm