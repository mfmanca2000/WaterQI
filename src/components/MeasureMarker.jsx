import React, { useState } from 'react';
import { AdvancedMarker, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { InfoWindow } from './InfoWindow';
import { formatDateTime } from '../utils/date';
import { Link } from 'react-router-dom';
import { calculateWQI, getMarkerColor } from '../utils/wqi'
import storageService from '../appwrite/storage';
import { useTranslation } from 'react-i18next';

const MeasureMarker = ({ measure }) => {

    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const { t } = useTranslation();

    const [wqi, wqiText] = calculateWQI(measure);

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                onClick={() => setInfowindowOpen(true)}
                position={{ lat: measure.latitude, lng: measure.longitude }}
                title={measure.placeDescription}>
                <img src={window.location.origin + '/' + getMarkerColor(measure)} className="w-10" title={t(wqiText)} />
            </AdvancedMarker>
            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={450}
                    onCloseClick={() => setInfowindowOpen(false)}>
                    <div className='grid grid-cols-2'>
                        <div>
                            <Link className='font-bold underline text-right col-span-2' to={`/measure/${measure.$id}`}>
                                <label className='font-extrabold text-lg' style={{ whiteSpace: 'nowrap' }}> {measure.placeDescription} </label><br />
                            </Link>
                            <label className='italic'> {formatDateTime(new Date(measure.datetime))}</label><br />
                            <div className='grid grid-cols-2 text-base w-56'>
                                <label className='text-base'>EC</label>
                                <label>{measure.electricalConductivity ? measure.electricalConductivity : '-'}</label>

                                <label className='text-base'>TDS</label>
                                <label>{measure.totalDissolvedSolids ? measure.totalDissolvedSolids : '-'}</label>

                                <label className='text-base'>pH</label>
                                <label>{measure.pH ? measure.pH : '-'}</label>

                                <label className='text-base'>Temperature</label>
                                <label>{measure.temperature ? measure.temperature : '-'}</label>

                                <label className='text-base'>Salinity</label>
                                <label>{measure.salinity ? measure.salinity : '-'}</label>
                            </div>
                        </div>
                        <div className='text-center pt-6'>
                            <img src={storageService.getPreviewImageUrl(measure.imageId)} alt={measure.placeDescription} className='rounded-lg w-48 object-fill' />
                        </div>
                    </div>


                </InfoWindow>
            )}
        </>
    );
};

export default MeasureMarker