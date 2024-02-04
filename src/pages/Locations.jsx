import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Input from '../components/Input';
import Container from '../components/Container';
import { conf } from "../conf/conf.js";
//import LocationMarker from '../components/LocationMarker';
//import ReportMarker from '../components/ReportMarker';
import databaseService from '../appwrite/database';
import _ from 'lodash';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, ScaleControl  } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { divIcon, Icon, point } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import storageService from '../appwrite/storage';
import { formatDateTime } from '../utils/date';
import { Link } from 'react-router-dom';
import MeasureChart from '../components/MeasureChart';
import { calculateWQILocation, getLocationIcon, getMarkerColorLocation } from '../utils/wqi';
import { Accordion, Table } from 'flowbite-react';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function Locations({ type = '' }) {

    const { t } = useTranslation();
    const [showYourDataOnly, setShowYourDataOnly] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [limit, setLimit] = useState(50)
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [measureNumber, setMeasureNumber] = useState(0);
    const [searchText, setSearchText] = useState();
    const userData = useSelector((state) => state.auth.userData);

    const filteredReports = useRef([]);
    const sortedReports = useRef([]);
    const filteredLocations = useRef([]);
    const sortedLocations = useRef([]);

    const warningIcon = new Icon({
        // iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
        iconUrl: window.location.origin + '/warning.png',
        iconSize: [36, 31] // size of the icon
    });

    const createClusterCustomIcon = function (cluster) {
        return new divIcon({
            html: `<span style="background-color: rgba(150, 181, 102, 1);height: 2em;width: 2em;color: #fff;display: flex;align-items: center;justify-content: center;border-radius: 50%;font-size: 1.2rem;box-shadow: 0 0 0px 5px #fff;">${cluster.getChildCount()}</span>`,
            className: "custom-marker-cluster",
            iconSize: point(33, 33, true)
        });
    };


    useEffect(() => {

        if (userData && userData.prefs) {
            //console.log('Loading data from userdata.prefs' + JSON.stringify(userData.prefs));
            setShowYourDataOnly(userData.prefs.showYourDataOnly ?? false);
            setShowReports(userData.prefs.showReports ?? true);
        }

    }, [userData])


    useEffect(() => {

        const currentUserId = userData.$id;

        const measureLocationsNumberToShow = userData?.prefs.myLocationsNumber && userData?.prefs.myLocationsNumber > 0 ? userData?.prefs.myLocationsNumber : conf.lastModifiedLocationsNumber;
        const reportsNumberToShow = userData?.prefs.myReportsNumber && userData?.prefs.myReportsNumber > 0 ? userData?.prefs.myReportsNumber : conf.lastInsertedReportsNumber

        if (type === '') {
            databaseService.getAllLocations(showYourDataOnly ? currentUserId : null,
                searchText,
                limit)
                .then((returnedLocations) => {

                    //console.log(JSON.stringify(returnedLocations))

                    if (returnedLocations) {
                        sortedLocations.current = returnedLocations.documents.slice(0, measureLocationsNumberToShow);
                        filteredLocations.current = returnedLocations.documents.filter((l) => {
                            return hasMeasuresInInterval(l)
                        })
                    }

                    if (showReports) {
                        databaseService.getAllReports(showYourDataOnly ? currentUserId : null, searchText, limit)
                            .then((returnedReports) => {
                                //console.log('Reports: ' + returnedReports.documents.length)
                                sortedReports.current = returnedReports.documents.slice(0, reportsNumberToShow);
                                filteredReports.current = returnedReports.documents;
                                setMeasureNumber(filteredLocations.current.length + filteredReports.current.length);
                            })
                    } else {
                        filteredReports.current.length = 0
                        setMeasureNumber(filteredLocations.current.length)
                    }
                })

        } else if (type == 'mylocations') {

            databaseService.getAllLocations(currentUserId, searchText, limit)
                .then((returnedLocations) => {
                    sortedLocations.current = returnedLocations.documents.slice(0, measureLocationsNumberToShow);
                    filteredLocations.current = returnedLocations.documents.filter((l) => {
                        return hasMeasuresInInterval(l, currentUserId)
                    })

                    setMeasureNumber(filteredLocations.current.length);
                })

        } else if (type == 'mymeasures') {

            databaseService.getMeasuresByUserId(currentUserId, searchText, limit)
                .then((returnedMeasures) => {
                    const locationsWithMyMeasures = [];

                    for (let index = 0; index < returnedMeasures.documents.length; index++) {
                        const m = returnedMeasures.documents[index];
                        databaseService.getLocation(m.location.$id).then((l) => {
                            //console.log(l)
                            locationsWithMyMeasures.push(l)
                            //console.log('LocationsWithMy: ' + index + ' ---- ' + JSON.stringify(locationsWithMyMeasures))

                            if (index === returnedMeasures.documents.length - 1) {
                                sortedLocations.current = locationsWithMyMeasures.slice(0, measureLocationsNumberToShow);
                                filteredLocations.current = locationsWithMyMeasures.filter((l) => {
                                    return hasMeasuresInInterval(l)
                                })

                                setMeasureNumber(filteredLocations.current.length)
                            }
                        })
                    }
                })

        } else if (type == 'myreports') {

            databaseService.getAllReports(currentUserId, searchText, limit)
                .then((returnedReports) => {
                    sortedReports.current = returnedReports.documents.slice(0, reportsNumberToShow);
                    filteredReports.current = returnedReports.documents.filter((r) => {
                        var dt = new Date(r.datetime).getTime();

                        return (!dateFrom || dt >= new Date(dateFrom).getTime()) &&
                            (!dateTo || dt <= new Date(dateTo).getTime())
                    });

                    setMeasureNumber(filteredReports.current.length);
                })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showYourDataOnly, userData, dateFrom, dateTo, showReports, type, limit, searchText]);


    function hasMeasuresInInterval(location, userId = null) {
        if (!dateFrom && !dateTo) return true;

        if (dateFrom && dateTo) {
            const df = new Date(dateFrom).getTime();
            const dt = new Date(dateTo).getTime();

            return location.measures.filter(m => {
                const mdate = new Date(m.datetime).getTime();
                return mdate >= df && mdate <= dt && (userId === null || m.userId === userId)
            }).length > 0;
        } else if (dateFrom) {
            const df = new Date(dateFrom).getTime();

            return location.measures.filter(m => {
                const mdate = new Date(m.datetime).getTime();
                return mdate >= df && (userId === null || m.userId === userId);
            }).length > 0;
        } else if (dateTo) {
            const dt = new Date(dateTo).getTime();

            return location.measures.filter(m => {
                const mdate = new Date(m.datetime).getTime();
                return mdate <= dt && (userId === null || m.userId === userId);
            }).length > 0;
        }
    }

    function getTitle(type) {
        switch (type) {
            case 'mylocations':
                return t('myLocations');
            case 'mymeasures':
                return t('myMeasures');
            case 'myreports':
                return t('myReports');
            default:
                return ''
        }
    }

    const handleChangeLimit = (e) => {
        setLimit(e.target.value)
    }

    const handleChangeShowYourDataOnly = () => {
        setShowYourDataOnly(!showYourDataOnly)
    }

    const handleChangeShowReports = () => {
        setShowReports(!showReports)
    }

    const onSearchTextChange = useMemo(
        () =>
            _.debounce((e) => {
                setSearchText(e.target.value)
            }, 1000),
        []
    );




    return (

        <Container>
            <Accordion collapseAll className="w-full mt-4">
                <Accordion.Panel>
                    <Accordion.Title>{t('filtersTitle')}</Accordion.Title>
                    <Accordion.Content>
                    <div className='w-full'>
                <div className='m-4'>
                    <label className='font-bold text-4xl pb-4'>{getTitle(type)}</label>
                </div>

                {(type === '') && (

                    <div className='flex flex-wrap w-full justify-between pr-8 sm:pr-0'>
                        <div className='mt-2 h-8'>
                            <input type="checkbox" checked={showYourDataOnly} id='onlyYourLocations' label={t('measuresShowYourLocationsOnly')} className="-mt-1 mr-2" onChange={handleChangeShowYourDataOnly} />
                            <label className="mb-4 mr-4" htmlFor='onlyYourLocations'>{t('measuresShowYourLocationsOnly')}</label>
                        </div>

                        <div className='mt-2 h-8'>
                            <input type="checkbox" checked={showReports} id='showReports' label={t('measuresShowReports')} className="-mt-1 mr-2" onChange={handleChangeShowReports} />
                            <label className="mb-4 mr-4" htmlFor='showReports'>{t('measuresShowReports')}</label>
                        </div>

                        <div className=''>
                            <label className="mb-4 mr-4" htmlFor='limit'>{t('limitLabel')}</label>
                            <select className=' -indent-0 ' id='limit' value={limit} onChange={handleChangeLimit}>
                                <option>25</option>
                                <option>50</option>
                                <option>75</option>
                                <option>100</option>
                            </select>
                        </div>

                    </div>
                )}

                <div className='flex flex-wrap mt-2 pr-8 sm:pr-0'>
                    <div className='mt-2 sm:w-1/3 pr-2'>
                        <Input className="" label={t('measuresFrom')} type="datetime-local" onChange={(e) => {
                            setDateFrom(e.target.value);
                        }} />
                    </div>

                    <div className='mt-2 sm:w-1/3 px-2'>
                        <Input className="" label={t('measuresTo')} type="datetime-local" onChange={(e) => {
                            setDateTo(e.target.value);
                        }} />
                    </div>


                    <div className='mt-2 sm:w-1/3 pl-2' >
                        <Input type='text' className="mr-2" label={t('measuresSearch')} onKeyDown={onSearchTextChange} />
                    </div>

                    <div className='flex items-center justify-end w-full h-16 align-middle'>
                        <label className="text-right font-extrabold">{t('measuresResults') + ' ' + measureNumber}</label>
                    </div>

                </div>


            </div>
                    </Accordion.Content>
                </Accordion.Panel>
            </Accordion>

            

            <div className='w-full mb-4'>
                <MapContainer className='h-[70vh] mr-8 sm:mr-0' center={[defaultLatitude, defaultLongitude]} zoom={conf.defaultZoomLevel}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ScaleControl imperial={false} position="bottomleft" />
                    <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false}>

                        {/* {console.log('Filter:' + JSON.stringify(filteredLocations.current))} */}

                        {filteredLocations.current.map((l) => {

                            return (
                                <Marker key={'l_' + l.$id} position={[l.latitude, l.longitude]} icon={getLocationIcon(l)}>
                                    <Popup>
                                        <div className='w-[300px]'>
                                            <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
                                                <Link className='underline font-bold' to={`/location/${l.$id}`}>{l.name}</Link>
                                            </div>
                                            <div className='w-full text-md text-right font-bold'>
                                                {l.measures?.length + ' ' + ((l.measures?.length == 0 || l.measures?.length > 1) ? t('measuresLabel') : t('measureLabel'))}
                                            </div>
                                            <div>
                                                <MeasureChart height={200} values={l.measures?.sort(function (a, b) {
                                                    return new Date(a.datetime) - new Date(b.datetime);
                                                })} />
                                            </div>
                                        </div>
                                    </Popup>
                                    <Tooltip>{t(calculateWQILocation(l)[1])}</Tooltip>
                                </Marker>
                            )
                        })}

                        {filteredReports.current.map((r) => {
                            return (
                                <Marker key={'r_' + r.$id} position={[r.latitude, r.longitude]} icon={warningIcon}>
                                    <Popup>
                                        <div className='w-[300px]'>
                                            <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
                                                <Link className='underline font-bold' to={`/report/${r.$id}`}>{r.title}</Link>
                                            </div>
                                            <div className='w-full text-md text-right font-bold '>
                                                {formatDateTime(new Date(r.datetime))}
                                            </div>
                                            <div>
                                                <p className='my-2 text-wrap text-justify' >{r.description}</p>
                                            </div>
                                            <div className='w-48 mx-auto'>
                                                <img src={storageService.getPreviewImageUrl(r.imageId)} alt={r.title} className='rounded-lg w-48 object-fill' />
                                            </div>
                                        </div>
                                    </Popup>
                                    <Tooltip>{r.title}</Tooltip>
                                </Marker>
                            )
                        })}
                    </MarkerClusterGroup>

                </MapContainer>
            </div>

        </Container>



        // <div className='flex flex-wrap'>
        //     <div className='w-full py-8'>
        //         <Container>
        //             <div className='m-4'>
        //                 <label className='font-bold text-4xl pb-4'>{getTitle(type)}</label>
        //             </div>

        //             {(type === '') && (<div className='flex'>
        //                 <div className='flex flex-wrap w-full'>
        //                     <div className='sm:w-1/4 mt-2'>
        //                         <input type="checkbox" checked={showYourDataOnly} id='onlyYourLocations' label={t('measuresShowYourLocationsOnly')} className="-mt-1 mr-2" onChange={handleChangeShowYourDataOnly} />
        //                         <label className="mb-4 mr-4" htmlFor='onlyYourLocations'>{t('measuresShowYourLocationsOnly')}</label>
        //                     </div>

        //                     <div className='sm:w-1/4 mt-2'>
        //                         <input type="checkbox" checked={showReports} id='showReports' label={t('measuresShowReports')} className="-mt-1 mr-2" onChange={handleChangeShowReports} />
        //                         <label className="mb-4 mr-4" htmlFor='showReports'>{t('measuresShowReports')}</label>
        //                     </div>

        //                     <div className='sm:w-1/4'>
        //                         <label className="mb-4 mr-4" htmlFor='limit'>{t('limitLabel')}</label>
        //                         <select className='mr-2 indent-0 -p-8' id='limit' value={limit} onChange={handleChangeLimit}>
        //                             <option>25</option>
        //                             <option>50</option>
        //                             <option>75</option>
        //                             <option>100</option>
        //                         </select>
        //                     </div>

        //                     <div className='sm:w-1/4 mt-2'>
        //                         <label className="mb-4 mr-4 font-extrabold">{t('measuresResults') + ' ' + measureNumber}</label>
        //                     </div>
        //                 </div>
        //             </div>)}

        //             <div className='flex flex-wrap'>
        //                 <div className='sm:w-1/4 pr-2'>
        //                     <Input className="" label={t('measuresFrom')} type="datetime-local" onChange={(e) => {
        //                         setDateFrom(e.target.value);
        //                     }} />
        //                 </div>

        //                 <div className='sm:w-1/4 pr-2'>
        //                     <Input className="" label={t('measuresTo')} type="datetime-local" onChange={(e) => {
        //                         setDateTo(e.target.value);
        //                     }} />
        //                 </div>


        //                 <div className='sm:w-1/4 pr-2' >
        //                     <Input type='text' className="mr-2" label={t('measuresSearch')} onKeyDown={onSearchTextChange} />
        //                 </div>

        //                 {type != '' && (<div className='sm:w-1/4 mt-2 flex text-right'>
        //                     <label className="mb-4 mr-4 text-right font-extrabold">{t('measuresResults') + ' ' + measureNumber}</label>
        //                 </div>)}
        //             </div>
        //         </Container >

        //         <div className='w-full'>
        //             <MapContainer className='h-[80vh] m-4' center={[defaultLatitude, defaultLongitude]} zoom={conf.defaultZoomLevel}>
        //                 <TileLayer
        //                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        //                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        //                 />
        //                 <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon} showCoverageOnHover={false}>

        //                     {/* {console.log('Filter:' + JSON.stringify(filteredLocations.current))} */}

        //                     {filteredLocations.current.map((l) => {

        //                         return (
        //                             <Marker key={'l_' + l.$id} position={[l.latitude, l.longitude]} icon={getLocationIcon(l)}>
        //                                 <Popup>
        //                                     <div className='w-[300px]'>
        //                                         <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
        //                                             <Link className='underline font-bold' to={`/location/${l.$id}`}>{l.name}</Link>
        //                                         </div>
        //                                         <div className='w-full text-md text-right font-bold'>
        //                                             {l.measures?.length + ' ' + ((l.measures?.length == 0 || l.measures?.length > 1) ? t('measuresLabel') : t('measureLabel'))}
        //                                         </div>
        //                                         <div>
        //                                             <MeasureChart height={200} values={l.measures?.sort(function (a, b) {
        //                                                 return new Date(a.datetime) - new Date(b.datetime);
        //                                             })} />
        //                                         </div>
        //                                     </div>
        //                                 </Popup>
        //                                 <Tooltip>{t(calculateWQILocation(l)[1])}</Tooltip>
        //                             </Marker>
        //                         )
        //                     })}

        //                     {filteredReports.current.map((r) => {
        //                         return (
        //                             <Marker key={'r_' + r.$id} position={[r.latitude, r.longitude]} icon={warningIcon}>
        //                                 <Popup>
        //                                     <div className='w-[300px]'>
        //                                         <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
        //                                             <Link className='underline font-bold' to={`/report/${r.$id}`}>{r.title}</Link>
        //                                         </div>
        //                                         <div className='w-full text-md text-right font-bold '>
        //                                             {formatDateTime(new Date(r.datetime))}
        //                                         </div>
        //                                         <div>
        //                                             <p className='my-2 text-wrap text-justify' >{r.description}</p>
        //                                         </div>
        //                                         <div className='w-48 mx-auto'>
        //                                             <img src={storageService.getPreviewImageUrl(r.imageId)} alt={r.title} className='rounded-lg w-48 object-fill' />
        //                                         </div>
        //                                     </div>
        //                                 </Popup>
        //                                 <Tooltip>{r.title}</Tooltip>
        //                             </Marker>
        //                         )
        //                     })}
        //                 </MarkerClusterGroup>

        //             </MapContainer>
        //         </div>
        //         {/* <div className='w-full lg:w-1/4 max-w-2'>
        //             <Table striped className="mt-4 h-[80vh] table-fixed" >
        //                 <Table.Head>
        //                     <Table.HeadCell className='w-[90px]'>
        //                         <span className="sr-only">Icon</span>
        //                     </Table.HeadCell>
        //                     <Table.HeadCell className='w-[190px] '>{t('locationName')}</Table.HeadCell>
        //                     <Table.HeadCell className='w-[150px]'>{t('locationLastUpdate')}</Table.HeadCell>                            
        //                 </Table.Head>
        //                 <Table.Body className="divide-y h-[50vh]" >
        //                     {filteredLocations.current.map(
        //                         (l) => {
        //                             const [wqi, wqiText] = calculateWQILocation(l);
        //                             return (
        //                                 <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800 " key={l.$id}>
        //                                     <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
        //                                         <img src={window.location.origin + '/' + getMarkerColorLocation(l)} className="w-[30px] h-[30px]" title={t(wqiText)} />
        //                                     </Table.Cell>
        //                                     <Table.Cell className="whitespace-break-spaces font-medium text-gray-900 dark:text-white">
        //                                         {l.name}
        //                                     </Table.Cell>
        //                                     <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
        //                                         {formatDateTime(new Date(l.$updatedAt))}
        //                                     </Table.Cell>                                            
        //                                 </Table.Row>
        //                             )
        //                         }
        //                     )}

        //                 </Table.Body>
        //             </Table>
        //         </div> */}


        //     </div>

        //     <div className='w-1/4 bg-casaleggio-rgba' />
        // </div>
    )
}

export default Locations