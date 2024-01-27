import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Input from '../components/Input';
import Container from '../components/Container';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { conf } from "../conf/conf.js";
//import LocationMarker from '../components/LocationMarker';
//import ReportMarker from '../components/ReportMarker';
import databaseService from '../appwrite/database';
import Markers from '../components/Markers';
import _ from 'lodash';

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
                        console.log('HERE')
                        databaseService.getAllReports(showYourDataOnly ? currentUserId : null, searchText, limit)
                            .then((returnedReports) => {
                                console.log('Reports: ' + returnedReports.documents.length)
                                sortedReports.current = returnedReports.documents.slice(0, reportsNumberToShow);
                                filteredReports.current = returnedReports.documents;
                                setMeasureNumber(filteredLocations.current.length + filteredReports.current.length);
                            })
                    } else {
                        console.log('THERE')
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
                    const locationsWithMyMeasures = returnedMeasures.documents.map((m) => databaseService.getLocation(m.location.$id))
                    sortedLocations.current = locationsWithMyMeasures.slice(0, measureLocationsNumberToShow);
                    filteredLocations.current = locationsWithMyMeasures.filter((l) => {
                        return hasMeasuresInInterval(l)
                    })

                    setMeasureNumber(filteredLocations.current.length)
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
        <div className='w-full py-8'>
            <Container>
                <div className='m-4'>
                    <label className='font-bold text-4xl pb-4'>{getTitle(type)}</label>
                </div>

                {(type === '') && (<div className='flex'>
                    <div className='flex flex-wrap w-full'>
                        <div className='sm:w-1/5 mt-2'>
                            <input type="checkbox" checked={showYourDataOnly} id='onlyYourLocations' label={t('measuresShowYourLocationsOnly')} className="-mt-1 mr-2" onChange={handleChangeShowYourDataOnly} />
                            <label className="mb-4 mr-4" htmlFor='onlyYourLocations'>{t('measuresShowYourLocationsOnly')}</label>
                        </div>

                        <div className='sm:w-1/5 mt-2'>
                            <input type="checkbox" checked={showReports} id='showReports' label={t('measuresShowReports')} className="-mt-1 mr-2" onChange={handleChangeShowReports} />
                            <label className="mb-4 mr-4" htmlFor='showReports'>{t('measuresShowReports')}</label>
                        </div>

                        <div className='sm:w-1/5'>
                            <label className="mb-4 mr-4" htmlFor='limit'>{t('limitLabel')}</label>
                            <select className='mr-2 indent-0' id='limit' value={limit} onChange={handleChangeLimit}>
                                <option>25</option>
                                <option>50</option>
                                <option>75</option>
                                <option>100</option>
                            </select>
                        </div>

                        <div className='sm:w-1/5 mt-2'>
                            <label className="mb-4 mr-4 font-extrabold">{t('measuresResults') + ' ' + measureNumber}</label>
                        </div>
                    </div>
                </div>)}

                <div className='flex flex-wrap'>
                    <div className='sm:w-1/4 pr-2'>
                        <Input className="" label={t('measuresFrom')} type="datetime-local" onChange={(e) => {
                            setDateFrom(e.target.value);
                        }} />
                    </div>

                    <div className='sm:w-1/4 pr-2'>
                        <Input className="" label={t('measuresTo')} type="datetime-local" onChange={(e) => {
                            setDateTo(e.target.value);
                        }} />
                    </div>


                    <div className='sm:w-1/4 pr-2' >
                        <Input type='text' className="mr-2" label={t('measuresSearch')} onKeyDown={onSearchTextChange} />
                    </div>

                    {type != '' && (<div className='sm:w-1/4 mt-2 flex text-right'>
                        <label className="mb-4 mr-4 text-right font-extrabold">{t('measuresResults') + ' ' + measureNumber}</label>
                    </div>)}
                </div>
            </Container >

            <Container>
                <APIProvider apiKey={conf.googleMapsAPIKey}>
                    <Map className='h-[500px] mt-6'
                        mapId={'bf51a910020fa25a'}
                        zoom={conf.defaultZoomLevel}
                        center={{ lat: defaultLatitude, lng: defaultLongitude }}
                        gestureHandling={'greedy'}
                        scaleControl={true}
                        disableDefaultUI={true}>

                        <Markers locations={filteredReports.current} type='report' />

                        {/* <Markers locations={filteredLocations.current} type='location' />   */}
                       
                    </Map>
                </APIProvider>
            </Container>
        </div>
    )
}

export default Locations