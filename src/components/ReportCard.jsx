import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next'
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Button, Modal } from 'flowbite-react';

function ReportCard({ report, onDelete }) {
    const [openModal, setOpenModal] = useState(false);
    const userData = useSelector((state) => state.auth.userData);
    const { t } = useTranslation();

    return (
        <div className='w-full bg-white border border-slate-200 rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden flex flex-col'>
            <Link to={`/report/${report.$id}`}>
                <div className='relative'>
                    <img
                        src={report.imageId ? StorageService.getPreviewImageUrl(report.imageId) : '/noimage.png'}
                        alt={report.title}
                        className='h-40 object-cover object-center w-full'
                    />
                    <div className='absolute top-2 right-2'>
                        <img src='/warning.png' alt="Warning" className='w-7 h-7 drop-shadow-md' />
                    </div>
                </div>

                <div className='p-4 flex-1'>
                    <p className='text-base font-semibold text-slate-900 leading-snug line-clamp-2 mb-2'>{report.title}</p>
                    <p className='text-xs text-slate-500'>{formatDateTime(new Date(report.datetime))}</p>
                    <p className='text-xs text-slate-400'>{t('by')} {report.username ?? report.userId}</p>
                </div>
            </Link>

            {(userData.$id === report.userId || userData.labels.includes('admin')) && (
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
                                    {t('deleteReportModalDescription')}
                                </h3>
                                <div className="flex justify-center gap-3">
                                    <Button color="failure" onClick={(e) => { onDelete(e, report); setOpenModal(false); }}>
                                        {t('deleteReportModalDelete')}
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

export default ReportCard
