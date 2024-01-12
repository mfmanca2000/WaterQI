import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from "react-redux"
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'
import { t } from 'i18next'

function MeasureGroupCard({ measureGroup, onDelete }) {
    
    const userData = useSelector((state) => state.auth.userData)

    const handleDelete = (e) => {
        onDelete(e, measureGroup.$id);
    }

    return (
        <div className='w-full bg-casaleggio-rgba rounded-xl p-4 h-80'>
            <Link to={`/measureGroup/${measureGroup?.$id}`}>

                <div className='w-full justify-center mb-2 '>
                    <img src={measureGroup?.imageId ? StorageService.getPreviewImageUrl(measureGroup?.imageId) : '/noimage.png'} alt={measureGroup?.description} className={measureGroup.imageId ? 'rounded-xl h-36 object-cover object-center w-full' : 'rounded-xl h-36 object-fill ' } />
                </div>
                <div className='min-h-14'>
                    <label className='text-xl font-bold'>{measureGroup?.description}</label><br />
                </div>
                <div className='min-h-14 grid grid-cols-5'>
                    <span className='text-sm font-light col-span-3'>
                        <div>{formatDateTime(new Date(measureGroup.$updatedAt))}</div>
                        <div><label className='text-sm font-light'>{t('by')} {measureGroup.username ?? measureGroup.userId}</label></div>
                    </span>
                    <label className='text-4xl font-bold text-right -m-1 text-white'>{measureGroup?.measures.length}</label>
                    <div className='w-16'>
                        <img src='multiplemarker.png' alt='Measure Group'/>
                    </div>
                </div>
            </Link>
            {userData.$id === measureGroup?.userId && (
                <div className='text-left'>
                    <Link className='font-bold underline' onClick={handleDelete}>{t('measuresDelete')}</Link>
                </div>
            )}
        </div>


    )
}

export default MeasureGroupCard