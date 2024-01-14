import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import storageService from '../appwrite/storage';
import { formatDateTime } from '../utils/date';

function ReportMarker({ report }) {

    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                onClick={() => setInfowindowOpen(true)}
                position={{ lat: report?.latitude, lng: report?.longitude }}
                title={report?.title}>
                <img src='warning.png' className="w-10" title={report?.title} />
            </AdvancedMarker>
            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={450}
                    onCloseClick={() => setInfowindowOpen(false)}>
                    <div className='grid grid-cols-2'>
                        <div>
                            <Link className='font-bold underline text-right col-span-2' to={`/report/${report.$id}`}>
                                <label className='font-extrabold text-lg' style={{ whiteSpace: 'nowrap' }}> {report.title} </label><br />
                            </Link>
                            <label className='italic'> {formatDateTime(new Date(report.datetime))}</label><br /> 
                            <p className='mt-2 text-wrap' >{report.description}</p>                           
                        </div>
                        <div className='text-center pt-2 pb-6'>
                            <img src={storageService.getPreviewImageUrl(report.imageId)} alt={report.title} className='rounded-lg w-48 object-fill' />
                        </div>
                    </div>


                </InfoWindow>
            )}
        </>
    )
}

export default ReportMarker