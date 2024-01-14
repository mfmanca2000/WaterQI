import React from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'
import { useSelector } from "react-redux";
import { calculateWQI, getMarkerColor } from '../utils/wqi.js';
import { useTranslation } from 'react-i18next'

function ReportCard({report, onDelete}) {

    const handleDelete = (e) => {
        onDelete(e, report.$id);
    }

    const userData = useSelector((state) => state.auth.userData);
    const { t } = useTranslation();

    console.log('Report: ' + JSON.stringify(report))


    return (
        <div className='w-full bg-gray-100 rounded-xl p-4 h-80'>
        <Link to={`/report/${report.$id}`}>

          <div className='w-full justify-center mb-4 h-36'>
            <img src={report.imageId ? StorageService.getPreviewImageUrl(report.imageId) : '/noimage.png'} alt={report.title} className='rounded-xl h-36 object-cover object-center w-full' />
          </div>
          <div className='min-h-14'>
            <label className='text-xl font-bold'>{report.title}</label><br />
          </div>
          <div className='w-full grid grid-cols-5'>
            <div className='col-span-4'>
              <label className='text-sm font-light'>{formatDateTime(new Date(report.datetime))}</label><br />
              <label className='text-sm font-light'>{t('by')} {report.username ?? report.userId}</label> <br />
            </div>
            <div className='w-16'>
              <img src='/warning.png' alt="Warning" className='w-12'/>
            </div>
          </div>

        </Link>
        {userData.$id === report.userId && (
          <div className='text-left'>
            <Link className='font-bold underline' onClick={handleDelete}>{t('measuresDelete')}</Link>
          </div>
        )}
      </div>
    )
}

export default ReportCard