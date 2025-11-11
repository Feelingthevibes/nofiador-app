import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Role, Language } from '../types';

interface SignupModalProps {
    onClose: () => void;
    onSwitch: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ onClose, onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('renter');
    const [preferredLanguage, setPreferredLanguage] = useState<Language>('en');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        const { error: signupError } = await signup(email, password, role, preferredLanguage);

        if (signupError) {
            setIsError(true);
            const msg = signupError.message.toLowerCase();
            // Expanded check to catch different phrasings for an existing user error from Supabase.
            if (msg.includes('user already registered') || msg.includes('already exists')) {
                setMessage(t('signup_failed_login_instead'));
            } else {
                setMessage(signupError.message || t('signup_failed'));
            }
        } else {
            setIsError(false);
            setMessage(t('signup_success'));
            // Don't close modal immediately, show success message
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-brand-dark">{t('create_account')}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                    </div>

                    {message && !isError ? (
                        <div className="text-center p-4 bg-green-100 text-green-800 rounded-lg">
                            <p>{message}</p>
                            <button onClick={onClose} className="mt-4 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">
                                {t('close')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-email">{t('email')}</label>
                                    <input
                                        id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="signup-password">{t('password')}</label>
                                    <input
                                        id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">{t('i_am_a')}</label>
                                    <div className="flex">
                                        <button type="button" onClick={() => setRole('renter')} className={`w-1/2 py-2 text-sm rounded-l-lg ${role === 'renter' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>{t('renter')}</button>
                                        <button type="button" onClick={() => setRole('landlord')} className={`w-1/2 py-2 text-sm rounded-r-lg ${role === 'landlord' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>{t('landlord')}</button>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">{t('language')}</label>
                                    <div className="flex">
                                        <button type="button" onClick={() => setPreferredLanguage('en')} className={`w-1/2 py-2 text-sm rounded-l-lg ${preferredLanguage === 'en' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>English</button>
                                        <button type="button" onClick={() => setPreferredLanguage('es')} className={`w-1/2 py-2 text-sm rounded-r-lg ${preferredLanguage === 'es' ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>Español</button>
                                    </div>
                                </div>
                                {message && isError && <p className="text-red-500 text-xs italic mb-4">{message}</p>}
                                <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 disabled:bg-gray-400">
                                    {loading ? 'Creating account...' : t('signup')}
                                </button>
                            </form>
                            <p className="text-center text-sm text-gray-600 mt-4">
                                {t('already_have_account')} <span onClick={onSwitch} className="font-bold text-brand-secondary cursor-pointer hover:underline">{t('login')}</span>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignupModal;