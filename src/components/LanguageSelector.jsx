import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FlagIcon from "./FlagIcon";
import styles from "./LanguageSelector.module.scss";
//import {cdnBaseUrl, environment, projectToken} from "../../i18n";
import {languages} from "../conf/conf"



// interface Language {
//     key: string;
//     name: string;
// }

const LANGUAGE_SELECTOR_ID = 'language-selector';

export const LanguageSelector = () => {
    const { i18n } = useTranslation();
    // const [languages, setLanguages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    let selectedLanguage = Object.keys(languages).find(language => language === i18n.language);

    if (!selectedLanguage) {
        selectedLanguage = 'it';
    }

    const handleLanguageChange = async (language) => {
        await i18n.changeLanguage(language);
        setIsOpen(false);
    };



    useEffect(() => {
        const handleWindowClick = (event) => {
            const target = event.target.closest('button');
            if (target && target.id === LANGUAGE_SELECTOR_ID) {
                return;
            }
            setIsOpen(false);
        }
        window.addEventListener('click', handleWindowClick)
        return () => {
            window.removeEventListener('click', handleWindowClick);
        }
    }, []);    

    return (
        <div className="flex items-center z-40">
            <div className="relative inline-block text-left">
                <div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                        className="inline-flex items-center justify-center w-full rounded-md border border-gray-100 shadow-sm px-4 py-2  text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        id={LANGUAGE_SELECTOR_ID}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                    >
                        <FlagIcon countryCode={selectedLanguage} />
                        {selectedLanguage}
                        <svg
                            className="-mr-1 ml-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
                {isOpen && <div
                    className="origin-top-right absolute left-0 mt-2 w-36 rounded-md shadow-lg bg-casaleggio-rgba ring-1 ring-black ring-opacity-5"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="language-selector"
                >
                    <div className="py-1 grid grid-cols-1 gap-2" role="none">
                        {Object.keys(languages).map((language, index) => {
                            return (
                                <button
                                    key={language}
                                    onClick={() => handleLanguageChange(language)}
                                    className={`${selectedLanguage.key === language
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700"
                                        } px-4 py-2 text-sm text-left items-center inline-flex hover:bg-gray-100 ${index % 2 === 0 ? 'rounded-r' : 'rounded-l'}`}
                                    role="menuitem"
                                >
                                    <FlagIcon countryCode={language} />
                                    <span className="truncate">{languages[language].nativeName}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>}
            </div>
        </div>

    );
};