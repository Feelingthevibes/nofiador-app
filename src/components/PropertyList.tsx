import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';
import PropertyDetailModal from './PropertyDetailModal';
import { useLanguage } from './contexts/LanguageContext';
import { useProperties } from './contexts/PropertyContext';
import { neighborhoods } from '../constants';

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

const PropertyList: React.FC = () => {
  const { properties, loading, error } = useProperties();
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onSelectProperty={() => setSelectedProperty(property)}
          />
        ))}
      </div>
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
