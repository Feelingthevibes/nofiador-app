import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, Role, Language, UserProfile } from '../../../types';
import type { Session } from '@supabase/supabase-js';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: Error | null }>;
    signup: (email: string, password: string, role: Role, preferred_language: Language) => Promise<{ error: Error | null }>;
    logout: () => Promise<void>;
    toggleSaveProperty: (propertyId: number) => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const { setLanguage } = useLanguage();

    const fetchUserProfile = async (supabaseUser: any): Promise<UserProfile | null> => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
        if (error) {
            console.error("Error fetching profile:", error.message);
            return null;
        }
        return profile;
    };

    useEffect(() => {
        const getSessionAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            
            if (session?.user) {
                const profile = await fetchUserProfile(session.user);
                setUser({ ...session.user, profile });
                if (profile?.preferred_language) {
                    setLanguage(profile.preferred_language);
                }
            }
            setLoading(false);
        };
        getSessionAndProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                const profile = await fetchUserProfile(session.user);
                setUser({ ...session.user, profile });
                 if (profile?.preferred_language) {
                    setLanguage(profile.preferred_language);
                }
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [setLanguage]);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signup = async (email: string, password: string, role: Role, preferred_language: Language) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role,
                    preferred_language: preferred_language,
                    contact_name: email.split('@')[0],
                    contact_phone: 'Not provided'
                }
            }
        });
        return { error };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };
    
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return { error: new Error("User not authenticated") };

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
        
        if (!error && data) {
             setUser(prevUser => prevUser ? { ...prevUser, profile: data } : null);
        }
        return { error };
    }

    const toggleSaveProperty = async (propertyId: number) => {
        if (!user || !user.profile || user.profile.role !== 'renter') return;
        
        const isSaved = user.profile.saved_properties.includes(propertyId);
        const updatedSavedProperties = isSaved
            ? user.profile.saved_properties.filter(id => id !== propertyId)
            : [...user.profile.saved_properties, propertyId];

        const { data, error } = await supabase
            .from('profiles')
            .update({ saved_properties: updatedSavedProperties })
            .eq('id', user.id)
            .select()
            .single();

        if (!error && data) {
            setUser({ ...user, profile: data });
        }
    };
    
    const value = useMemo(() => ({
        user,
        session,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        toggleSaveProperty,
        updateProfile,
    }), [user, session, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
