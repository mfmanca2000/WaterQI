import React, { useState } from 'react'
import authService from '../appwrite/auth'
import { Link, useNavigate } from "react-router-dom"
import Button from './Button'
import Input from './Input'
import Logo from './Logo'
import { useForm } from "react-hook-form"
import { useDispatch } from 'react-redux'
import { login } from '../store/authSlice'
import { useTranslation, Trans } from 'react-i18next'

function Signup() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm()

    const googleLogin = (e) => {
        e.preventDefault();
        authService.googleLogin();
    }

    const facebookLogin = (e) => {
        e.preventDefault();
        authService.facebookLogin();
    }

    const createUser = async (data) => {

        setError("");
        try {
            const userData = await authService.createAccount(data);
            if (userData) {
                const userData = await authService.getCurrentUser();
                if (userData) {
                    dispatch(login({ userData }));
                }
                navigate("/");
            }
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="flex items-center justify-center">
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
                <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">{t('signupTitle')}</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    {t('signupSubtitle')}&nbsp;
                    <Link to="/login" className="font-medium text-primary transition-all duration-200 hover:underline">
                        {t('signupSignIn')}
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
                <form onSubmit={handleSubmit(createUser)} className="mt-8">
                    <div className="space-y-5">
                        <Input
                            {...register("name", { required: true })}
                            label="Full Name"
                            placeholder="Full Name"
                        />
                        <Input
                            {...register("email", {
                                required: true,

                            })}
                            label="Email"
                            placeholder="Email Address"
                            type="email"
                        />
                        <Input
                            {...register("password", { required: true })}
                            label="Password"
                            type="password"
                            placeholder="Password"
                        />
                        <Button type="submit" className="w-full bg-casaleggio-rgba">
                            Create Account
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-base text-black/60">
                    Or login with...&nbsp;
                    <div>
                        <button onClick={(e) => googleLogin(e)} className='inline-block m-8 px-6 py-2 duration-200 bg-casaleggio-rgba hover:bg-casaleggio-btn-rgba rounded-sm'>
                            <img src='google.png' className='w-8' />
                        </button>
                        <button onClick={(e) => facebookLogin(e)} className='inline-block m-8 px-6 py-2 duration-200 bg-casaleggio-rgba hover:bg-casaleggio-btn-rgba rounded-sm'>
                            <img src='facebook.webp' className='w-8' />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Signup