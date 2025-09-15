
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createBot, getBots } from '../../services/mockApi';
import type { Bot } from '../../types';
import { BotIcon, PlusIcon } from '../../components/icons';

const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => (
    <Link to={`/bots/${bot.id}`} className="block bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105">
        <div className="flex items-center mb-4">
            <BotIcon className="w-8 h-8 text-blue-500 mr-4" />
            <h3 className="text-xl font-bold text-white">{bot.name}</h3>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2">{bot.description}</p>
        <div className="mt-4 text-xs text-gray-500">
            {bot.ragFiles.length} RAG File(s)
        </div>
    </Link>
);

const CreateBotModal: React.FC<{ onClose: () => void; onBotCreated: (newBot: Bot) => void }> = ({ onClose, onBotCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const newBot = await createBot({ name, description, systemPrompt });
            onBotCreated(newBot);
        } catch (error) {
            console.error("Failed to create bot", error);
        } finally {
            setIsCreating(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-6">Create a New Bot</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Bot Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-400 mb-1">System Prompt</label>
                        <textarea id="systemPrompt" value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={5} required className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white font-mono text-sm focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={isCreating} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed">
                            {isCreating ? 'Creating...' : 'Create Bot'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const BotsPage: React.FC = () => {
    const [bots, setBots] = useState<Bot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        getBots().then(data => {
            setBots(data);
            setIsLoading(false);
        });
    }, []);

    const handleBotCreated = (newBot: Bot) => {
        setBots(prevBots => [...prevBots, newBot]);
    }

    if (isLoading) return <div className="text-center p-10">Loading bots...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">My Bots</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create New Bot
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map(bot => <BotCard key={bot.id} bot={bot} />)}
            </div>

            {isModalOpen && <CreateBotModal onClose={() => setIsModalOpen(false)} onBotCreated={handleBotCreated}/>}
        </div>
    );
};

export default BotsPage;
