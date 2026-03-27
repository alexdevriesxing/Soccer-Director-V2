import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LanguageSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    const handleLanguageSelect = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
        navigate('/profile-creation');
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-4 min-h-screen">
            <h2 className="text-3xl font-bold text-white mb-12">Select Language</h2>
            <div className="grid grid-cols-1 gap-6 w-full max-w-md">
                <button
                    onClick={() => handleLanguageSelect('en')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-blue-400"
                >
                    <span className="text-2xl mr-3">🇬🇧</span> English
                </button>
                <button
                    onClick={() => handleLanguageSelect('nl')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-orange-400"
                >
                    <span className="text-2xl mr-3">🇳🇱</span> Nederlands
                </button>
                <button
                    onClick={() => handleLanguageSelect('es')}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-red-400"
                >
                    <span className="text-2xl mr-3">🇪🇸</span> Español
                </button>
                <button
                    onClick={() => handleLanguageSelect('de')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-yellow-400"
                >
                    <span className="text-2xl mr-3">🇩🇪</span> Deutsch
                </button>
            </div>
        </div>
    );
};

export default LanguageSelectionPage;
