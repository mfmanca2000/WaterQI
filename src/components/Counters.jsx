import React from 'react'
import databaseService from '../appwrite/database'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useState } from 'react';
import { Badge, Tooltip } from 'flowbite-react';
import { IoBeaker, IoWarning, IoStatsChart, IoLocationOutline } from "react-icons/io5";
import { IconContext } from 'react-icons';

function Counters() {
    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [myMeasuresNumber, setMyMeasuresNumber] = useState(0)
    //const [myMeasureGroupsNumber, setMyMeasureGroupsNumber] = useState(0)
    const [myLocationsNumber, setMyLocationsNumber] = useState(0)
    const [myReportsNumber, setMyReportsNumber] = useState(0)

    useEffect(() => {

        async function getAllNumbers() {
            const mm = await databaseService.getMeasuresByUserId(userData.$id, null, 100);
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

        <div className='p-4 flex flex-wrap gap-2'>
            <IconContext.Provider value={{ color: 'white', size: '20px' }}>
                {/* <Tooltip content={t('myMeasureGroups')}>
                    <Badge className='bg-casaleggio-rgba text-white' color='warning' href='/mymeasuregroups' size='sm'>
                        <div className='text-center'>
                            <IoStatsChart />
                            {myMeasureGroupsNumber}
                        </div>
                    </Badge>
                </Tooltip> */}
                <Tooltip content={t('myLocations')}>
                    <Badge className='bg-casaleggio-rgba text-white' color='warning' href='/mylocations' size='sm'>
                        <div className='text-center'>
                            <IoLocationOutline />
                            {myLocationsNumber}{myLocationsNumber > 99 ? '+' : ''}
                        </div>
                    </Badge>
                </Tooltip>
                <Tooltip content={t('myMeasures')}>
                    <Badge className='bg-casaleggio-rgba text-white' color='warning' href='/mymeasures' size='sm'>
                        <div className='text-center'>
                            <IoBeaker />
                            {myMeasuresNumber}{myMeasuresNumber > 99 ? '+' : ''}
                        </div>
                    </Badge>
                </Tooltip>
                <Tooltip content={t('myReports')}>
                    <Badge className='bg-casaleggio-rgba text-white' color='warning' href='/myreports' size='sm'>

                        <div className='text-center'>
                            <IoWarning />
                            {myReportsNumber}{myReportsNumber > 99 ? '+' : ''}
                        </div>
                    </Badge>
                </Tooltip>
            </IconContext.Provider>
        </div>

    )
}

export default Counters