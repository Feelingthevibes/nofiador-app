import React from 'react';
import { Property } from '../types';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { navigateTo } from '../App';

interface PropertyCardProps {
  property: Property;
  onSelectProperty: (property: Property) => void;
  onDelete?: (propertyId: number) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelectProperty, onDelete }) => {
  const { language, t } = useLanguage();
  const { user, toggleSaveProperty } = useAuth();

  const isSaved = user?.profile?.role === 'renter' && user.profile.saved_properties.includes(property.id);
  const isOwner = user?.profile?.role === 'landlord' && user.id === property.landlord_id;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleSaveProperty(property.id);
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigateTo(`/list/${property.id}`);
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(property.id);
  }

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelectProperty(property);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const title = language === 'es' ? property.title_es : property.title_en;

  return (
    <div onClick={() => navigateTo(`/property/${property.slug}`)} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
      <div className="relative">
        <img
          src={property.images[0] || 'https://picsum.photos/seed/placeholder/800/600'}
          alt={title}
          className="w-full h-48 object-cover"
        />
        {user?.profile?.role === 'renter' && (
          <button onClick={handleSaveClick} className={`absolute top-2 right-2 p-2 rounded-full transition-colors duration-200 ${isSaved ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-700 hover:bg-white'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-gray-500">{property.neighborhood}</p>
        <h3 className="text-lg font-semibold text-brand-dark truncate mt-1">
          {title}
        </h3>
        <div className="mt-2 text-xl font-bold text-brand-secondary">
          {formatPrice(property.price)} <span className="text-sm font-normal text-gray-600">{t('price_per_month')}</span>
        </div>
        <div className="flex-grow mt-3 text-sm text-gray-600 space-x-4">
            <span>🛏️ {property.bedrooms} {t('bedrooms')}</span>
            <span>🛁 {property.bathrooms} {t('bathrooms')}</span>
            <span>📐 {property.area} {t('area')}</span>
        </div>
        
        {isOwner && onDelete ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={handleEditClick} className="bg-blue-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              {t('edit')}
            </button>
            <button onClick={handleDeleteClick} className="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
              {t('delete')}
            </button>
          </div>
        ) : (
          <button
            onClick={handleViewDetailsClick}
            className="mt-4 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            {t('view_details')}
          </button>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
