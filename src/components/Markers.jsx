import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { InfoWindow } from './InfoWindow';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { calculateWQIMeasureGroup, getMarkerColorLocation } from '../utils/wqi';
import MeasureChart from './MeasureChart';
import storageService from '../appwrite/storage';
import { formatDateTime } from '../utils/date';

function Markers({ locations, type = 'location' }) {

    console.log('Type:' + type)

    const map = useMap();
    const [markers, setMarkers] = useState({});
    const [openFlagsArray, setOpenFlagsArray] = useState([]);
    const clusterer = useRef(null);
    const { t } = useTranslation();

    // Initialize MarkerClusterer
    useEffect(() => {
        if (!map) return;
        if (!clusterer.current) {
            clusterer.current = new MarkerClusterer({ map });
        }
    }, [map]);

    // Update markers
    useEffect(() => {
        clusterer.current?.clearMarkers();
        clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]);



    const setMarkerRef = (marker, key) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;

        setMarkers((prev) => {
            if (marker) {
                return { ...prev, [key]: marker };
            } else {
                const newMarkers = { ...prev };
                delete newMarkers[key];
                return newMarkers;
            }
        });
    };


    return (
        <>
        {console.log(locations)}
            {locations.map((loc) => (
                <div key={'div_' + loc.$id}>

                    <AdvancedMarker
                        position={{ lat: loc.latitude, lng: loc.longitude }}
                        key={loc.$id}
                        title={type === 'location' ? loc.name : loc.title}
                        ref={(marker) => setMarkerRef(marker, 'm_' + loc.$id)}
                        onClick={() => {
                            let i = openFlagsArray ? openFlagsArray.indexOf(loc.$id) : -1;
                            if (i != -1) {
                                setOpenFlagsArray((prev) => {
                                    return prev.filter(flag => {
                                        return flag != loc.$id
                                    })
                                })
                            } else {
                                setOpenFlagsArray((prev) => {
                                    return [...prev, loc.$id];
                                })
                            }
                        }
                        }
                    >
                        {console.log('Type: ' + type)}
                        {type === 'location' && (<img src={window.location.origin + '/' + getMarkerColorLocation(loc)} className="w-9" title={t(calculateWQIMeasureGroup(loc)[1])} />)}
                        {type === 'report' && (<img src={window.location.origin + '/warning.png'} className="w-10" title={loc?.title} />)}
                    </AdvancedMarker>

                    {openFlagsArray.indexOf(loc.$id) != -1 && (
                        <InfoWindow key={'iw_' + loc.$id}
                            anchor={markers['m_' + loc.$id]}
                            maxWidth={type === 'location' ? 300 : 450} minWidth={300}
                            onCloseClick={() => setOpenFlagsArray((prev) => {
                                return prev.filter(flag => {
                                    return flag != loc.$id
                                })
                            })}
                        >
                            {type === 'location' && (
                                <>
                                    <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
                                        <Link className='underline font-bold' to={`/location/${loc.$id}`}>{loc.name}</Link>
                                    </div>
                                    <div className='w-full text-md text-right font-bold'>
                                        {loc.measures.length + ' ' + ((loc.measures.length == 0 || loc.measures.length > 1) ? t('measuresLabel') : t('measureLabel'))}
                                    </div>
                                    <div>
                                        <MeasureChart height={200} values={loc.measures.sort(function (a, b) {
                                            return new Date(a.datetime) - new Date(b.datetime);
                                        })} />
                                    </div>
                                </>)}

                            {type === 'report' && (
                                <>
                                    <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
                                        <Link className='underline font-bold' to={`/report/${loc.$id}`}>{loc.title}</Link>
                                    </div>
                                    <div className='w-full text-md text-right font-bold '>
                                        {formatDateTime(new Date(loc.datetime))}
                                    </div>
                                    <div>
                                        <p className='my-2 text-wrap text-justify' >{loc.description}</p>
                                    </div>
                                    <div className='w-48 mx-auto'>
                                        <img src={storageService.getPreviewImageUrl(loc.imageId)} alt={loc.title} className='rounded-lg w-48 object-fill' />
                                    </div>
                                </>
                            )}
                        </InfoWindow>
                    )}
                </div>
            ))}


        </>
    )
}

export default Markers