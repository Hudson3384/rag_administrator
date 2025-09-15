
import type { Bot, RAGFile, ChatMessage, Customer } from '../types';

let bots: Bot[] = [
  {
    id: 'bot-1',
    name: 'Customer Support Pro',
    description: 'Handles frequently asked questions about our products and services.',
    systemPrompt: 'You are a friendly and helpful customer support assistant. Use the provided documents to answer user questions accurately.',
    ragFiles: [
      { id: 'file-1', name: 'product_faq.pdf', type: 'application/pdf', size: 1024 * 256, uploadedAt: new Date().toISOString() },
      { id: 'file-2', name: 'return_policy.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1024 * 128, uploadedAt: new Date().toISOString() },
    ],
  },
  {
    id: 'bot-2',
    name: 'Onboarding Specialist',
    description: 'Guides new users through the initial setup process of their accounts.',
    systemPrompt: 'You are an onboarding specialist. Your goal is to help new users get started with the platform. Be encouraging and clear.',
    ragFiles: [
       { id: 'file-3', name: 'getting_started.pdf', type: 'application/pdf', size: 1024 * 512, uploadedAt: new Date().toISOString() },
    ],
  },
];

const customers: Customer[] = [
    { id: 'customer-1', name: 'Alpha Corp' },
    { id: 'customer-2', name: 'Beta Industries' },
    { id: 'customer-3', name: 'Gamma Solutions' },
];

let chatHistories: Record<string, ChatMessage[]> = {
    'bot-1_customer-1': [
        { id: 'msg-1', sender: 'user', text: 'Hi, I have a question about my recent order.', timestamp: new Date(Date.now() - 60000 * 5).toISOString()},
        { id: 'msg-2', sender: 'bot', text: 'Hello! I can certainly help with that. What is your order number?', timestamp: new Date(Date.now() - 60000 * 4).toISOString()},
    ],
    'bot-1_customer-2': [
        { id: 'msg-3', sender: 'user', text: 'What is your return policy?', timestamp: new Date(Date.now() - 60000 * 10).toISOString()},
        { id: 'msg-4', sender: 'bot', text: 'Our return policy allows for returns within 30 days of purchase. Please see our return_policy.docx for full details.', timestamp: new Date(Date.now() - 60000 * 9).toISOString()},
    ],
};

const apiCall = <T,>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

export const getDashboardStats = () => apiCall({
  subscriptions: 1250,
  valuation: 2500000,
  mrrData: [
    { name: 'Jan', mrr: 12000 }, { name: 'Feb', mrr: 15000 }, { name: 'Mar', mrr: 18000 },
    { name: 'Apr', mrr: 17500 }, { name: 'May', mrr: 21000 }, { name: 'Jun', mrr: 24000 },
  ]
});

export const getBots = () => apiCall(bots);
export const getBotById = (id: string) => apiCall(bots.find(b => b.id === id));
export const getCustomers = () => apiCall(customers);

export const createBot = (data: { name: string; description: string; systemPrompt: string }) => {
  const newBot: Bot = {
    ...data,
    id: `bot-${Date.now()}`,
    ragFiles: [],
  };
  bots.push(newBot);
  return apiCall(newBot);
};

export const addRagFile = (botId: string, file: File) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot) return Promise.reject(new Error('Bot not found'));
    
    const newFile: RAGFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
    };
    bot.ragFiles.push(newFile);
    return apiCall(newFile);
}

export const getChatHistory = (botId: string, customerId: string) => {
    const key = `${botId}_${customerId}`;
    if(!chatHistories[key]) {
        chatHistories[key] = [];
    }
    return apiCall(chatHistories[key]);
}

export const sendMessage = async (botId: string, customerId: string, text: string) => {
    const key = `${botId}_${customerId}`;
    const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toISOString()
    };
    if(!chatHistories[key]) chatHistories[key] = [];
    chatHistories[key].push(userMessage);

    await apiCall(null, 1000); // Simulate bot thinking

    const botResponse: ChatMessage = {
        id: `msg-${Date.now()+1}`,
        sender: 'bot',
        text: `This is a simulated response to: "${text}". I would typically use the RAG files to provide a more accurate answer.`,
        timestamp: new Date().toISOString()
    };
    chatHistories[key].push(botResponse);
    
    return apiCall(botResponse);
}
