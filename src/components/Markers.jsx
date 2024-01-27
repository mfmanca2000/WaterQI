import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { InfoWindow } from './InfoWindow';
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { calculateWQIMeasureGroup, getMarkerColorLocation } from '../utils/wqi';
import MeasureChart from './MeasureChart';

function Markers({ locations }) {

    const map = useMap();
    const [markers, setMarkers] = useState({});    
    const [openFlagsArray, setOpenFlagsArray] = useState(['abc']);
    const clusterer = useRef(null);
    const { t } = useTranslation();
    const [toggle, setToggle] = useState(false)

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
            <label className='text-xs'>{toggle}</label>            
            {locations.map((loc) => (
                <div key={'div_' + loc.$id}>

                    <AdvancedMarker
                        position={{ lat: loc.latitude, lng: loc.longitude }}
                        key={loc.$id}
                        title={loc.name}
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
                        <img src={window.location.origin + '/' + getMarkerColorLocation(loc)} className="w-9" title={t(calculateWQIMeasureGroup(loc)[1])} />
                    </AdvancedMarker>                    

                    {openFlagsArray.indexOf(loc.$id) != -1 && (
                        <InfoWindow key={'iw_'+loc.$id}
                            anchor={markers['m_' + loc.$id]}
                            maxWidth={300} minWidth={300}                            
                            onCloseClick={() => setOpenFlagsArray((prev) => {
                                return prev.filter(flag => {
                                    return flag != loc.$id
                                })
                            })}
                        >

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
                        </InfoWindow>
                    )}
                </div>
            ))}


        </>
    )
}

export default Markers