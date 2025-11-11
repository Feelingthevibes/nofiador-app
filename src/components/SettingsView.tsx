import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { navigateTo } from '../App';

const SettingsView: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();

    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user && user.profile) {
            setContactName(user.profile.contact_name || '');
            setContactPhone(user.profile.contact_phone || '');
        }
    }, [user]);

    if (!user) {
        navigateTo('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const { error } = await updateProfile({
            contact_name: contactName,
            contact_phone: contactPhone,
        });

        if (error) {
            setMessage(t('profile_update_error'));
        } else {
            setMessage(t('profile_updated'));
        }
        setLoading(false);
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-brand-dark mb-6">{t('settings')}</h1>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">{t('contact_name')}</label>
                        <input
                            type="text"
                            id="contact_name"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">{t('contact_phone')}</label>
                         <input
                            type="text"
                            id="contact_phone"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                        />
                    </div>
                </div>
                <div className="mt-6">
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Saving...' : t('save_changes')}
                    </button>
                </div>
                {message && <p className={`text-center text-sm mt-4 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
            </form>
        </div>
    );
};

export default SettingsView;
