import React from 'react'
import { useTranslation } from 'react-i18next'

function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="bottom-0 left-0 z-20 w-full p-4 bg-casaleggio-rgba border-t border-black shadow md:flex md:items-center md:justify-between md:p-6">
            <span className="text-sm text-black sm:text-center">© 2024 <a href="https://www.gianrobertocasaleggio.com/" className="hover:underline"> - Associazione Gianroberto Casaleggio - Caney, Settimo Vittone (TO)</a>. All Rights Reserved.
            </span>
            <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-black sm:mt-0">
                <li>
                    <a href="#" className="hover:underline me-4 md:me-6">{t('footerAbout')}</a>
                </li>
                <li>
                    <a href="https://www.gianrobertocasaleggio.com/privacy/" className="hover:underline me-4 md:me-6">{t('footerPrivacyPolicy')}</a>
                </li>                
                <li>
                    <a href="https://www.gianrobertocasaleggio.com/contatti/" className="hover:underline">{t('footerContact')}</a>
                </li>
            </ul>
            
        </footer>
    )
}

export default Footer