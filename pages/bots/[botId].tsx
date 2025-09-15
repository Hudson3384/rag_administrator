
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { addRagFile, getBotById, getChatHistory, getCustomers, sendMessage } from '../../services/mockApi';
import type { Bot, RAGFile, Customer, ChatMessage } from '../../types';
import { BotIcon, FileIcon, UploadIcon, SendIcon } from '../../components/icons';

const RAGManager: React.FC<{ bot: Bot, onFileUploaded: (file: RAGFile) => void }> = ({ bot, onFileUploaded }) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploading(true);
            try {
                const newFile = await addRagFile(bot.id, file);
                onFileUploaded(newFile);
            } catch (error) {
                console.error("Upload failed", error);
            } finally {
                setUploading(false);
            }
        }
    };
    
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-white mb-4">RAG Knowledge Base</h3>
            <div className="space-y-3 mb-4">
                {bot.ragFiles.map(file => (
                    <div key={file.id} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                            <FileIcon className="w-5 h-5 text-gray-400 mr-3"/>
                            <span className="text-sm text-white">{file.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
                    </div>
                ))}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-blue-800">
                <UploadIcon className="w-5 h-5 mr-2" />
                {uploading ? 'Uploading...' : 'Upload New File'}
            </button>
        </div>
    );
};

const ChatInterface: React.FC<{ bot: Bot }> = ({ bot }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getCustomers().then(data => {
            setCustomers(data);
            if (data.length > 0) {
                setSelectedCustomer(data[0]);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            getChatHistory(bot.id, selectedCustomer.id).then(setMessages);
        }
    }, [bot.id, selectedCustomer]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedCustomer) return;
        
        setIsSending(true);
        const text = newMessage;
        setNewMessage('');
        
        const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            sender: 'user',
            text,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        const botResponse = await sendMessage(bot.id, selectedCustomer.id, text);
        
        setMessages(prev => {
            const newMessages = prev.filter(m => m.id !== userMessage.id);
            // The mock API adds both user and bot messages, so we just need to refetch.
            // In a real app, we might get just the bot response back.
            getChatHistory(bot.id, selectedCustomer.id).then(setMessages);
            return newMessages; // temp removal
        });

        setIsSending(false);
    };

    return (
         <div className="bg-gray-800 rounded-xl flex flex-col h-[70vh]">
            <div className="p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">Chat Simulation</h3>
                <select 
                    value={selectedCustomer?.id || ''} 
                    onChange={e => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
                    className="bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500 w-full md:w-1/3"
                >
                    {customers.map(c => <option key={c.id} value={c.id}>Chatting as: {c.name}</option>)}
                </select>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <BotIcon className="w-8 h-8 text-blue-500 bg-gray-700 p-1 rounded-full"/>}
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-700 text-gray-300 rounded-bl-lg'}`}>
                           <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex items-center">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={selectedCustomer ? `Message as ${selectedCustomer.name}...` : 'Select a customer to start chatting'}
                    disabled={!selectedCustomer || isSending}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
                <button type="submit" disabled={!selectedCustomer || isSending} className="ml-3 bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-full transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                    <SendIcon className="w-5 h-5"/>
                </button>
            </form>
         </div>
    );
};

const BotDetailPage: React.FC = () => {
    const { botId } = useParams<{ botId: string }>();
    const [bot, setBot] = useState<Bot | null>(null);

    const fetchBot = useCallback(() => {
        if (botId) {
            getBotById(botId).then(data => setBot(data || null));
        }
    }, [botId]);
    
    useEffect(() => {
        fetchBot();
    }, [fetchBot]);

    const handleFileUploaded = (newFile: RAGFile) => {
       fetchBot(); // Refetch bot to update file list
    };

    if (!bot) {
        return <div className="text-center p-10">Loading bot details...</div>;
    }

    return (
        <div className="space-y-8">
            <Link to="/bots" className="text-blue-500 hover:underline">&larr; Back to all bots</Link>
            <h1 className="text-3xl font-bold text-white">{bot.name}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-xl font-bold text-white mb-2">Configuration</h3>
                        <p className="text-sm text-gray-400 mb-4">{bot.description}</p>
                        <h4 className="text-md font-semibold text-white mt-4 mb-2">System Prompt</h4>
                        <p className="text-sm bg-gray-900 p-3 rounded-md font-mono text-gray-300 whitespace-pre-wrap">{bot.systemPrompt}</p>
                    </div>
                     <RAGManager bot={bot} onFileUploaded={handleFileUploaded} />
                </div>
                <div className="lg:col-span-2">
                    <ChatInterface bot={bot} />
                </div>
            </div>
        </div>
    );
};

export default BotDetailPage;
