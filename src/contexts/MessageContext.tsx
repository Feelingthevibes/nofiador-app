import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Conversation, Message } from '../types';
import { useAuth } from './AuthContext';

interface MessageContextType {
    conversations: Conversation[];
    messages: Message[];
    selectedConversation: Conversation | null;
    loadingConversations: boolean;
    loadingMessages: boolean;
    selectConversation: (conversation: Conversation) => void;
    sendMessage: (content: string) => Promise<{ error: any | null }>;
    startConversation: (recipientId: string) => Promise<Conversation | null>;
}

const MessageContext = createContext<MessageContextType | null>(null);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setLoadingConversations(true);
        const { data, error } = await supabase
            .from('conversations')
            .select('*, participant_one_id(profiles(contact_name)), participant_two_id(profiles(contact_name))')
            .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`);
        
        if (data) {
            const formattedConversations = data.map((convo: any) => {
                const isParticipantOne = convo.participant_one_id.id === user.id;
                const otherParticipant = isParticipantOne ? convo.participant_two_id : convo.participant_one_id;
                return {
                    ...convo,
                    other_participant_name: otherParticipant.profiles?.contact_name || 'Unknown User',
                    other_participant_id: otherParticipant.id,
                };
            });
            setConversations(formattedConversations);
        }
        setLoadingConversations(false);
    }, [user]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const fetchMessages = useCallback(async (conversationId: number) => {
        setLoadingMessages(true);
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        
        setMessages(data || []);
        setLoadingMessages(false);
    }, []);

    const selectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        fetchMessages(conversation.id);
    };
    
    const startConversation = async (recipientId: string): Promise<Conversation | null> => {
        if (!user || user.id === recipientId) return null;
        
        // Check if a conversation already exists
        const { data: existing, error: existingError } = await supabase
            .from('conversations')
            .select('*')
            .or(`(participant_one_id.eq.${user.id},participant_two_id.eq.${recipientId}),(participant_one_id.eq.${recipientId},participant_two_id.eq.${user.id})`)
            .single();

        if (existing) {
            return existing;
        }

        // If not, create a new one
        const { data: newConversation, error: newError } = await supabase
            .from('conversations')
            .insert({ participant_one_id: user.id, participant_two_id: recipientId })
            .select()
            .single();
        
        if (newError) {
            console.error("Error creating conversation:", newError);
            return null;
        }
        
        await fetchConversations();
        return newConversation;
    };


    const sendMessage = async (content: string) => {
        if (!user || !selectedConversation) {
            return { error: new Error("No user or conversation selected") };
        }
        const { error } = await supabase
            .from('messages')
            .insert({
                conversation_id: selectedConversation.id,
                sender_id: user.id,
                content: content.trim()
            });
        return { error };
    };
    
    // Real-time listener for new messages
    useEffect(() => {
        const channel = supabase.channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMessage = payload.new as Message;
                if (newMessage.conversation_id === selectedConversation?.id) {
                    setMessages(currentMessages => [...currentMessages, newMessage]);
                }
                // Also update conversation list to show new last message (optional enhancement)
                fetchConversations();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation, fetchConversations]);

    const value = useMemo(() => ({
        conversations,
        messages,
        selectedConversation,
        loadingConversations,
        loadingMessages,
        selectConversation,
        sendMessage,
        startConversation
    }), [conversations, messages, selectedConversation, loadingConversations, loadingMessages]);

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
};
