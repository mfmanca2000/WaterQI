import React from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'
import { useSelector } from "react-redux";
import { calculateWQI, getMarkerColor } from '../utils/wqi.js';
import { t } from 'i18next';

function MeasureCard({ measure, onDelete }) {

  const handleDelete = (e) => {
    onDelete(e, measure.$id);
  }

  const userData = useSelector((state) => state.auth.userData)

  const [wqi, wqiText] = calculateWQI(measure);

  return (
    
      <div className='w-full bg-gray-100 rounded-xl p-4 h-80'>
        <Link to={`/measure/${measure.$id}`}>

          <div className='w-full justify-center mb-4 h-36'>
            <img src={measure.imageId ? StorageService.getPreviewImageUrl(measure.imageId) : '/noimage.png'} alt={measure.placeDescription} className='rounded-xl h-36 object-cover object-center w-full' />
          </div>
          <div className='min-h-14'>
            <label className='text-xl font-bold'>{measure.placeDescription}</label><br />
          </div>
          <div className='w-full grid grid-cols-5'>
            <div className='col-span-4'>
              <label className='text-sm font-light'>{formatDateTime(new Date(measure.datetime))}</label><br />
              <label className='text-sm font-light'>{t('by')} {measure.username ?? measure.userId}</label> <br />
            </div>
            <div className='w-16'>
              <img src={window.location.origin + '/' + getMarkerColor(measure)} title={wqiText} alt="Pin" />
            </div>
          </div>

        </Link>
        {userData.$id === measure.userId && (
          <div className='text-left'>
            <Link className='font-bold underline' onClick={handleDelete}>{t('measuresDelete')}</Link>
          </div>
        )}
      </div>
    
  )
}

export default MeasureCard