import React from 'react'
import databaseService from '../appwrite/database'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { IoBeaker, IoWarning, IoLocationOutline } from "react-icons/io5";

function Counters() {
    const userData = useSelector((state) => state.auth.userData);
    const { t } = useTranslation();

    const [myMeasuresNumber, setMyMeasuresNumber] = useState(0)
    const [myLocationsNumber, setMyLocationsNumber] = useState(0)
    const [myReportsNumber, setMyReportsNumber] = useState(0)

    useEffect(() => {
        async function getAllNumbers() {
            const mm = await databaseService.getMeasuresByUserId(userData.$id, null, 100);
            if (mm) setMyMeasuresNumber(mm.documents.length);

            const ml = await databaseService.getLocationsByUserId(userData.$id);
            if (ml) setMyLocationsNumber(ml.documents.length);

            const r = await databaseService.getReportsByUserId(userData.$id);
            if (r) setMyReportsNumber(r.documents.length);
        }
        getAllNumbers();
    }, [userData.$id])

    const stats = [
        { count: myLocationsNumber, label: t('myLocations'), Icon: IoLocationOutline, href: '/mylocations' },
        { count: myMeasuresNumber,  label: t('myMeasures'),  Icon: IoBeaker,           href: '/mymeasures' },
        { count: myReportsNumber,   label: t('myReports'),   Icon: IoWarning,          href: '/myreports' },
    ];

    return (
        <div className='grid grid-cols-3 gap-4'>
            {stats.map(({ count, label, Icon, href }) => (
                <a
                    key={href}
                    href={href}
                    className="bg-white border border-slate-200 rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-4 flex flex-col items-center text-center group"
                >
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mb-3 group-hover:bg-brand-100 transition-colors">
                        <Icon className="text-brand-600" size={20} />
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{count > 99 ? '99+' : count}</span>
                    <span className="text-xs text-slate-500 mt-1">{label}</span>
                </a>
            ))}
        </div>
    )
}

export default Counters
