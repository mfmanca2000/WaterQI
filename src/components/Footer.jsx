import React from 'react'
import { useTranslation } from 'react-i18next'

function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="w-full bg-brand-950 border-t border-brand-800">
            <div className="w-full h-0.5 bg-gradient-to-r from-brand-700 via-brand-300 to-transparent" />
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:flex md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                        <img src="/LogoFiumiPuliti.png" className="h-6 opacity-80" alt="Fiumi Puliti Logo" />
                        <span className="text-brand-200 font-semibold text-sm">Fiumi Puliti</span>
                    </div>
                    <span className="text-xs text-brand-400">
                        © 2024{' '}
                        <a href="https://www.gianrobertocasaleggio.com/" className="hover:text-brand-200 transition-colors">
                            Associazione Gianroberto Casaleggio
                        </a>
                        {' — '}All Rights Reserved.
                    </span>
                </div>

                <ul className="flex flex-wrap items-center gap-4 text-xs font-medium text-brand-400">
                    <li>
                        <a href="#" className="hover:text-white transition-colors">{t('footerAbout')}</a>
                    </li>
                    <li>
                        <a href="https://www.gianrobertocasaleggio.com/privacy/" className="hover:text-white transition-colors">{t('footerPrivacyPolicy')}</a>
                    </li>
                    <li>
                        <a href="https://www.gianrobertocasaleggio.com/contatti/" className="hover:text-white transition-colors">{t('footerContact')}</a>
                    </li>
                </ul>
            </div>
        </footer>
    )
}

export default Footer
