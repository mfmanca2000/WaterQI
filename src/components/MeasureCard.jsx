import React from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'



function MeasureCard({$id, placeDescription, datetime, imageId, userId}) {
  
  return (
    <Link to={`/measure/${$id}`}>
        <div className='w-full bg-gray-100 rounded-xl p-4'>
            <div className='w-ful justify-center mb-4'>
                <img src={StorageService.getPreviewImageUrl(imageId)} alt={placeDescription} className='rounded-xl'/>
            </div>
            <label className='text-xl font-bold'>{placeDescription}</label>
            <label className='text-sm font-light'>{formatDateTime(new Date(datetime))}</label><br/>            
            <label className='text-sm font-light'>By {userId}</label>            
        </div>
    </Link>
  )
}

export default MeasureCard