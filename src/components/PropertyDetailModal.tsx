import React, { useState } from 'react';
import { Property } from '../types';
import { useLanguage } from './contexts/LanguageContext';
import { navigateTo } from '../App';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose }) => {
  const { language, t } = useLanguage();
  const [mainImage, setMainImage] = useState(property.images[0] || 'https://picsum.photos/seed/placeholder/800/600');
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const title = language === 'es' ? property.title_es : property.title_en;
  const description = language === 'es' ? property.description_es : property.description_en;

  const handleViewFullPage = () => {
    onClose();
    navigateTo(`/property/${property.slug}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-1/2 p-4">
            <img src={mainImage} alt="Main property view" className="w-full h-64 md:h-auto object-cover rounded-lg mb-2"/>
            <div className="flex space-x-2 overflow-x-auto">
                {property.images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-brand-primary' : 'border-transparent'}`}
                        onClick={() => setMainImage(img)}
                    />
                ))}
            </div>
        </div>
        
        <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-brand-dark mb-1">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
          </div>
          <p className="text-md text-gray-500 mb-4">{property.neighborhood}</p>
          
          <div className="text-3xl font-bold text-brand-secondary mb-4">
            {formatPrice(property.price)} <span className="text-lg font-normal text-gray-600">{t('price_per_month')}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div>
              <div className="text-xl font-bold">🛏️ {property.bedrooms}</div>
              <div className="text-sm text-gray-600">{t('bedrooms')}</div>
            </div>
            <div>
              <div className="text-xl font-bold">🛁 {property.bathrooms}</div>
              <div className="text-sm text-gray-600">{t('bathrooms')}</div>
            </div>
            <div>
              <div className="text-xl font-bold">📐 {property.area}</div>
              <div className="text-sm text-gray-600">{t('area')}</div>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6 flex-grow">{description.substring(0, 200)}...</p>
          
           <div className="mt-auto flex flex-col gap-4">
            <button onClick={handleViewFullPage} className="w-full font-bold py-3 px-4 rounded-lg transition-colors bg-brand-secondary text-white hover:bg-teal-600">
                {t('view_full_page')}
            </button>
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md">
                <h4 className="font-bold">{t('contact_landlord')}</h4>
                <p><strong>{property.profiles?.contact_name || 'N/A'}</strong></p>
                <p>{property.profiles?.contact_phone || 'N/A'}</p>
            </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
