import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white mt-auto border-t">
            <div className="container mx-auto px-4 py-6 text-center text-gray-500">
                <p>&copy; {currentYear} {t('site_name')}. {t('all_rights_reserved')}</p>
            </div>
        </footer>
    );
};

export default Footer;