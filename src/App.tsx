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
import AdminView from './components/AdminView';

import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import { AuthModal } from './types';

// Custom navigation function using hash routing
export const navigateTo = (path: string) => {
    // Ensure the hash always starts with # and the path with /
    const newHash = `#${path.startsWith('/') ? path : '/' + path}`;
    if (window.location.hash !== newHash) {
        window.location.hash = newHash;
    }
};


const AppRouter: React.FC = () => {
    const getPathFromHash = () => {
        const hash = window.location.hash.slice(1); // Remove leading '#'
        return hash || '/'; // Default to root path
    };

    const [currentPath, setCurrentPath] = useState(getPathFromHash());
    const [authModal, setAuthModal] = useState<AuthModal>(null);
    const { isAuthenticated, loading, isAdmin } = useAuth();

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(getPathFromHash());
        };
        window.addEventListener('hashchange', handleHashChange);
        
        // Set initial path in case the page is loaded with a hash
        handleHashChange();

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    let content = null;
    if (loading) {
        content = <div className="text-center p-12">Loading...</div>;
    } else {
        if (currentPath.startsWith('/property/')) {
            const slug = currentPath.split('/')[2];
            content = <PropertyDetailView slug={slug} />;
        } else if (currentPath === '/profile') {
            content = isAuthenticated ? <ProfileView /> : <PropertyList openAuthModal={setAuthModal} />;
        } else if (currentPath.startsWith('/list')) {
             const propertyId = currentPath.split('/')[2];
             content = isAuthenticated ? <ListPropertyView propertyId={propertyId ? parseInt(propertyId) : undefined} /> : <PropertyList openAuthModal={setAuthModal} />;
        } else if (currentPath === '/admin') {
            content = isAdmin ? <AdminView /> : <PropertyList openAuthModal={setAuthModal} />;
        } else if (currentPath === '/settings') {
            content = isAuthenticated ? <SettingsView /> : <PropertyList openAuthModal={setAuthModal} />;
        } else {
            // Default to PropertyList for the root path ('/') and any other unrecognized paths.
            // This prevents the 404 error on initial load.
            content = <PropertyList openAuthModal={setAuthModal} />;
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