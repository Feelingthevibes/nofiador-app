import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PropertyProvider } from './contexts/PropertyContext';

import Header from './components/Header';
import Footer from './components/Footer';
import PropertyList from './components/PropertyList';
import ListPropertyView from './components/ListPropertyView';
import ProfileView from './components/ProfileView';
import PropertyDetailView from './components/PropertyDetailView';
import SettingsView from './components/SettingsView';

import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import { AuthModal } from './types';

// Custom event dispatcher for programmatic navigation
export const navigateTo = (path: string) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
};

const AppRouter: React.FC = () => {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const [authModal, setAuthModal] = useState<AuthModal>(null);
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        const onLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };
        window.addEventListener('popstate', onLocationChange);
        
        const onNavigate = ((e: CustomEvent) => {
            const { path } = e.detail;
            if (window.location.pathname !== path) {
                window.history.pushState({}, '', path);
                setCurrentPath(path);
            }
        }) as EventListener;

        window.addEventListener('navigate', onNavigate);

        return () => {
            window.removeEventListener('popstate', onLocationChange);
            window.removeEventListener('navigate', onNavigate);
        };
    }, []);

    let content = null;
    if (loading) {
        content = <div className="text-center p-12">Loading...</div>;
    } else {
        if (currentPath === '/') {
            content = <PropertyList />;
        } else if (currentPath.startsWith('/property/')) {
            const slug = currentPath.split('/')[2];
            content = <PropertyDetailView slug={slug} />;
        } else if (currentPath === '/profile') {
            content = isAuthenticated ? <ProfileView /> : <PropertyList />;
        } else if (currentPath.startsWith('/list')) {
             const propertyId = currentPath.split('/')[2];
             content = isAuthenticated ? <ListPropertyView propertyId={propertyId ? parseInt(propertyId) : undefined} /> : <PropertyList />;
        } else if (currentPath === '/settings') {
            content = isAuthenticated ? <SettingsView /> : <PropertyList />;
        } else {
            content = <div className="text-center py-10">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-xl text-gray-600">Page Not Found</p>
            </div>;
        }
    }

    return (
        <div className="min-h-screen flex flex-col font-sans text-brand-dark">
            <Header currentPath={currentPath} openAuthModal={setAuthModal} />
            <main className="flex-grow container mx-auto px-4 py-8">
                {content}
            </main>
            <Footer />
            {authModal === 'login' && <LoginModal onClose={() => setAuthModal(null)} onSwitch={() => setAuthModal('signup')} />}
            {authModal === 'signup' && <SignupModal onClose={() => setAuthModal(null)} onSwitch={() => setAuthModal('login')} />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <AuthProvider>
                <PropertyProvider>
                    <AppRouter />
                </PropertyProvider>
            </AuthProvider>
        </LanguageProvider>
    );
};

export default App;
