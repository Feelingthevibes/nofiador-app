import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, Role, Language, UserProfile } from '../types';
import type { Session } from '@supabase/supabase-js';
import { useLanguage } from './LanguageContext';
import { navigateTo } from '../App';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    loading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<{ error: Error | null }>;
    signup: (email: string, password: string, role: Role, preferred_language: Language) => Promise<{ error: Error | null }>;
    logout: () => Promise<void>;
    toggleSaveProperty: (propertyId: number) => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any | null }>;
    fetchAllUsers: () => Promise<{ data: UserProfile[] | null, error: any | null }>;
    deleteUserByAdmin: (userId: string) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const { setLanguage } = useLanguage();
    
    const isAdmin = useMemo(() => user?.profile?.role === 'admin', [user]);

    const fetchUserProfile = async (supabaseUser: any): Promise<UserProfile | null> => {
        if (!supabaseUser) return null;
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            
            let profile = null;
            if (session?.user) {
                profile = await fetchUserProfile(session.user);
                setUser({ ...session.user, profile });
                 if (profile?.preferred_language) {
                    setLanguage(profile.preferred_language);
                }
            } else {
                setUser(null);
            }
            
            setLoading(false);

            if (_event === 'SIGNED_IN' && profile) {
                setTimeout(() => {
                    navigateTo('/profile');
                }, 0);
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
        setUser(null);
        setSession(null);
        navigateTo('/');
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out from server:", error.message);
        }
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

    const fetchAllUsers = async () => {
        if (!isAdmin) return { data: null, error: new Error('Permission denied.') };
        const { data, error } = await supabase.rpc('get_all_users_with_email');
        return { data, error };
    };

    const deleteUserByAdmin = async (userId: string) => {
        if (!isAdmin) {
            return { error: new Error('Permission denied. You must be an admin.') };
        }
        
        // This now calls the secure Edge Function to perform a full deletion.
        const { error } = await supabase.functions.invoke('delete-user-by-admin', {
            body: { userIdToDelete: userId },
        });

        if (error) {
            console.error("Error invoking delete-user-by-admin function:", error);
            // The profiles table entry might still exist if the auth deletion fails.
            // A more robust implementation could handle this, but for now, we just report the primary error.
        } else {
             // If the auth user is deleted, the profile is deleted automatically by a CASCADE constraint.
             // If not, we fall back to deleting just the profile record.
             const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
             if (profileError) {
                console.error("Could not delete profile after auth user deletion:", profileError);
                // Return the profile error as a secondary issue
                return { error: profileError };
             }
        }

        return { error };
    };
    
    const value = useMemo(() => ({
        user,
        session,
        isAuthenticated: !!user,
        loading,
        isAdmin,
        login,
        signup,
        logout,
        toggleSaveProperty,
        updateProfile,
        fetchAllUsers,
        deleteUserByAdmin
    }), [user, session, loading, isAdmin]);

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