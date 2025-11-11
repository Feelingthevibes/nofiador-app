import React, { useState, useMemo } from 'react';
import { Property, AuthModal } from '../types';
import PropertyCard from './PropertyCard';
import PropertyDetailModal from './PropertyDetailModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useProperties } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { neighborhoods } from '../constants';
import { navigateTo } from '../App';

const Hero: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8 text-center border-t-4 border-brand-primary">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-2">{t('usp_title')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('usp_description')}</p>
        </div>
    );
};

const FilterBar: React.FC<{
    neighborhoodFilter: string;
    setNeighborhoodFilter: (value: string) => void;
    sortBy: string;
    setSortBy: (value: string) => void;
}> = ({ neighborhoodFilter, setNeighborhoodFilter, sortBy, setSortBy }) => {
    const { t } = useLanguage();
    const selectStyle = "bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5";

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-1/2">
                <label htmlFor="neighborhood-filter" className="block mb-2 text-sm font-medium text-gray-900">{t('filter_by_neighborhood')}</label>
                <select id="neighborhood-filter" value={neighborhoodFilter} onChange={e => setNeighborhoodFilter(e.target.value)} className={selectStyle}>
                    <option value="">{t('all_neighborhoods')}</option>
                    {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
            <div className="w-full sm:w-1/2">
                <label htmlFor="sort-by" className="block mb-2 text-sm font-medium text-gray-900">{t('sort_by_price')}</label>
                <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectStyle}>
                    <option value="default">{/* Default sort */}</option>
                    <option value="price_asc">{t('price_low_to_high')}</option>
                    <option value="price_desc">{t('price_high_to_low')}</option>
                </select>
            </div>
        </div>
    )
}

interface PropertyListProps {
  openAuthModal: (modal: AuthModal) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ openAuthModal }) => {
  const { properties, loading, error } = useProperties();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredAndSortedProperties = useMemo(() => {
    let result = [...properties];
    if (neighborhoodFilter) {
      result = result.filter(p => p.neighborhood === neighborhoodFilter);
    }
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }
    return result;
  }, [properties, neighborhoodFilter, sortBy]);

  const handleListPropertyClick = () => {
    if (isAuthenticated) {
        navigateTo('/list');
    } else {
        openAuthModal('login');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading properties...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <Hero />
      <FilterBar 
        neighborhoodFilter={neighborhoodFilter}
        setNeighborhoodFilter={setNeighborhoodFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      {filteredAndSortedProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelectProperty={() => setSelectedProperty(property)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold text-brand-dark mb-2">{t('no_properties_found_title')}</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">{t('no_properties_found_message')}</p>
            <button 
              onClick={handleListPropertyClick}
              className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600 transition-colors duration-300"
            >
              {t('list_your_property_cta')}
            </button>
        </div>
      )}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
};

export default PropertyList;