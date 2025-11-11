import React, { useState, useEffect } from 'react';
import { NewPropertyData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useProperties } from '../contexts/PropertyContext';
import { neighborhoods } from '../constants';
import { navigateTo } from '../App';
import { supabase } from '../lib/supabaseClient';

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
    video_url: '',
  });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId && properties.length > 0) {
      const propertyToEdit = properties.find(p => p.id === propertyId);
      if (propertyToEdit) {
        const { id, landlord_id, slug, profiles, ...editableData } = propertyToEdit;
        setFormData(editableData);
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
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const totalImages = formData.images.length + newImageFiles.length + files.length;
        if (totalImages > 20) {
            alert('You can upload a maximum of 20 images.');
            return;
        }
        setNewImageFiles(prev => [...prev, ...files]);
    }
  }

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  }

  const removeExistingImage = (url: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(imgUrl => imgUrl !== url) }));
  }

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsLoading(true);
    setFormError(null);
    let finalImageUrls = [...formData.images];

    if (newImageFiles.length > 0) {
        setIsUploading(true);
        const uploadPromises = newImageFiles.map((file, index) => {
            // RLS FIX: Re-introducing user-specific folders for image uploads.
            // The previous attempt to upload to the root failed, suggesting the RLS policy
            // requires uploads to be within a folder named after the user's ID.
            const fileExt = file.name.split('.').pop();
            // FIX: Add index to filename to prevent collisions when uploading multiple files at once.
            const fileName = `${Date.now()}-${index}.${fileExt}`;
            const filePath = `${user!.id}/${fileName}`;
            return supabase.storage.from('property_images').upload(filePath, file);
        });

        try {
            const uploadResults = await Promise.all(uploadPromises);
            
            const newUrls = uploadResults.map(result => {
                if (result.error) throw result.error;
                const { data } = supabase.storage.from('property_images').getPublicUrl(result.data.path);
                return data.publicUrl;
            });

            finalImageUrls = [...finalImageUrls, ...newUrls];
        } catch (uploadError: any) {
            let detailedError = uploadError.message;
            if (detailedError.includes('security policy')) {
                detailedError = "This is likely due to a Row Level Security (RLS) policy on your Supabase storage. Please check that the 'property_images' bucket allows authenticated users to insert objects."
            }
            setFormError(`${t('error_uploading_images')}: ${detailedError}`);
            setIsLoading(false);
            setIsUploading(false);
            return;
        }
        setIsUploading(false);
    }

    const propertyDataToSubmit = { ...formData, images: finalImageUrls };
    
    let error = null;
    if (isEditing && propertyId) {
      const { error: updateError } = await updateProperty(propertyId, propertyDataToSubmit);
      error = updateError;
    } else {
      const { error: addError } = await addProperty(propertyDataToSubmit);
      error = addError;
    }

    setIsLoading(false);
    if (!error) {
      navigateTo('/profile');
    } else {
      setFormError(`Error: ${error.message}`);
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('youtube_video_link')}</label>
                    <input 
                        type="url" 
                        name="video_url" 
                        value={formData.video_url || ''} 
                        onChange={handleChange} 
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                    />
                </div>
            </div>
          </div>
        );
      case 3:
        return (
           <div>
            <h3 className="text-xl font-semibold mb-4">{t('step_3_title')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('step_3_subtitle')}</p>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-red-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary">
                            <span>{t('upload_prompt')}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/png, image/jpeg" onChange={handleFileSelect} />
                        </label>
                    </div>
                    <p className="text-xs text-gray-500">{t('upload_limit')}</p>
                </div>
            </div>

            {(formData.images.length > 0 || newImageFiles.length > 0) && (
              <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">{t('photo_preview')}</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2 bg-gray-100 p-2 rounded-md min-h-[80px]">
                      {formData.images.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img src={url} alt={`preview ${index}`} className="w-full h-24 object-cover rounded"/>
                          <button onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                        </div>
                      ))}
                      {newImageFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img src={URL.createObjectURL(file)} alt={`preview ${file.name}`} className="w-full h-24 object-cover rounded"/>
                           <button onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                        </div>
                      ))}
                  </div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4">{t('step_4_title')}</h3>
                <div className="bg-brand-light p-6 rounded-lg text-center">
                    <p className="text-lg text-gray-700 mb-2">{t('listing_fee')}</p>
                    <p className="text-3xl font-bold text-brand-dark mb-6">$9.99 USD</p>
                    
                    {formError && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-left" role="alert">
                           <p className="font-bold">{t('error_title')}</p>
                           <p>{formError}</p>
                        </div>
                    )}
                    
                    {isLoading ? (
                        <div className="flex items-center justify-center text-gray-600">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <span>{isUploading ? t('uploading_images') : t('payment_processing')}</span>
                        </div>
                    ) : (
                       <>
                         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 text-left" role="alert">
                           <p className="font-bold">{t('developer_note_title')}</p>
                           <p>{t('developer_note_paypal')}</p>
                         </div>
                         <button 
                           onClick={handleSubmit} 
                           className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
                         >
                           {t('simulate_payment_and_publish')}
                         </button>
                       </>
                    )}
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
        <button onClick={prevStep} disabled={step === 1 || isLoading} className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50">
          {t('back_step')}
        </button>
        {step < 4 ? (
            <button onClick={nextStep} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
            {t('next_step')}
            </button>
        ) : (
            !isEditing && (
                 <button onClick={handleSubmit} disabled={true} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 invisible">
                    {t('publish_listing')}
                </button>
            )
        )}
         {isEditing && step === 4 && (
             <button onClick={handleSubmit} disabled={isLoading} className="bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors">
                {t('update_listing')}
            </button>
        )}
      </div>
    </div>
  );
};

export default ListPropertyView;