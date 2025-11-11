import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Conversation } from '../types';

const ChatView: React.FC = () => {
    const { 
        conversations, 
        messages, 
        selectedConversation, 
        selectConversation, 
        sendMessage,
        loadingConversations,
        loadingMessages
    } = useMessages();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const { error } = await sendMessage(newMessage);
        if (error) {
            alert(t('message_failed'));
        } else {
            setNewMessage('');
        }
    };

    return (
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-xl overflow-hidden">
            {/* Conversations List */}
            <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">{t('messages')}</h2>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {loadingConversations ? (
                        <p className="p-4 text-gray-500">Loading...</p>
                    ) : conversations.length > 0 ? (
                        conversations.map((convo: Conversation) => (
                            <div
                                key={convo.id}
                                onClick={() => selectConversation(convo)}
                                className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversation?.id === convo.id ? 'bg-brand-light' : ''}`}
                            >
                                <p className="font-semibold">{convo.other_participant_name}</p>
                                {/* Future enhancement: show last message snippet */}
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-gray-500">{t('no_conversations')}</p>
                    )}
                </div>
            </div>

            {/* Message Pane */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b flex items-center">
                           <h3 className="text-lg font-bold">{selectedConversation.other_participant_name}</h3>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
                            {loadingMessages ? (
                                <p className="text-center text-gray-500">Loading messages...</p>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'} mb-4`}>
                                        <div className={`max-w-md p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-brand-primary text-white' : 'bg-gray-200'}`}>
                                            <p>{msg.content}</p>
                                            <p className="text-xs opacity-75 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t">
                            <form onSubmit={handleSendMessage} className="flex">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={t('type_your_message')}
                                    className="flex-grow border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                                <button type="submit" className="bg-brand-secondary text-white font-bold p-2 rounded-r-lg hover:bg-teal-600">
                                    {t('send')}
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-500">
                       <p>{t('select_conversation')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatView;
