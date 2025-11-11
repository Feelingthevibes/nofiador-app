import React, { useState, useEffect } from 'react';
import { useProperties } from '../contexts/PropertyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessageContext';
import { Property, AuthModal } from '../types';
import { navigateTo } from '../App';

interface PropertyDetailViewProps {
    slug: string;
    openAuthModal: (modal: AuthModal) => void;
}

const getYouTubeID = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ContactLandlordForm: React.FC<{ landlordId: string }> = ({ landlordId }) => {
    const { t } = useLanguage();
    const { startConversation, sendMessage, selectConversation } = useMessages();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');
        
        const conversation = await startConversation(landlordId);
        if (conversation) {
            // FIX: Send message directly with the new conversation ID to avoid race condition
            const { error } = await sendMessage(message, conversation.id);
            if (error) {
                setStatus(t('message_failed'));
            } else {
                setStatus(t('message_sent'));
                // Select conversation after sending for navigation to chat view
                selectConversation(conversation);
                setTimeout(() => navigateTo('/messages'), 1500);
            }
        } else {
            setStatus(t('message_failed'));
        }
        setLoading(false);
    }
    
    return (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md">
            <h4 className="font-bold text-lg mb-2">{t('contact_landlord')}</h4>
            <form onSubmit={handleSubmit}>
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded text-gray-800"
                    placeholder={t('start_conversation_prompt')}
                    required
                />
                <button type="submit" disabled={loading} className="mt-2 w-full bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50">
                    {loading ? 'Sending...' : t('send')}
                </button>
                 {status && <p className="text-sm text-center mt-2">{status}</p>}
            </form>
        </div>
    )
}


const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ slug, openAuthModal }) => {
    const { properties, loading } = useProperties();
    const { language, t } = useLanguage();
    const { user, toggleSaveProperty, isAuthenticated } = useAuth();
    const [property, setProperty] = useState<Property | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
    const [zoomedImageIndex, setZoomedImageIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!loading && properties.length > 0) {
            const foundProperty = properties.find(p => p.slug === slug);
            if (foundProperty) {
                setProperty(foundProperty);
                setSelectedImageIndex(0);
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
                                        <path strokeLinecap="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    {isSaved ? t('saved') : t('save')}
                                </button>
                            )}
                            {isAuthenticated && user?.id !== property.landlord_id ? (
                                <ContactLandlordForm landlordId={property.landlord_id} />
                            ) : (
                                <div className="bg-gray-100 p-4 rounded-md text-center">
                                    <p className="text-gray-600">{t('login_to_contact')}</p>
                                    <button onClick={() => openAuthModal('login')} className="mt-2 text-brand-primary font-bold">{t('login')}</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {youtubeId && (
                        <div className="md:col-span-5 p-4 md:p-6 border-t">
                            <h3 className="text-2xl font-bold text-brand-dark mb-4">{t('video_tour')}</h3>
                            <div className="relative w-full shadow-lg" style={{ paddingTop: '56.25%' }}>
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