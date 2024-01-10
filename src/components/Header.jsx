import React from 'react'
import Container from './Container.jsx'
import Logo from './Logo.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LogoutBtn from './LogoutBtn.jsx'
import { useTranslation, Trans } from 'react-i18next'

function Header() {
    const { t, i18n } = useTranslation();
    const loggedIn = useSelector((state) => state.auth.loggedIn);
    const navigate = useNavigate();
    const navItems = [
        {
            name: `${t('headerHome')}`,
            slug: "/",
            active: true
        },
        {
            name: `${t('login')}`,
            slug: "/login",
            active: !loggedIn
        },
        {
            name: `${t('headerSignup')}`,
            slug: "/signup",
            active: !loggedIn
        },
        {
            name: `${t('headerAllMeasures')}`,
            slug: "/measures",
            active: loggedIn
        },
        {
            name: `${t('headerAddMeasureGroup')}`,
            slug: "/addMeasureGroup",
            active: loggedIn
        },
        {
            name: `${t('headerAddMeasure')}`,
            slug: "/addMeasure",
            active: loggedIn
        }
    ]

    const lngs = {
        it: { nativeName: 'Italiano' },
        en: { nativeName: 'English' },
        fr: { nativeName: 'Français'},
    };

    return (
        <header className='py-3 shadow bg-casaleggio-rgba'>
            <Container>
                <nav className='flex'>
                    <div className='mr-4'>
                        <Link to="/">
                            <Logo width='70%' />
                        </Link>
                    </div>
                    <div>
                        {Object.keys(lngs).map((lng) => (
                            <button className='py-6 px-2' key={lng} style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }} type="submit" onClick={() => i18n.changeLanguage(lng)}>
                                {lngs[lng].nativeName}
                            </button>
                        ))}
                    </div>
                    <ul className='flex ml-auto pt-4'>
                        {
                            navItems.map((item) => item.active ? (
                                <li key={item.name}>
                                    <button onClick={() => navigate(item.slug)} className='inline-block mx-2 px-6 py-2 duration-200 bg-green-500 hover:bg-casaleggio-btn-rgba rounded-full'>
                                        {item.name}
                                    </button>
                                </li>
                            ) : null)
                        }
                        {loggedIn && (<li>
                            <LogoutBtn />
                        </li>)}
                    </ul>
                </nav>
            </Container>
        </header>
    )
}

export default Header