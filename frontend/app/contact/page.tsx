'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 14 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.5 }}
      className="flex-grow w-full bg-background font-sans py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12"
    >
      
      {/* Left Column: Form */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 85 }}
        className="lg:col-span-7 space-y-6"
      >
        <div className="p-8 rounded-2xl glass-luxury border space-y-6">
          <div className="space-y-2 border-b border-foreground/5 pb-4">
            <h2 className="text-2xl font-bold tracking-wide font-playfair">Send Us an Inquiry</h2>
            <p className="text-sm text-foreground/60">Our design consultants will respond within 12 hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-foreground/80">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-foreground/80">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-foreground/80">Message</label>
              <textarea
                placeholder="Describe your design specifications or subscription queries..."
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-secondary/5 dark:bg-white/5 border border-foreground/10 rounded-xl px-3.5 py-3 focus:outline-none focus:border-primary text-foreground resize-none transition-colors"
              />
            </div>

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3.5 rounded-xl bg-success/10 border border-success/20 text-xs text-success flex items-start gap-2"
              >
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>Thank you! Your message was sent successfully.</span>
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/10 hover:shadow-lg transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" /> Sending message...
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" /> Send Message
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Right Column: Contact details & Interactive Mock Map */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 85 }}
        className="lg:col-span-5 space-y-6"
      >
        
        {/* Contact details */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-4 text-sm"
        >
          <h3 className="font-bold text-lg border-b border-foreground/5 pb-2">Design Headquarters</h3>
          
          <motion.div variants={itemVariants} className="flex items-center gap-3 py-1">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">Inquiries</p>
              <a href="mailto:support@decorai.com" className="font-medium hover:underline text-foreground">support@decorai.com</a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3 py-1">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Phone className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">Hotline</p>
              <a href="tel:+18005550199" className="font-medium hover:underline text-foreground">+1 (800) 555-0199</a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3 py-1">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">Studio Office</p>
              <p className="font-medium text-foreground">500 Luxury Ave, Suite 10, New York, NY</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Digital Coordinate Map Mock */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="h-64 rounded-2xl border border-foreground/5 bg-secondary overflow-hidden relative shadow-inner flex items-center justify-center text-center p-6 text-white select-none"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-secondary opacity-60" />
          
          {/* Coordinates grid line overlays */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="border border-white" />
            ))}
          </div>

          <div className="z-10 space-y-2">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <MapPin className="w-8 h-8 text-primary mx-auto" />
            </motion.div>
            <h4 className="font-bold text-sm tracking-wide">40.7128&deg; N, 74.0060&deg; W</h4>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">New York Studio Coordinates</p>
          </div>
        </motion.div>

      </motion.div>

    </motion.div>
  );
}
