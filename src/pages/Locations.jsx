import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Input from '../components/Input';
import Container from '../components/Container';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { conf } from "../conf/conf.js";
import LocationMarker from '../components/LocationMarker';
import ReportMarker from '../components/ReportMarker';
import databaseService from '../appwrite/database';
import LocationMarkers from '../components/LocationMarkers';

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;

function Locations({ type = '' }) {

    const { t } = useTranslation();
    const [showYourDataOnly, setShowYourDataOnly] = useState(false);
    const [showReports, setShowReports] = useState(true);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [measureNumber, setMeasureNumber] = useState();
    const [searchText, setSearchText] = useState();
    const userData = useSelector((state) => state.auth.userData);
    const [toggle, setToggle] = useState(false);

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

    useEffect(() => {

        const currentUserId = userData.$id;

        const measureLocationsNumberToShow = userData?.prefs.myLocationsNumber && userData?.prefs.myLocationsNumber > 0 ? userData?.prefs.myLocationsNumber : conf.lastModifiedLocationsNumber;
        const reportsNumberToShow = userData?.prefs.myReportsNumber && userData?.prefs.myReportsNumber > 0 ? userData?.prefs.myReportsNumber : conf.lastInsertedReportsNumber

        if (type === '') {
            databaseService.getAllLocations().then((returnedLocations) => {
                if (returnedLocations) {
                    sortedLocations.current = returnedLocations.documents.slice(0, measureLocationsNumberToShow);

                    filteredLocations.current = returnedLocations.documents.filter((l) => {

                        const firstCondition = (!showYourDataOnly || l.userId === currentUserId);
                        const secondCondition = (!searchText || l.name.toLowerCase().includes(searchText.toLowerCase()))
                        const thirdCondition = hasMeasuresInInterval(l)

                        // console.log('First: ' + firstCondition)
                        // console.log('Second: ' + secondCondition)
                        // console.log('Third: ' + thirdCondition)

                        return firstCondition && secondCondition && thirdCondition;

                    })

                    databaseService.getAllReports().then((returnedReports) => {
                        sortedReports.current = returnedReports.documents.slice(0, reportsNumberToShow);

                        filteredReports.current = returnedReports.documents.filter((r) => {
                            return showReports &&
                                (!showYourDataOnly || r.userId === currentUserId) &&
                                (!searchText || r.title.toLowerCase().includes(searchText.toLowerCase()) || r.description.toLowerCase().includes(searchText.toLowerCase()));
                        });

                        //console.log('Old:' + measureNumber + ' New:' + (filteredLocations.current.length + filteredReports.current.length));
                        setMeasureNumber(filteredLocations.current.length + filteredReports.current.length);
                    })
                }
            })

        } else if (type == 'mylocations') {

            databaseService.getLocationsByUserId(currentUserId).then((returnedLocations) => {
                sortedLocations.current = returnedLocations.documents.slice(0, measureLocationsNumberToShow);

                filteredLocations.current = returnedLocations.documents.filter((l) => {

                    const firstCondition = (!searchText || l.name.toLowerCase().includes(searchText.toLowerCase()))
                    const secondCondition = hasMeasuresInInterval(l, currentUserId)

                    // console.log('First: ' + firstCondition)
                    // console.log('Second: ' + secondCondition)
                    // console.log('Third: ' + thirdCondition)

                    return firstCondition && secondCondition;

                })

                setMeasureNumber(filteredLocations.current.length);
            })

        } else if (type == 'mymeasures') {

            databaseService.getAllLocations().then((returnedLocations) => {
                const locationsWithMyMeasures = returnedLocations.documents.filter((l) => {
                    return l.measures.some((m) => m.userId === currentUserId)
                })

                console.log('LocationsWithMyMeasures: ' + locationsWithMyMeasures.length)

                sortedLocations.current = locationsWithMyMeasures.slice(0, measureLocationsNumberToShow);

                filteredLocations.current = locationsWithMyMeasures.filter((l) => {
                    const firstCondition = (!searchText || l.name.toLowerCase().includes(searchText.toLowerCase()))
                    const secondCondition = hasMeasuresInInterval(l)

                    return firstCondition && secondCondition;
                })

                setMeasureNumber(filteredLocations.current.length)
            })



        } else if (type == 'myreports') {

            databaseService.getReportssByUserId(currentUserId).then((returnedReports) => {
                sortedReports.current = returnedReports.documents.slice(0, reportsNumberToShow);

                filteredReports.current = returnedReports.documents.filter((r) => {
                    var dt = new Date(r.datetime).getTime();

                    return (r.userId === currentUserId) &&
                        (!dateFrom || dt >= new Date(dateFrom).getTime()) &&
                        (!dateTo || dt <= new Date(dateTo).getTime()) &&
                        (!searchText || r.description.toLowerCase().includes(searchText.toLowerCase()) || r.title.toLowerCase().includes(searchText.toLowerCase()));
                });

                setMeasureNumber(filteredReports.current.length);
            })
        }
    }, [showYourDataOnly, userData, dateFrom, dateTo, searchText, measureNumber, showReports, type, toggle]);





    function getTitle(type) {
        switch (type) {
            case 'mymeasures':
                return t('myMeasures');
            case 'myreports':
                return t('myReports');
            default:
                return ''
        }
    }


    return (
        <div className='w-full py-8'>
            <Container>
                <div className='m-4'>
                    <label className='font-bold text-4xl pb-4'>{getTitle(type)}</label>
                </div>

                {(type === '') && (<div className='flex'>
                    <div className='flex flex-wrap w-full'>
                        <div className='sm:w-1/5 mt-2'>
                            <input type="checkbox" checked={showYourDataOnly} id='onlyYourLocations' label={t('measuresShowYourLocationsOnly')} className="-mt-1 mr-2" onChange={(e) => {
                                setShowYourDataOnly((prev) => !prev)
                            }} />
                            <label className="mb-4 mr-4" htmlFor='onlyYourLocations'>{t('measuresShowYourLocationsOnly')}</label>
                        </div>

                        <div className='sm:w-1/5 mt-2'>
                            <input type="checkbox" checked={showReports} id='showReports' label={t('measuresShowReports')} className="-mt-1 mr-2" onChange={(e) => {
                                setShowReports((prev) => !prev)
                            }} />
                            <label className="mb-4 mr-4" htmlFor='showReports'>{t('measuresShowReports')}</label>
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
                        <Input className="mr-2" label={t('measuresSearch')} onChange={(e) => {
                            setSearchText(e.target.value);
                        }} />
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

                         {filteredReports.current?.map((report) => (
                            <div className='p-2 w-1/4' key={report.$id}>
                                <ReportMarker report={report} clickable={true} />
                            </div>
                        ))}



                        {filteredLocations.current?.map((loc) => (
                            <div className='p-2 w-1/4' key={loc.$id}>
                                <LocationMarker location={loc} clickable={true} />
                            </div>
                        ))} 
                        

                    </Map>
                </APIProvider>
            </Container>
        </div>
    )
}

export default Locations