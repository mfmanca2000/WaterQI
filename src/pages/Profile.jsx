import React from 'react'
import authService from '../appwrite/auth';
import databaseService from '../appwrite/database'
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux';
import { Card } from 'flowbite-react';
import Container from '../components/Container';
import { useEffect } from 'react';
import { useState } from 'react';
import { IoBeaker, IoLocationOutline, IoStatsChart, IoWarning } from 'react-icons/io5';
import { FaFileImport, FaFileExport } from "react-icons/fa6";
import { MdOutlineRestore } from "react-icons/md";
import { IconContext } from 'react-icons';
import ImportGlobalDataSet from '../utils/ImportGlobalDataSet';
import ExportDatabase from '../utils/ExportDatabase';
import RestoreDatabase from '../utils/RestoreDatabase';



function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [myMeasuresNumber, setMyMeasuresNumber] = useState(0)
    //const [myMeasureGroupsNumber, setMyMeasureGroupsNumber] = useState(0)
    const [myLocationsNumber, setMyLocationsNumber] = useState(0)
    const [myReportsNumber, setMyReportsNumber] = useState(0)

    useEffect(() => {

        async function getAllNumbers() {
            const mm = await databaseService.getMeasuresByUserId(userData.$id);
            if (mm) {
                setMyMeasuresNumber(mm.documents.length);
            }

            // const mg = await databaseService.getMeasureGroupsByUserId(userData.$id);
            // if (mg) {
            //     setMyMeasureGroupsNumber(mg.documents.length);
            // }

            const ml = await databaseService.getLocationsByUserId(userData.$id);
            if (ml) {
                setMyLocationsNumber(ml.documents.length);
            }

            const r = await databaseService.getReportssByUserId(userData.$id);
            if (r) {
                setMyReportsNumber(r.documents.length);
            }

        }
        getAllNumbers();
    })


    return (
        <div className='w-full p-8'>
            <label className='text-4xl'>{t('headerProfile')}</label>
            <IconContext.Provider value={{ color: 'rgba(150, 181, 102, 1)', size: '64px' }}>
                <Container>
                    <div className='flex flex-wrap mt-4'>
                        {/* <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                            <Card className="" href='/mymeasuregroups'>
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                    {t('myMeasureGroups')}
                                </div>
                                <div className='flex w-full justify-center gap-2'>
                                    <IoStatsChart />
                                    <p className="text-6xl text-gray-700 dark:text-gray-400 text-casaleggio-rgba">
                                        {myMeasureGroupsNumber}
                                    </p>
                                </div>
                            </Card>
                        </div> */}

                        <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                            <Card className="" href='/mylocations'>
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                    {t('myLocations')}
                                </div>
                                <div className='flex w-full justify-center gap-2'>
                                    <IoLocationOutline />
                                    <p className="text-6xl text-gray-700 dark:text-gray-400 text-casaleggio-rgba">
                                        {myLocationsNumber}
                                    </p>
                                </div>
                            </Card>
                        </div>

                        <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                            <Card className='' href='/mymeasures'>
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                    {t('myMeasures')}
                                </div>
                                <div className='flex w-full justify-center gap-2'>
                                    <IoBeaker />
                                    <p className="text-6xl text-gray-700 dark:text-gray-400 text-casaleggio-rgba">
                                        {myMeasuresNumber}
                                    </p>
                                </div>

                            </Card>
                        </div>

                        <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                            <Card className="" href='/myreports'>
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                    {t('myReports')}
                                </div>
                                <div className='flex w-full justify-center gap-2'>
                                    <IoWarning />
                                    <p className="text-6xl text-gray-700 dark:text-gray-400 text-casaleggio-rgba">
                                        {myReportsNumber}
                                    </p>
                                </div>
                            </Card>
                        </div>

                    </div>
                </Container>

                {userData.labels.includes('admin') && (<Container>
                    <div className='flex flex-wrap'>
                        <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                            <Card className="">
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                    Import Global Dataset
                                </div>
                                <div className='flex w-full justify-center gap-2'>
                                    <FaFileImport />
                                    <ImportGlobalDataSet />
                                </div>
                            </Card>
                        </div>

                        <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                            <Card className="">
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                    Backup
                                </div>
                                <div className='flex w-full justify-center gap-2'>
                                    <FaFileExport />
                                    <ExportDatabase />
                                </div>
                            </Card>
                        </div>

                        <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                            <Card className="">
                                <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                    Restore
                                </div>
                                <div className='flex w-full justify-center gap-2'>
                                    <MdOutlineRestore />
                                    <RestoreDatabase />
                                </div>
                            </Card>
                        </div>
                    </div>
                </Container>)}
            </IconContext.Provider>


        </div>
    )
}

export default Profile