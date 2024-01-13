import React, { useState } from 'react'
import authService from '../appwrite/auth'
import { Link, useNavigate } from "react-router-dom"
import Button from './Button'
import Input from './Input'
import Logo from './Logo'
import { useForm } from "react-hook-form"
import { useDispatch } from 'react-redux'
import { login as authLogin } from '../store/authSlice'
import { useTranslation, Trans } from 'react-i18next'

function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState("");


    const googleLogin = () => {
        authService.googleLogin();
    }

    const facebookLogin = () => {
        authService.facebookLogin();
    }


    const login = async (data) => {
        setError("");
        try {
            const session = await authService.login(data);
            if (session) {
                const userData = await authService.getCurrentUser();
                //console.log(JSON.stringify(userData.prefs));
                if (userData) {
                    if (userData.prefs?.language)
                    {
                        await i18n.changeLanguage(userData.prefs?.language);
                    }   
                    dispatch(authLogin({ userData }));
                }
                navigate("/");
            }
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center w-full">
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
                <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <img width="100%" src='Logo.png'/>
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight mt-4">{t('loginTitle')}</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    {t('loginSubtitle')}&nbsp;
                    <Link to="/signup" className="font-medium text-primary transition-all duration-200 hover:underline">
                        {t('loginSignup')}
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
                <form onSubmit={handleSubmit(login)} className="mt-8">
                    <div className="space-y-5">
                        <Input
                            label="Email"
                            placeholder={t('emailPlaceholder')}
                            type="email"
                            {...register("email", {
                                required: true,

                            })}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder={t('passwordPlaceholder')}
                            {...register("password", { required: true })}
                        />
                        <Button type="submit" className="w-full bg-casaleggio-rgba">
                            {t('login')}
                        </Button>

                        <div className='mt-2'>
                            <label>{t('forgotPassword')} </label>
                            <Link className='font-bold underline' onClick={() => {
                                //TODO: implement the Appwrite flow for recovery
                            }}>
                                {t('recoverPassword')}
                            </Link>
                        </div>
                    </div>
                </form>

                <div className="mt-6 text-center text-base text-black/60">
                    {t('otherLogin')}&nbsp;
                    <div>
                        <button onClick={() => googleLogin()} className='inline-block m-8 px-6 py-2 max-h-16 duration-200 bg-casaleggio-rgba hover:bg-casaleggio-btn-rgba rounded-sm'>
                            <img src='google.png' className='w-12' />
                        </button>
                        <button onClick={() => facebookLogin()} className='inline-block m-8 px-6 py-2 max-h-16 duration-200 bg-casaleggio-rgba hover:bg-casaleggio-btn-rgba rounded-sm disabled: '>
                            <img src='facebook.webp' className='w-12 ' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login