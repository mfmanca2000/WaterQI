import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import Container from '../components/Container'
import Input from '../components/Input';
import { useForm } from "react-hook-form";
import authService from '../appwrite/auth';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useTranslation } from 'react-i18next'

function Settings() {

    const userData = useSelector((state) => state.auth.userData);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { register, handleSubmit, reset, setValue, control, getValues, watch } = useForm({
        defaultValues: {
            userId: userData?.$id,
            name: userData?.name,
            username: userData?.prefs.username,
            email: userData?.email,
            showYourDataOnly: userData?.prefs.showYourDataOnly,
            showMeasures: userData?.prefs.showStandaloneMeasures,
            showMeasureGroups: userData?.prefs.showMeasureGroups,
        }
    })

    useEffect(() => {
        console.log('Inside:' + JSON.stringify(userData.prefs.username))
        reset({
            userId: userData?.$id,
            name: userData?.name,
            username: userData?.prefs.username,
            email: userData?.email,
            showYourDataOnly: userData?.prefs.showYourDataOnly,
            showMeasures: userData?.prefs.showStandaloneMeasures,
            showMeasureGroups: userData?.prefs.showMeasureGroups,
        });

    }, [reset, userData]);


    const submit = async (data) => {
        console.log('UserData prefs: ' + JSON.stringify(userData.prefs))
        console.log('New username:' + getValues('username'))
        const saved = await authService.savePreferences({
            ...(userData.prefs),
            showYourDataOnly: getValues('showYourDataOnly'),
            showStandaloneMeasures: getValues('showMeasures'),
            showMeasureGroups: getValues('showMeasureGroups'),
            username: getValues('username')
        });
        if (saved) {
            navigate('/');
        }
    }


    return (
        <div className='w-full p-8'>
            <label className='text-4xl'>Settings</label>
            <form onSubmit={handleSubmit(submit)} className="flex flex-wrap mt-4">
                <div className='w-full'>
                    <div className='w-full'>
                        <div className='mb-4 md:w-1/4 lg:w-1/4'>
                            <Input className='bg-gray-200 ' label={t('settingsUserId')} disabled {...register('userId')} ></Input>
                        </div>
                        <div className='mb-4 md:w-1/4'>
                            <Input className='mb-4' label={t('settingsUsername')} {...register('username', { maxLength: 20 })}></Input>
                        </div>
                        <div className='mb-4 md:w-1/4'>
                            <Input className='mb-4' label={t('settingsName')} {...register('name', { required: true, maxLength: 50 })}></Input>
                        </div>
                        <div className='mb-4 md:w-1/4'>
                            <Input className='mb-4' label={t('settingsEmail')} {...register('email', { required: true, maxLength: 50 })}></Input>
                        </div>



                    </div>
                </div>
                <div className='w-full'>
                    <label className='text-xl'>Default settings for displaying measures</label>
                    <div className='w-full flex flex-wrap'>
                        <div className='p-2'>
                            <input className='mr-2' type='checkbox' id='onlyYourMeasures' label={t('measuresShowYourDataOnly')} {...register('showYourDataOnly')}></input>
                            <label className="mb-4" htmlFor='onlyYourMeasures'>{t('measuresShowYourDataOnly')}</label>
                        </div>
                        <div className='p-2'>
                            <input className='mr-2' type='checkbox' id='showMeasures' label={t('measuresShowStandaloneMeasures')} {...register('showMeasures')}></input>
                            <label htmlFor='showMeasures'>{t('measuresShowStandaloneMeasures')}</label>
                        </div>
                        <div className='p-2'>
                            <input className='mr-2' type='checkbox' id='showMeasureGroups' label={t('measuresShowMeasureGroups')} {...register('showMeasureGroups')}></input>
                            <label htmlFor='showMeasureGroups'>{t('measuresShowMeasureGroups')}</label>
                        </div>
                    </div>
                </div>

                <Button type="submit" bgColor="bg-casaleggio-rgba" className='w-full mt-8'>
                    Save
                </Button>
            </form >
        </div >
    )
}

export default Settings