import React, { useState, useEffect } from 'react';
import { useProperties } from '../contexts/PropertyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Property } from '../types';
import { navigateTo } from '../App';

interface PropertyDetailViewProps {
    slug: string;
}

const getYouTubeID = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ slug }) => {
    const { properties, loading } = useProperties();
    const { language, t } = useLanguage();
    const { user, toggleSaveProperty } = useAuth();
    const [property, setProperty] = useState<Property | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!loading && properties.length > 0) {
            const foundProperty = properties.find(p => p.slug === slug);
            if (foundProperty) {
                setProperty(foundProperty);
                setSelectedImageIndex(0); // Reset to the first image
            }
        }
    }, [slug, properties, loading]);
    
    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (zoomedImageIndex !== null && property) {
            setZoomedImageIndex((prevIndex) => (prevIndex! + 1) % property.images.length);
        }
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (zoomedImageIndex !== null && property) {
            setZoomedImageIndex((prevIndex) => (prevIndex! - 1 + property.images.length) % property.images.length);
        }
    };


    if (loading) {
        return <div className="text-center py-12">Loading property details...</div>;
    }

    if (!property) {
        return <div className="text-center py-12">Property not found.</div>;
    }
    
    const mainImage = property.images[selectedImageIndex] || property.images[0] || 'https://picsum.photos/seed/placeholder/1200/800';
    const youtubeId = property.video_url ? getYouTubeID(property.video_url) : null;
    const isSaved = user?.profile?.role === 'renter' && user.profile.saved_properties.includes(property.id);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const title = language === 'es' ? property.title_es : property.title_en;
    const description = language === 'es' ? property.description_es : property.description_en;

    return (
        <div className="max-w-6xl mx-auto">
             <button onClick={() => navigateTo('/')} className="mb-6 text-brand-secondary hover:underline">&larr; {t('back_to_browsing')}</button>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    <div className="md:col-span-3 p-4">
                        <img 
                            src={mainImage} 
                            alt="Main property view" 
                            className="w-full h-96 object-cover rounded-lg mb-2 cursor-zoom-in"
                            onClick={() => setZoomedImageIndex(selectedImageIndex)}
                        />
                        <div className="flex space-x-2 overflow-x-auto">
                            {property.images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Thumbnail ${index + 1}`}
                                    className={`w-24 h-24 object-cover rounded-md cursor-pointer border-2 ${selectedImageIndex === index ? 'border-brand-primary' : 'border-transparent'}`}
                                    onClick={() => setSelectedImageIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2 p-6 flex flex-col">
                        <h1 className="text-3xl font-bold text-brand-dark mb-1">{title}</h1>
                        <p className="text-lg text-gray-500 mb-4">{property.neighborhood}</p>
                        
                        <div className="text-4xl font-bold text-brand-secondary mb-6">
                            {formatPrice(property.price)} <span className="text-xl font-normal text-gray-600">{t('price_per_month')}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-center mb-6 py-4 border-y">
                            <div>
                                <div className="text-2xl font-bold">🛏️ {property.bedrooms}</div>
                                <div className="text-sm text-gray-600">{t('bedrooms')}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">🛁 {property.bathrooms}</div>
                                <div className="text-sm text-gray-600">{t('bathrooms')}</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">📐 {property.area}</div>
                                <div className="text-sm text-gray-600">{t('area')}</div>
                            </div>
                        </div>
                        
                        <div className="text-gray-700 mb-6 flex-grow">
                            <h3 className="font-semibold text-lg mb-2">Description</h3>
                            <p>{description}</p>
                        </div>
                        
                        <div className="mt-auto flex flex-col gap-4">
                            {user?.profile?.role === 'renter' && (
                                <button onClick={() => toggleSaveProperty(property.id)} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${isSaved ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-brand-primary text-white hover:bg-red-600'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {isSaved ? t('saved') : t('save')}
                                </button>
                            )}
                             <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md">
                                <h4 className="font-bold">{t('contact_landlord')}</h4>
                                <p><strong>{property.profiles?.contact_name || 'N/A'}</strong></p>
                                <p>{property.profiles?.contact_phone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {youtubeId && (
                        <div className="md:col-span-5 p-4 md:p-6 border-t">
                            <h3 className="text-2xl font-bold text-brand-dark mb-4">{t('video_tour')}</h3>
                            <div className="relative w-full shadow-lg" style={{ paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {zoomedImageIndex !== null && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60]" 
                    onClick={() => setZoomedImageIndex(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white text-5xl font-bold z-10" 
                        onClick={() => setZoomedImageIndex(null)}
                        aria-label="Close"
                    >&times;</button>
                    
                    <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 transition-opacity z-10"
                        aria-label="Previous image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="relative w-full h-full flex justify-center items-center p-4">
                        <img 
                            src={property.images[zoomedImageIndex]} 
                            alt="Zoomed property view" 
                            className="max-w-full max-h-full object-contain" 
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                    
                    <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-30 rounded-full p-2 hover:bg-opacity-50 transition-opacity z-10"
                        aria-label="Next image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                </div>
            )}
        </div>
    );
};

export default PropertyDetailView;