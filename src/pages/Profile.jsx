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



function Profile() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [myMeasuresNumber, setMyMeasuresNumber] = useState(0)
    const [myMeasureGroupsNumber, setMyMeasureGroupsNumber] = useState(0)
    const [myReportsNumber, setMyReportsNumber] = useState(0)

    useEffect(() => {

        async function getAllNumbers() {
            const mm = await databaseService.getMeasuresByUserId(userData.$id);
            if (mm) {
                setMyMeasuresNumber(mm.documents.length);
            }

            const mg = await databaseService.getMeasureGroupsByUserId(userData.$id);
            if (mg) {
                setMyMeasureGroupsNumber(mg.documents.length);
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

            <Container>
                <div className='flex flex-wrap mt-4'>
                    <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                        <Card className='' href='/mymeasures'>
                            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                My measures
                            </div>
                            <p className="text-6xl text-gray-700 dark:text-gray-400 text-center">
                                {myMeasuresNumber}
                            </p>
                        </Card>
                    </div>
                    <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                        <Card className="" href='/mygroups'>
                            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                My measure groups
                            </div>
                            <p className="text-6xl text-gray-700 dark:text-gray-400 text-center">
                                {myMeasureGroupsNumber}
                            </p>
                        </Card>
                    </div>
                    <div className='p-4 w-72 lg:w-1/4 sm:w-1/2'>
                        <Card className="" href='/myreports'>
                            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white h-16 text-center">
                                My reports
                            </div>
                            <p className="text-6xl text-gray-700 dark:text-gray-400 text-center">
                                {myReportsNumber}
                            </p>
                        </Card>
                    </div>

                </div>
            </Container>


        </div>
    )
}

export default Profile