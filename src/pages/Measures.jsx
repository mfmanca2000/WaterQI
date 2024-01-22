import React, { useEffect, useRef, useState } from 'react'
import { conf } from "../conf/conf.js"
import databaseService from '../appwrite/database'
import Container from '../components/Container'
import MeasureCard from '../components/MeasureCard'
import { APIProvider, Map } from '@vis.gl/react-google-maps'
import MeasureMarker from '../components/MeasureMarker'
import MeasureGroupMarker from '../components/MeasureGroupMarker'
import { useSelector } from "react-redux"
import Input from '../components/Input.jsx'
import MeasureGroupCard from '../components/MeasureGroupCard.jsx'
import { useTranslation } from 'react-i18next'
import ReportMarker from '../components/ReportMarker.jsx'
import ReportCard from '../components/ReportCard.jsx'
import { deleteMeasure, deleteMeasureGroup, deleteReport } from '../utils/dataAccess.js'

const defaultLatitude = conf.defaultLatitude;
const defaultLongitude = conf.defaultLongitude;


function Measures({ type = '' }) {
    const filteredStandaloneMeasures = useRef([]);
    const sortedStandaloneMeasures = useRef([]);
    const filteredMeasureGroups = useRef([]);
    const sortedMeasureGroups = useRef([]);
    const filteredReports = useRef([]);
    const sortedReports = useRef([]);
    const { t } = useTranslation();
    const [showYourDataOnly, setShowYourDataOnly] = useState(false);
    const [showMeasures, setShowMeasures] = useState(true);
    const [showMeasureGroups, setShowMeasureGroups] = useState(true);
    const [showReports, setShowReports] = useState(true);
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);
    const [measureNumber, setMeasureNumber] = useState();
    const [searchText, setSearchText] = useState();
    const userData = useSelector((state) => state.auth.userData);
    const [toggle, setToggle] = useState(false);

    useEffect(() => {

        if (userData && userData.prefs) {
            //console.log('Loading data from userdata.prefs' + JSON.stringify(userData.prefs));
            setShowYourDataOnly(userData.prefs.showYourDataOnly ?? false);
            setShowMeasures(userData.prefs.showStandaloneMeasures ?? true);
            setShowMeasureGroups(userData.prefs.showMeasureGroups ?? true);
            setShowReports(userData.prefs.showReports ?? true);
        }

    }, [userData])


    useEffect(() => {
        
        const currentUserId = userData.$id;

        const measuresNumberToShow = userData?.prefs.myMeasuresNumber && userData?.prefs.myMeasuresNumber > 0 ? userData?.prefs.myMeasuresNumber : conf.lastInsertedMeasuresNumber;
        const measureGroupsNumberToShow = userData?.prefs.myMeasureGroupsNumber && userData?.prefs.myMeasureGroupsNumber > 0 ? userData?.prefs.myMeasureGroupsNumber : conf.lastModifiedMeasureGroupsNumber;
        const reportsNumberToShow = userData?.prefs.myReportsNumber && userData?.prefs.myReportsNumber > 0 ? userData?.prefs.myReportsNumber : conf.lastInsertedReportsNumber

        if (type === '') {
            //console.log('ALL');

            databaseService.getAllMeasures().then((returnedMeasures) => {
                if (returnedMeasures) {                                    

                    sortedStandaloneMeasures.current = returnedMeasures.documents.slice(0, measuresNumberToShow);                    

                    filteredStandaloneMeasures.current = returnedMeasures.documents.filter((m) => {
                        var dt = new Date(m.datetime).getTime();
                        //console.log(m.placeDescription + ': ' + m.datetime + ' -- DateFrom:' + dateFrom + ' --> ' + ((!onlyUserMeasures || m.userId === currentUserId) && (!dateFrom || new Date(m.datetime).getTime > new Date(dateFrom))))   

                        return showMeasures &&
                            (!m.measureGroup) &&
                            (!showYourDataOnly || m.userId === currentUserId) &&
                            (!dateFrom || dt >= new Date(dateFrom).getTime()) &&
                            (!dateTo || dt <= new Date(dateTo).getTime()) &&
                            (!searchText || m.placeDescription.toLowerCase().includes(searchText.toLowerCase()));
                    });


                    databaseService.getAllMeasureGroups().then((returnedMeasureGroups) => {
                        sortedMeasureGroups.current = returnedMeasureGroups.documents.slice(0, measureGroupsNumberToShow);

                        filteredMeasureGroups.current = returnedMeasureGroups.documents.filter((mg) => {
                            return showMeasureGroups &&
                                (!showYourDataOnly || mg.userId === currentUserId) &&
                                (!searchText || mg.description.toLowerCase().includes(searchText.toLowerCase()));
                        });

                        //console.log('How many are left? ' + (filteredStandaloneMeasures.current.length + filteredMeasureGroups.current.length));


                        databaseService.getAllReports().then((returnedReports) => {
                            sortedReports.current = returnedReports.documents.slice(0, reportsNumberToShow);

                            filteredReports.current = returnedReports.documents.filter((r) => {
                                return showReports &&
                                    (!showYourDataOnly || r.userId === currentUserId) &&
                                    (!searchText || r.title.toLowerCase().includes(searchText.toLowerCase()) || r.description.toLowerCase().includes(searchText.toLowerCase()));
                            });

                            console.log('Old:' + measureNumber + ' Nes:' + (filteredStandaloneMeasures.current.length + filteredMeasureGroups.current.length + filteredReports.current.length));
                            setMeasureNumber(filteredStandaloneMeasures.current.length + filteredMeasureGroups.current.length + filteredReports.current.length);
                        })
                    });


                }
            })
        } else if (type == 'mymeasures') {

            databaseService.getMeasuresByUserId(currentUserId).then((returnedMeasures) => {
                sortedStandaloneMeasures.current = returnedMeasures.documents.slice(0, measuresNumberToShow);                

                filteredStandaloneMeasures.current = returnedMeasures.documents.filter((m) => {
                    var dt = new Date(m.datetime).getTime();

                    return (m.userId === currentUserId) &&
                        (!dateFrom || dt >= new Date(dateFrom).getTime()) &&
                        (!dateTo || dt <= new Date(dateTo).getTime()) &&
                        (!searchText || m.placeDescription.toLowerCase().includes(searchText.toLowerCase()));
                });

                setMeasureNumber(filteredStandaloneMeasures.current.length);
            })
        } else if (type == 'mymeasuregroups') {

            databaseService.getMeasureGroupsByUserId(currentUserId).then((returnedMeasureGroups) => {
                sortedMeasureGroups.current = returnedMeasureGroups.documents.slice(0, measureGroupsNumberToShow);                

                filteredMeasureGroups.current = returnedMeasureGroups.documents.filter((mg) => {
                    return (mg.userId === currentUserId) &&
                        (!searchText || mg.description.toLowerCase().includes(searchText.toLowerCase()));
                });

                //console.log('How many are left? ' + (filteredStandaloneMeasures.current.length + filteredMeasureGroups.current.length));
                setMeasureNumber(filteredMeasureGroups.current.length);
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
    }, [showYourDataOnly, userData, dateFrom, dateTo, filteredStandaloneMeasures, searchText, measureNumber, showMeasures, showMeasureGroups, showReports, type, toggle]);




    const onDeleteStandaloneMeasure = async (e, measure) => {
        e.preventDefault();
                 
        if (await deleteMeasure(measure)) {                    
            if(showMeasures){
                console.log('passing by here');
                setToggle(! toggle);
            } 
        }
    }

    const onDeleteMeasureGroup = async (e, measureGroup, deleteAllMeasures) => {
        e.preventDefault();

        if (await deleteMeasureGroup(measureGroup, deleteAllMeasures)) {
            console.log('MeasureGroup deleted')
            if (showMeasureGroups) {
                setToggle(! toggle);
            } 
        }              
    }

    const onDeleteReport = async (e, report) => {
        e.preventDefault();

        if (await deleteReport(report)) {
            console.log('Report deleted')
            if (showReports) {
                setToggle(! toggle)
            }
        }
    }

    function getTitle(type) {
        switch (type) {
            case 'mymeasures':
                return t('myMeasures');
            // case 'mymeasuregroups':
            //     return t('myMeasureGroups');
            case 'mylocations':
                return t('mylocations');
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
                            <input type="checkbox" checked={showYourDataOnly} id='onlyYourMeasures' label={t('measuresShowYourDataOnly')} className="-mt-1 mr-2" onChange={(e) => {
                                setShowYourDataOnly((prev) => !prev)
                            }} />
                            <label className="mb-4 mr-4" htmlFor='onlyYourMeasures'>{t('measuresShowYourDataOnly')}</label>
                        </div>

                        <div className='sm:w-1/5 mt-2'>
                            <input type="checkbox" checked={showMeasureGroups} id='showMeasureGroups' label={t('measuresShowMeasureGroups')} className="-mt-1 mr-2" onChange={(e) => {
                                setShowMeasureGroups((prev) => !prev)
                            }} />
                            <label className="mb-4 mr-4" htmlFor='showMeasureGroups'>{t('measuresShowMeasureGroups')}</label>
                        </div>
                        <div className='sm:w-1/5 mt-2'>
                            <input type="checkbox" checked={showMeasures} id='showMeasures' label={t('measuresShowStandaloneMeasures')} className="-mt-1 mr-2" onChange={(e) => {
                                setShowMeasures((prev) => !prev)
                            }} />
                            <label className="mb-4 mr-4" htmlFor='showMeasures'>{t('measuresShowStandaloneMeasures')}</label>
                        </div>                        
                        <div className='sm:w-1/5 mt-2'>
                            <input type="checkbox" checked={showReports} id='showReports' label={t('measuresShowReports')} className="-mt-1 mr-2" onChange={(e) => {
                                setShowReports((prev) => !prev)
                            }} />
                            <label className="mb-4 mr-4" htmlFor='showReports'>{t('measuresShowReports')}</label>
                        </div>
                        <div className='sm:w-1/5 mt-2 text-right'>
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
                    <Map className='h-96 mt-6'
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

                        {filteredStandaloneMeasures.current?.map((measure) => (
                            <div className='p-2 w-1/4' key={measure.$id}>
                                <MeasureMarker measure={measure} clickable={true} />
                            </div>
                        ))}

                        {filteredMeasureGroups.current?.map((measureGroup) => (
                            <div className='p-2 w-1/4' key={measureGroup.$id}>
                                <MeasureGroupMarker measureGroup={measureGroup} clickable={true} />
                            </div>
                        ))}


                    </Map>
                </APIProvider>
            </Container>



            {(type === '' || type === 'mymeasuregroups') && (<> <Container>
                <div className='text-3xl mt-4 p-4 font-bold'>
                    {type === 'mymeasuregroups' ? t('myLastModifiedMeasureGroups') : t('measuresLastModifiedMeasureGroups')}
                </div>
            </Container>

                <Container>
                    <div className='flex flex-wrap mt-4'>
                        {sortedMeasureGroups.current?.map((measureGroup) => (
                            <div className='p-2 lg:w-1/4 sm:w-1/2' key={measureGroup.$id}>
                                <MeasureGroupCard measureGroup={measureGroup} onDelete={onDeleteMeasureGroup} />
                            </div>
                        ))}
                    </div>
                </Container>
            </>)}

            {(type === '' || type === 'mymeasures') && (<> <Container>
                <div className='text-3xl mt-4 p-4 font-bold'>
                    {type === 'mymeasures' ? t('myLastInsertedMeasures') : t('measuresLastInsertedMeasures')}
                </div>
            </Container>

                <Container>
                    <div className='flex flex-wrap mt-4'>
                        {sortedStandaloneMeasures.current?.map((measure) => (
                            <div className='p-2 lg:w-1/4 sm:w-1/2' key={measure.$id}>
                                <MeasureCard measure={measure} onDelete={onDeleteStandaloneMeasure} />
                            </div>
                        ))}
                    </div>
                </Container>
            </>)}

            {(type === '' || type === 'myreports') && (<> <Container>
                <div className='text-3xl mt-4 p-4 font-bold'>
                    {type === 'myreports' ? t('myLastInsertedReports') : t('measuresLastInsertedReports')}
                </div>
            </Container>

                <Container>
                    <div className='flex flex-wrap mt-4'>
                        {sortedReports.current?.map((report) => (
                            <div className='p-2 lg:w-1/4 sm:w-1/2' key={report.$id}>
                                <ReportCard report={report} onDelete={onDeleteReport} />
                            </div>
                        ))}
                    </div>
                </Container>
            </>)}


            <div className='text-gray-300 text-xs text-center w-full'>
                Map Markers by Hea Poh Lin from<a href="https://thenounproject.com/browse/icons/term/map-markers/" title="Map Markers Icons">Noun Project</a>
            </div>
        </div >



        //Map Markers by Hea Poh Lin from <a href="https://thenounproject.com/browse/icons/term/map-markers/" target="_blank" title="Map Markers Icons">Noun Project</a> (CC BY 3.0)
    )
}

export default Measures