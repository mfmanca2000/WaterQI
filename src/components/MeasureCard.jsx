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
    const userData = useSelector((state) => state.auth.userData);
    const { t } = useTranslation();
    const [wqi, wqiText] = calculateWQI(measure);

    return (
        <div className='w-full bg-white border border-slate-200 rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col'>
            <Link to={`/measure/${measure.$id}`}>
                <div className='relative'>
                    <img
                        src={measure.imageId ? StorageService.getPreviewImageUrl(measure.imageId) : '/noimage.png'}
                        alt={measure.placeDescription}
                        className='h-40 object-cover object-center w-full'
                    />
                    <div className='absolute top-2 right-2'>
                        <img src={window.location.origin + '/' + getMarkerColor(measure)} title={t(wqiText)} alt="Quality" className='w-7 h-7 drop-shadow-md' />
                    </div>
                </div>

                <div className='p-4 flex-1'>
                    <p className='text-base font-semibold text-slate-900 leading-snug line-clamp-2 mb-2'>{measure.placeDescription}</p>
                    <p className='text-xs text-slate-500'>{formatDateTime(new Date(measure.datetime))}</p>
                    <p className='text-xs text-slate-400'>{t('by')} {measure.username ?? measure.userId}</p>
                </div>
            </Link>

            {(userData.$id === measure.userId || userData.labels.includes('admin')) && (
                <div className='px-4 pb-3 pt-2 border-t border-slate-100 mt-auto'>
                    <button
                        className='text-xs text-red-500 hover:text-red-700 font-medium transition-colors'
                        onClick={() => setOpenModal(true)}
                    >
                        {t('measuresDelete')}
                    </button>
                    <Modal show={openModal} onClose={() => setOpenModal(false)} popup>
                        <Modal.Header />
                        <Modal.Body>
                            <div className="text-center">
                                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-slate-300" />
                                <h3 className="mb-5 text-base font-medium text-slate-600">
                                    {t('deleteMeasureModalDescription')}
                                </h3>
                                <div className="flex justify-center gap-3">
                                    <Button color="failure" onClick={(e) => { onDelete(e, measure); setOpenModal(false); }}>
                                        {t('deleteMeasureModalDelete')}
                                    </Button>
                                    <Button color="gray" onClick={() => setOpenModal(false)}>
                                        {t('deleteModalCancel')}
                                    </Button>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer />
                    </Modal>
                </div>
            )}
        </div>
    )
}

export default MeasureCard
