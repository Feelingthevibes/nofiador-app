import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Property, NewPropertyData } from '../../../types';
import { useAuth } from './AuthContext';

interface PropertyContextType {
    properties: Property[];
    loading: boolean;
    error: string | null;
    addProperty: (propertyData: Omit<NewPropertyData, 'contact_name' | 'contact_phone'>) => Promise<{ data: Property | null, error: any | null }>;
    updateProperty: (propertyId: number, propertyData: Partial<Omit<NewPropertyData, 'contact_name' | 'contact_phone'>>) => Promise<{ error: any | null }>;
    deleteProperty: (propertyId: number) => Promise<{ error: any | null }>;
}

const PropertyContext = createContext<PropertyContextType | null>(null);

const generateSlug = (id: number, title: string): string => {
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 50);
    return `${id}-${sanitizedTitle}`;
}

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await supabase
            .from('properties')
            .select(`
                *,
                profiles (
                    contact_name,
                    contact_phone
                )
            `);

        if (fetchError) {
            setError(fetchError.message);
            console.error("Error fetching properties:", fetchError);
        } else {
            setProperties(data as Property[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const addProperty = async (propertyData: Omit<NewPropertyData, 'contact_name' | 'contact_phone'>) => {
        if (!user) return { data: null, error: new Error('User not authenticated') };
        
        const { data: insertedData, error: insertError } = await supabase
            .from('properties')
            .insert([{ ...propertyData, landlord_id: user.id }])
            .select()
            .single();

        if (insertError) {
            console.error("Error adding property:", insertError);
            return { data: null, error: insertError };
        }

        const slug = generateSlug(insertedData.id, propertyData.title_en);
        const { data: updatedData, error: updateError } = await supabase
            .from('properties')
            .update({ slug })
            .eq('id', insertedData.id)
            .select(`*, profiles(contact_name, contact_phone)`)
            .single();

        if (updateError) {
            console.error("Error updating slug:", updateError);
            return { data: null, error: updateError };
        }
        
        setProperties(prev => [...prev, updatedData as Property]);
        return { data: updatedData as Property, error: null };
    };

    const updateProperty = async (propertyId: number, propertyData: Partial<Omit<NewPropertyData, 'contact_name' | 'contact_phone'>>) => {
        const { data, error: updateError } = await supabase
            .from('properties')
            .update(propertyData)
            .eq('id', propertyId)
            .select(`*, profiles(contact_name, contact_phone)`)
            .single();
        
        if (updateError) {
            console.error("Error updating property:", updateError);
            return { error: updateError };
        }
        
        setProperties(prev => prev.map(p => p.id === propertyId ? (data as Property) : p));
        return { error: null };
    };
    
    const deleteProperty = async (propertyId: number) => {
        const { error: deleteError } = await supabase
            .from('properties')
            .delete()
            .eq('id', propertyId);

        if (deleteError) {
            console.error("Error deleting property:", deleteError);
            return { error: deleteError };
        }
        
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        return { error: null };
    };

    const value = useMemo(() => ({
        properties,
        loading,
        error,
        addProperty,
        updateProperty,
        deleteProperty
    }), [properties, loading, error, user]);

    return (
        <PropertyContext.Provider value={value}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperties = () => {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error('useProperties must be used within a PropertyProvider');
    }
    return context;
};
