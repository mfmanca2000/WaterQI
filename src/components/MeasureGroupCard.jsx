import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from "react-redux"
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'
import { t } from 'i18next'
import { calculateWQIMeasureGroup, getMarkerColorMeasureGroup } from '../utils/wqi.js'
import { Button, Modal } from 'flowbite-react'
import { HiOutlineExclamationCircle } from 'react-icons/hi';

function MeasureGroupCard({ measureGroup, onDelete }) {

    const userData = useSelector((state) => state.auth.userData)
    const [openModal, setOpenModal] = useState(false);

    const handleDelete = (e) => {
        setOpenModal(true);
    }

    const [wqi, wqiText] = calculateWQIMeasureGroup(measureGroup);

    return (
        <div className='w-full bg-casaleggio-rgba rounded-xl p-4 h-80'>
            <Link to={`/measureGroup/${measureGroup?.$id}`}>

                <div className='w-full justify-center mb-2 '>
                    <img src={measureGroup?.imageId ? StorageService.getPreviewImageUrl(measureGroup?.imageId) : '/noimage.png'} alt={measureGroup?.description} className={measureGroup.imageId ? 'rounded-xl h-36 object-cover object-center w-full' : 'rounded-xl h-36 object-fill '} />
                </div>
                <div className='min-h-14'>
                    <label className='text-xl font-bold'>{measureGroup?.description}</label><br />
                </div>
                <div className='min-h-14 grid grid-cols-5'>
                    <span className='text-sm font-light col-span-3'>
                        <div>{formatDateTime(new Date(measureGroup.$updatedAt))}</div>
                        <div><label className='text-sm font-light'>{t('by')} {measureGroup.username ?? measureGroup.userId}</label></div>
                    </span>
                    <label className='text-4xl font-bold text-right text-white'>{measureGroup?.measures.length}</label>
                    <div className='w-16'>
                        <img src={window.location.origin + '/' + (getMarkerColorMeasureGroup(measureGroup) ?? 'multiplemarker.png') } title={t(wqiText)} alt="MeasureGroup" />
                    </div>
                </div>
            </Link>
            {(userData.$id === measureGroup.userId || userData.labels.includes('admin')) && (
                <>
                    <div className='text-left'>
                        <Link className='font-bold underline' onClick={handleDelete}>{t('measuresDelete')}</Link>
                    </div>
                    <Modal show={openModal} onClose={() => setOpenModal(false)} popup>
                        {/* <Modal.Header>{t('deleteMeasureGroupModalTitle')}</Modal.Header> */}
                        <Modal.Header />
                        <Modal.Body>
                            <div className="text-center">
                                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                    {t('deleteMeasureGroupModalDescription1')}
                                </h3>
                                <h6 className='text-base font-thin leading-relaxed text-gray-500 dark:text-gray-400'>
                                    {t('deleteMeasureGroupModalDescription2')}
                                </h6>
                                <div className="flex justify-center gap-4 mt-8">

                                    <Button color="success" onClick={(e) => {
                                        onDelete(e, measureGroup, false);
                                        setOpenModal(false)
                                    }}>
                                        {t('deleteMeasureGroupModalDeleteOnlyMeasureGroup')}
                                    </Button>
                                    <Button color="failure" onClick={(e) => {
                                        onDelete(e, measureGroup, true);
                                        setOpenModal(false)
                                    }}>
                                        {t('deleteMeasureGroupModalDeleteAll')}
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

export default MeasureGroupCard