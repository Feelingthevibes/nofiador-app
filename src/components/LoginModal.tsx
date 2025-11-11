import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';

interface LoginModalProps {
    onClose: () => void;
    onSwitch: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitch }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error: loginError } = await login(email, password);
        if (loginError) {
            setError(t('login_failed'));
        } else {
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-brand-dark">{t('login_to_account')}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                {t('email')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Logging in...' : t('login')}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-4">
                        {t('dont_have_account')} <span onClick={onSwitch} className="font-bold text-brand-secondary cursor-pointer hover:underline">{t('signup')}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
