// ===== ChatBubble.jsx (Dipindahkan ke Kiri Bawah) =====

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react'; 
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { toast } from '../ui/use-toast';
import { aiAPI } from '../../services/api'; 

// Definisikan tipe pesan
const initialMessages = [
  {
    sender: 'AI',
    text: 'Halo! Ada yang bisa saya bantu terkait manajemen talenta ASN? Tanyakan tentang skor talenta atau fairness.',
  },
];

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref untuk menggulir ke bawah
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { sender: 'User', text: inputMessage.trim() };
    
    // 1. Tambahkan pesan user ke state
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
        // 2. Panggil API
        const response = await aiAPI.sendMessage(userMessage.text);
        
        // 3. Tambahkan balasan AI ke state
        setMessages((prev) => [...prev, { sender: 'AI', text: response.reply || 'Maaf, terjadi kesalahan saat memproses permintaan.' }]);
    
    } catch (error) {
        toast({
            title: "Error Chat",
            description: error.message,
            variant: "destructive"
        });
        // Jika gagal, tambahkan pesan error dari AI
        setMessages((prev) => [...prev, { sender: 'AI', text: 'Koneksi terputus. Mohon coba lagi.' }]);
        
    } finally {
        setIsLoading(false);
    }
  };

  const MessageComponent = ({ message }) => {
    const isUser = message.sender === 'User';
    
    return (
        <div 
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
        >
            <div className={`flex items-start gap-2.5 max-w-[85%]`}>
                {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white" />
                    </div>
                )}
                <div 
                    className={`flex flex-col leading-1.5 p-3 rounded-xl 
                        ${isUser 
                            ? 'bg-emerald-500 text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-900 rounded-tl-none dark:bg-gray-700 dark:text-white'
                        }`}
                >
                    <p className="text-sm font-normal whitespace-pre-wrap">
                        {message.text}
                    </p>
                </div>
                {isUser && (
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-gray-800" />
                    </div>
                )}
            </div>
        </div>
    );
  };


  return (
    <>
      {/* ========================================================= */}
      {/* PERUBAHAN 1: Tombol Chat dipindah ke LEFT-6 */}
      {/* ========================================================= */}
      <div className="fixed bottom-6 left-6 z-50"> 
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5,
          }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg text-white hover:from-emerald-600 hover:to-teal-700"
          >
            {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 left-6 z-50 w-80" // Ganti right-6 menjadi left-6
          >
            <Card className="shadow-2xl flex flex-col h-[400px]">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg p-4 flex flex-row justify-between items-center">
                <div className="flex items-center gap-3">
                  <Bot size={20} />
                  <p className="font-bold">AI Assistant</p>
                </div>
              </CardHeader>
              
              {/* Message Display Area */}
              <CardContent className="p-4 flex-grow overflow-y-auto custom-scrollbar">
                {messages.map((msg, index) => (
                  <MessageComponent key={index} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                      <div className="flex flex-col leading-1.5 p-3 rounded-xl bg-gray-100 text-gray-900 rounded-tl-none dark:bg-gray-700 dark:text-white">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-0"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Ref untuk auto-scroll */}
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* Input Form */}
              <CardFooter className="p-2 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center w-full space-x-2">
                  <Input 
                    placeholder="Ketik pesanmu..." 
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <Send size={18} />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )};
      </AnimatePresence>
    </>
  );
};

export default ChatBubble;