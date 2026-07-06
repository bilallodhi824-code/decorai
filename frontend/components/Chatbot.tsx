'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { useAuth } from '../app/context/AuthContext';
import { useTheme } from '../app/context/ThemeContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Ayaan, your DecorAI Design Consultant. How can I help you transform your space today? Ask me about color palettes, furniture layouts, or interior styles!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue('');
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMsg, timestamp: new Date() } as ChatMessage];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Clean history for API
      const history = newMessages.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Local fallback in case server is completely offline
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to my central design studio right now. Please ensure the backend server is running on port 5000, or try our web services!",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      <AnimatePresence>
        
        {/* Toggle Button */}
        {!isOpen && (
          <motion.button
            key="chatbot-toggle"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-5 py-4 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent text-white shadow-xl shadow-primary/20 hover:shadow-2xl cursor-pointer transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold tracking-wide hidden sm:inline">AI Designer</span>
          </motion.button>
        )}

        {/* Chat window container */}
        {isOpen && (
          <motion.div
            key="chatbot-window"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 150, damping: 18 }}
            className="w-[350px] sm:w-[400px] h-[500px] rounded-2xl glass-luxury border shadow-2xl flex flex-col overflow-hidden"
          >
            
            {/* Header */}
            <div className="p-4 bg-secondary/10 dark:bg-white/5 backdrop-blur-md text-foreground flex items-center justify-between border-b border-foreground/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-wide">Ayaan — AI Designer</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
                    <span className="text-[10px] text-foreground/60">Design Consultant Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-4 pt-6 space-y-4 bg-background/50">
              {messages.map((msg, index) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    key={index}
                    className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-secondary/5 dark:bg-white/5 border border-foreground/5 text-foreground rounded-tl-none'
                          : `bg-primary ${theme === 'dark' ? 'text-neutral-950 font-semibold' : 'text-white font-medium'} rounded-tr-none shadow-md shadow-primary/10`
                      }`}
                    >
                      {msg.content}
                      <span className={`block text-[9px] mt-1 text-right ${isAssistant ? 'text-foreground/45' : theme === 'dark' ? 'text-neutral-950/60' : 'text-white/60'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-secondary/5 dark:bg-white/5 border border-foreground/5 rounded-2xl rounded-tl-none p-3.5 flex items-center space-x-1.5"
                  >
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.span
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  </motion.div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-foreground/5 bg-background flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about styles, textures, paint colors..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 h-11 bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-4 text-sm focus:outline-none focus:border-primary text-foreground placeholder-foreground/50 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors shadow-md shadow-primary/15 hover:shadow-lg cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
