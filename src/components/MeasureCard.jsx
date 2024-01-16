import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'
import { useSelector } from "react-redux";
import { calculateWQI, getMarkerColor } from '../utils/wqi.js';
import { useTranslation } from 'react-i18next'
import { Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

function MeasureCard({ measure, onDelete }) {

    const [openModal, setOpenModal] = useState(false);

    const handleDelete = (e) => {
        setOpenModal(true);
    }

    const userData = useSelector((state) => state.auth.userData);
    const { t } = useTranslation();

    const [wqi, wqiText] = calculateWQI(measure);

    //console.log('Measure: ' + JSON.stringify(measure));

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
                        <img src={window.location.origin + '/' + getMarkerColor(measure)} title={t(wqiText)} alt="Pin" />
                    </div>
                </div>

            </Link>
            {(userData.$id === measure.userId || userData.labels.includes('admin')) && (
                <>
                    <div className='text-left'>
                        <Link className='font-bold underline' onClick={handleDelete}>{t('measuresDelete')}</Link>
                    </div>
                    <Modal show={openModal} onClose={() => setOpenModal(false)} popup>
                        {/* <Modal.Header>{t('deleteModalTitle')}</Modal.Header> */}
                        <Modal.Header />
                        <Modal.Body>
                            <div className="text-center">
                                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    {t('deleteMeasureModalDescription')}
                                </h3>                                
                                <div className="flex justify-center gap-4 mt-8">

                                    <Button color="failure" onClick={(e) => {
                                        onDelete(e, measure);
                                        setOpenModal(false)
                                    }}>
                                        {t('deleteMeasureModalDelete')}
                                    </Button>                                    
                                    <Button color="gray" onClick={() => {
                                        setOpenModal(false)
                                    }}>
                                        {t('deleteModalCancel')}
                                    </Button>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer />
                    </Modal>
                </>
            )}
        </div>

    )
}

export default MeasureCard