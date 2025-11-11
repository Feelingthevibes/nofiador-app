import React from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { Language, AuthModal } from '../types';
import { navigateTo } from '../App';

interface HeaderProps {
    currentPath: string;
    openAuthModal: (modal: AuthModal) => void;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const buttonStyle = (lang: Language) => 
        `px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            language === lang 
            ? 'bg-brand-primary text-white' 
            : 'bg-white text-brand-dark hover:bg-gray-100'
        }`;

    return (
        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setLanguage('en')} className={buttonStyle('en')}>EN</button>
            <button onClick={() => setLanguage('es')} className={buttonStyle('es')}>ES</button>
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ currentPath, openAuthModal }) => {
    const { t } = useLanguage();
    const { isAuthenticated, user, logout } = useAuth();

    const navLinkStyle = (path: string) => 
        `cursor-pointer text-sm sm:text-base font-medium transition-colors ${
            currentPath === path 
            ? 'text-brand-primary' 
            : 'text-gray-500 hover:text-brand-dark'
        }`;

    const authButtonStyle = "cursor-pointer text-sm sm:text-base font-medium text-gray-500 hover:text-brand-dark";

    const handleLogout = async () => {
        await logout();
        navigateTo('/');
    }

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo('/')}>
                        <span className="text-2xl" role="img" aria-label="key">🔑</span>
                        <h1 className="text-xl sm:text-2xl font-bold text-brand-primary">{t('site_name')}</h1>
                    </div>
                    <div className="flex items-center space-x-4 sm:space-x-6">
                        <nav className="hidden sm:flex items-center space-x-4 sm:space-x-6">
                            <span onClick={() => navigateTo('/')} className={navLinkStyle('/')}>
                                {t('browse_properties')}
                            </span>
                             {isAuthenticated && user?.profile?.role === 'landlord' && (
                                <span onClick={() => navigateTo('/list')} className={navLinkStyle('/list')}>
                                    {t('list_property')}
                                </span>
                            )}
                            {isAuthenticated ? (
                                <>
                                    <span onClick={() => navigateTo('/profile')} className={navLinkStyle('/profile')}>
                                        {t('profile')}
                                    </span>
                                    <span onClick={handleLogout} className={authButtonStyle}>
                                        {t('logout')}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span onClick={() => openAuthModal('login')} className={authButtonStyle}>
                                        {t('login')}
                                    </span>
                                    <button onClick={() => openAuthModal('signup')} className="bg-brand-primary text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                        {t('signup')}
                                    </button>
                                </>
                            )}
                        </nav>
                         <div className="sm:hidden flex items-center">
                             {isAuthenticated ? (
                                <span onClick={() => navigateTo('/profile')} className="material-icons text-gray-600 cursor-pointer">account_circle</span>
                             ) : (
                                <button onClick={() => openAuthModal('login')} className="bg-brand-primary text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-red-600 transition-colors">
                                    {t('login')}
                                 </button>
                             )}
                        </div>
                        <LanguageSwitcher />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
