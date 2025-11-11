import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useProperties } from '../contexts/PropertyContext';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import PropertyDetailModal from './PropertyDetailModal';
import { navigateTo } from '../App';

const ProfileView: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { properties, loading, deleteProperty } = useProperties();
    const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(null);

    if (!user) {
        navigateTo('/');
        return null;
    }

    const handleDeleteClick = async (propertyId: number) => {
        if (window.confirm(t('delete_confirm_message'))) {
            const { error } = await deleteProperty(propertyId);
            if(error) alert(`Failed to delete property: ${error.message}`);
        }
    };

    const renderLandlordProfile = () => {
        const myListings = properties.filter(p => p.landlord_id === user.id);
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark">{t('my_listings')}</h2>
                     <button onClick={() => navigateTo('/settings')} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
                        {t('edit_profile')}
                    </button>
                </div>
                {loading ? <p>Loading listings...</p> : myListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myListings.map(property => (
                            <PropertyCard 
                                key={property.id} 
                                property={property} 
                                onSelectProperty={() => setSelectedProperty(property)}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                         <p className="text-gray-600 mb-4">{t('no_listings_yet')}</p>
                          <button onClick={() => navigateTo('/list')} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                            {t('list_property')}
                         </button>
                    </div>
                )}
            </div>
        );
    };

    const renderRenterProfile = () => {
        const savedProperties = properties.filter(p => user.profile?.saved_properties.includes(p.id));
        return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark">{t('my_saved_properties')}</h2>
                     <button onClick={() => navigateTo('/settings')} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors">
                        {t('edit_profile')}
                    </button>
                </div>
                {loading ? <p>Loading saved properties...</p> : savedProperties.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {savedProperties.map(property => (
                            <PropertyCard 
                                key={property.id} 
                                property={property}
                                onSelectProperty={() => setSelectedProperty(property)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-600 mb-4">{t('no_saved_properties')}</p>
                         <button onClick={() => navigateTo('/')} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">
                            {t('browse_properties')}
                         </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-brand-dark">{t('welcome_back')},</h1>
                <p className="text-gray-600">{user.email}</p>
            </div>
            {user.profile?.role === 'landlord' ? renderLandlordProfile() : renderRenterProfile()}
             {selectedProperty && (
                <PropertyDetailModal
                property={selectedProperty}
                onClose={() => setSelectedProperty(null)}
                />
            )}
        </div>
    );
};

export default ProfileView;