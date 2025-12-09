import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Heart, Plus, Minus, ChevronUp, Star, Navigation } from 'lucide-react';

// --- Design Tokens (Derived from Klook-UI) ---
const KLOOK_ORANGE = '#FF5B00';
const KLOOK_CYAN = '#00CBD1';
const KLOOK_PURPLE = '#4D40CC';
const FONT_POPPINS = 'font-[Poppins]';
const FONT_NOTO = 'font-[Noto Sans SC]';

// --- Mock Data ---
const MOCK_POIS = [
  {
    id: 1,
    name: '大家 (Ufuya) 百年古宅',
    type: 'Restaurant',
    rating: 4.8,
    tags: ['本地必吃', '阿古猪', '景观位'],
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800',
    price: '¥3000/人',
    description: '隐藏在森林里的百年古宅，必点阿古猪火锅。'
  },
  {
    id: 2,
    name: '古宇利岛 (Kouri Island)',
    type: 'Attraction',
    rating: 4.9,
    tags: ['果冻海', '自驾天堂'],
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80&w=800',
    price: '免费',
    description: '开车穿过跨海大桥的瞬间，你会爱上冲绳。'
  }
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'ai',
    content: '嗨！我是你在冲绳的本地朋友 K-Bot。🍊',
    type: 'text'
  },
  {
    id: 2,
    role: 'ai',
    content: '看到你这次计划玩 5 天，主要想放松。那我建议我们避开国际通，直接去北部看海？这是大概的方位。',
    type: 'text'
  },
  {
    id: 3,
    role: 'ai',
    content: 'map_preview', // Special type for map card
    type: 'map'
  }
];

// --- Components ---

/**
 * Message Bubble Component
 * Displays chat messages with distinct styles for User and AI.
 */
const MessageBubble = ({ message }) => {
  const isAi = message.role === 'ai';
  
  if (message.type === 'map') {
    return (
      <div className="flex w-full mb-4 animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-sm">🤖</span>
        </div>
        <div className="bg-white rounded-2xl rounded-tl-none overflow-hidden shadow-sm border border-gray-100 w-64">
           <div className="h-32 bg-blue-100 relative">
             <div className="absolute inset-0 flex items-center justify-center text-blue-400 opacity-50">
                <MapPin size={32} />
             </div>
             {/* Mock Map Visual */}
             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                北部的冲绳
             </div>
           </div>
           <div className="p-3">
             <h4 className="font-bold text-gray-800 text-sm mb-1">推荐探索区域</h4>
             <p className="text-xs text-gray-500">包括古宇利岛、美丽海水族馆区域</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isAi ? 'justify-start' : 'justify-end'}`}>
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2 flex-shrink-0 border border-gray-200">
          <span className="text-sm">🤖</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isAi
            ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
            : 'text-white rounded-tr-none'
        }`}
        style={{ backgroundColor: isAi ? '#FFFFFF' : KLOOK_ORANGE }}
      >
        {message.content}
      </div>
    </div>
  );
};

/**
 * POI Card Component
 * Swipeable card for inspiration.
 */
const PoiCard = ({ data, onAddToBucket }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 mb-4 flex-shrink-0 w-64 mr-3 snap-center">
      <div className="h-32 relative">
        <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-bold flex items-center text-gray-700">
          <Star size={12} className="text-yellow-400 mr-1 fill-current" />
          {data.rating}
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{data.name}</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{data.description}</p>
        <div className="flex justify-between items-center">
             <span className="text-xs font-medium text-gray-400">{data.price}</span>
             <button 
                onClick={() => onAddToBucket(data)}
                className="p-2 rounded-full bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors"
             >
                <Plus size={16} />
             </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Bucket List Drawer (Bottom Sheet)
 */
const BucketListDrawer = ({ items, isOpen, setIsOpen }) => {
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-y-0' : 'translate-y-[85%]'}`}
      style={{ height: '70vh' }}
    >
      {/* Handle */}
      <div 
        className="w-full h-8 flex items-center justify-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-6 pb-4 flex justify-between items-center border-b border-gray-50">
        <div>
           <h2 className="text-lg font-bold text-gray-800">我的心愿单 🧡</h2>
           <p className="text-xs text-gray-500">{items.length} 个灵感待打卡</p>
        </div>
        <button className="text-sm font-medium text-blue-500 flex items-center">
           生成路线 <Navigation size={14} className="ml-1"/>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto h-[calc(100%-80px)]">
         {items.length === 0 ? (
           <div className="text-center py-10 text-gray-400 text-sm">
              还没有添加地点哦，去聊聊天吧！✨
           </div>
         ) : (
           items.map((item, idx) => (
             <div key={idx} className="flex items-center p-3 mb-3 bg-gray-50 rounded-xl border border-gray-100">
               <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
               <div className="ml-3 flex-1 min-w-0">
                 <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                 <div className="flex gap-2 mt-1">
                   {item.tags.map(tag => (
                     <span key={tag} className="px-1.5 py-0.5 bg-white text-[10px] text-gray-500 rounded border border-gray-200">
                       {tag}
                     </span>
                   ))}
                 </div>
               </div>
               <button className="text-gray-300 hover:text-red-500 px-2">
                 <Heart size={18} className="fill-current" />
               </button>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

export default function TravelBuddyApp() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [bucketList, setBucketList] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    // 1. Add User Message
    const userMsg = { id: Date.now(), role: 'user', content: inputText, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // 2. Simulate AI Response (Logic: If user asks for recommendations, show cards)
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        role: 'ai', 
        content: '既然去了北部，这两家非常值得一去！一家是吃猪肉火锅的，另一家适合兜风拍照。👇', 
        type: 'text' 
      };
      setMessages(prev => [...prev, aiResponse]);
      
      // Add a special "Card Carousel" message logic purely for demo
      setTimeout(() => {
         setMessages(prev => [...prev, { id: Date.now() + 2, role: 'ai', type: 'carousel', data: MOCK_POIS }]);
      }, 500);

    }, 1000);
  };

  const addToBucket = (item) => {
    if (!bucketList.find(i => i.id === item.id)) {
      setBucketList([...bucketList, item]);
      // Small feedback interaction could go here
      setIsDrawerOpen(true); // Open drawer slightly to show addition
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans max-w-md mx-auto relative overflow-hidden">
      
      {/* 1. Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md px-4 py-3 sticky top-0 z-10 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
          <h1 className="font-bold text-gray-800 text-lg">冲绳行前群 (2)</h1>
        </div>
        <button className="text-gray-400">
           <span className="sr-only">Settings</span>
           •••
        </button>
      </header>

      {/* 2. Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 pb-40" ref={scrollRef}>
        <div className="text-center text-xs text-gray-400 mb-6 mt-2">
           2023年10月24日 下午 14:30
        </div>
        
        {messages.map(msg => {
          if (msg.type === 'carousel') {
             return (
               <div key={msg.id} className="flex overflow-x-auto pb-4 snap-x hide-scrollbar mb-4">
                 {msg.data.map(poi => (
                    <PoiCard key={poi.id} data={poi} onAddToBucket={addToBucket} />
                 ))}
               </div>
             )
          }
          return <MessageBubble key={msg.id} message={msg} />;
        })}
      </main>

      {/* 3. Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 z-20 pb-8">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input 
            type="text" 
            placeholder="问问有什么好吃的..." 
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className={`ml-2 p-2 rounded-full transition-all ${inputText ? 'bg-[#FF5B00] text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* 4. Bucket List Drawer */}
      <BucketListDrawer items={bucketList} isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />

    </div>
  );
}

