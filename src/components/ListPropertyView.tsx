import React, { useState, useEffect } from 'react';
import { NewPropertyData } from '../types';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';
import { useProperties } from './contexts/PropertyContext';
import { neighborhoods } from '../constants';
import { navigateTo } from '../App';

interface ListPropertyViewProps {
  propertyId?: number;
}

const ListPropertyView: React.FC<ListPropertyViewProps> = ({ propertyId }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { properties, addProperty, updateProperty, loading: propertiesLoading } = useProperties();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Omit<NewPropertyData, 'contact_name' | 'contact_phone'>>({
    title_en: '',
    title_es: '',
    description_en: '',
    description_es: '',
    price: 0,
    neighborhood: '',
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    images: [],
  });
  const [imageInput, setImageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (propertyId && properties.length > 0) {
      const propertyToEdit = properties.find(p => p.id === propertyId);
      if (propertyToEdit) {
        const { id, landlord_id, slug, profiles, ...editableData } = propertyToEdit;
        setFormData(editableData);
        setImageInput(propertyToEdit.images.join(', '));
        setIsEditing(true);
      }
    }
  }, [propertyId, properties]);

  if (propertiesLoading) {
    return <div>Loading...</div>
  }

  if (!user || user.profile?.role !== 'landlord') {
    return (
      <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-brand-dark mb-2">{t('list_your_property_title')}</h2>
        <p className="text-gray-600 mb-6">{t('login_to_list')}</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: ['price', 'bedrooms', 'bathrooms', 'area'].includes(name) ? Number(value) : value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageInput(e.target.value);
    setFormData(prev => ({...prev, images: e.target.value.split(',').map(url => url.trim()).filter(url => url) }));
  }

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    let error = null;
    if (isEditing && propertyId) {
      const { error: updateError } = await updateProperty(propertyId, formData);
      error = updateError;
    } else {
      const { error: addError } = await addProperty(formData);
      error = addError;
    }

    setIsLoading(false);
    if (!error) {
      navigateTo('/profile');
    } else {
      alert(`Error: ${error.message}`);
    }
  };
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">{t('step_1_title')}</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('title_en')}</label>
                    <input type="text" name="title_en" value={formData.title_en} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('title_es')}</label>
                    <input type="text" name="title_es" value={formData.title_es} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('neighborhood')}</label>
                     <select name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="">{t('select_neighborhood')}</option>
                        {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                     </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('price_cpo')}</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </div>
          </div>
        );
      case 2:
        return (
           <div>
            <h3 className="text-xl font-semibold mb-4">{t('step_2_title')}</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('bedrooms')}</label>
                    <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('bathrooms')}</label>
                    <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('area')}</label>
                    <input type="number" name="area" value={formData.area} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                </div>
            </div>
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('description_en')}</label>
                    <textarea name="description_en" value={formData.description_en} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">{t('description_es')}</label>
                    <textarea name="description_es" value={formData.description_es} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                </div>
            </div>
          </div>
        );
      case 3:
        return (
           <div>
            <h3 className="text-xl font-semibold mb-4">{t('step_3_title')}</h3>
             <div>
                <label className="block text-sm font-medium text-gray-700">{t('photo_urls')}</label>
                <input type="text" value={imageInput} onChange={handleImageChange} placeholder={t('photo_urls_placeholder')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                <p className="text-xs text-gray-500 mt-1">For demo purposes, please paste URLs from a site like picsum.photos, separated by commas.</p>
            </div>
            <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">{t('photo_preview')}</h4>
                <div className="grid grid-cols-3 gap-2 mt-2 bg-gray-100 p-2 rounded-md min-h-[80px]">
                    {formData.images.map((url, index) => (
                        <img key={index} src={url} alt={`preview ${index}`} className="w-full h-24 object-cover rounded"/>
                    ))}
                </div>
            </div>
          </div>
        );
      case 4:
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4">{t('step_4_title')}</h3>
                <div className="bg-brand-light p-6 rounded-lg text-center">
                    <p className="text-xl font-semibold text-brand-dark">{t('listing_fee')}</p>
                    <button onClick={handleSubmit} disabled={isLoading} className="mt-4 w-full max-w-xs mx-auto bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400">
                        {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isLoading ? 'Processing...' : t('pay_with_paypal')}
                    </button>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-brand-dark mb-2 text-center">{isEditing ? t('editing_property') : t('creating_property')}</h2>
      <p className="text-center text-gray-500 mb-6">{isEditing ? formData.title_en : t('list_your_property_subtitle')}</p>

      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      </div>
      
      <div className="min-h-[300px]">
        {renderStep()}
      </div>
      
      <div className="flex justify-between mt-8 border-t pt-6">
        <button onClick={prevStep} disabled={step === 1} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50">
          {t('back_step')}
        </button>
        {step < 4 ? (
            <button onClick={nextStep} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
            {t('next_step')}
            </button>
        ) : (
             <button onClick={handleSubmit} disabled={isLoading} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
                {isEditing ? t('update_listing') : t('publish_listing')}
            </button>
        )}
      </div>
    </div>
  );
};

export default ListPropertyView;
