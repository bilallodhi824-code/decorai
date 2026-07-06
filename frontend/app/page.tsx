'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sliders, CheckCircle2, ChevronDown, ArrowRight, Layers, ShieldCheck } from 'lucide-react';

const stats = [
  { value: '350K+', label: 'Transformations Rendered' },
  { value: '99.2%', label: 'Accuracy Rating' },
  { value: '24+', label: 'Design Styles' },
  { value: '< 4s', label: 'Generation Speed' }
];

const styles = [
  { name: 'Modern', image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=350&fit=crop', desc: 'Sleek surfaces, geometric balance.' },
  { name: 'Scandinavian', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=350&fit=crop', desc: 'Minimalist warmth, wood & linen.' },
  { name: 'Luxury', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=350&fit=crop', desc: 'Velvets, gold trim, premium accents.' },
  { name: 'Japanese (Zen)', image: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=350&fit=crop', desc: 'Bamboo frames, earth colors.' },
  { name: 'Industrial', image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=350&fit=crop', desc: 'Exposed bricks, concrete, iron.' },
  { name: 'Bohemian', image: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=350&fit=crop', desc: 'Textured fabrics, hanging plants.' }
];

const features = [
  {
    icon: <Camera className="w-6 h-6 text-primary" />,
    title: 'Photorealistic Renderings',
    description: 'Transform real-world room pictures into publication-quality high-res design visuals with precise architectural accuracy.'
  },
  {
    icon: <Layers className="w-6 h-6 text-primary" />,
    title: 'Curated Color Palettes',
    description: 'Receive matched color swatches grounded in professional color theory, contrast ratios, and material pairing guides.'
  },
  {
    icon: <Sliders className="w-6 h-6 text-primary" />,
    title: 'Budget Allocation Planning',
    description: 'Define your cost limits and get itemized furniture and structural adjustment breakdowns fitted to your budget.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    title: 'Enterprise-Grade Security',
    description: 'Secure image uploads, private cloud databases, role-based access control, and team collaboration management.'
  }
];

const faqs = [
  {
    q: "How does the DecorAI generator work?",
    a: "It utilizes specialized deep learning visual models trained on architectural design frameworks. By matching structural lines with your style options, it renders layout transformations while preserving doors, windows, and structural coordinates."
  },
  {
    q: "Can I customize budgets and furniture guides?",
    a: "Absolutely. During generation, you can toggle budget tiers from under $2,000 to over $10,000. The AI generates item shopping lists matching that cost spectrum."
  },
  {
    q: "Are my uploaded photos secure?",
    a: "Yes. All uploads are stored in secure, private Firebase Storage buckets protected by custom security rules. Designs are not shared unless you choose to post them to the public gallery."
  },
  {
    q: "Do you offer a free plan?",
    a: "Yes, our Free plan includes limited monthly generations in standard quality. You can upgrade to Pro or Business at any time for HD downloads and priority queue processing."
  }
];

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 14 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 w-full bg-background font-sans overflow-x-hidden"
    >
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 border-b border-foreground/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl text-center space-y-8"
        >
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-playfair"
          >
            Transform Your Home With <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              AI-Powered
            </span> Interior Design
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-base sm:text-xl text-foreground/75 font-light leading-relaxed"
          >
            Upload your room, choose your style, and let AI create stunning interior transformations within seconds. Real-world items, professional palettes, and budget planning.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/generator"
                className="w-full px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
              >
                Start Designing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/gallery"
                className="w-full px-8 py-4 bg-secondary/5 dark:bg-white/5 border border-foreground/10 hover:border-primary text-foreground font-semibold rounded-xl transition-colors text-center cursor-pointer block"
              >
                View Gallery
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-12 bg-secondary text-white border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 100, delay: idx * 0.08 }}
                key={idx}
                className="space-y-1"
              >
                <p className="text-3xl sm:text-5xl font-extrabold text-primary font-playfair">{stat.value}</p>
                <p className="text-xs sm:text-sm text-neutral-400 font-medium uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR STYLES */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-foreground/5">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair">Popular Design Styles</h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground/60">Explore curated concepts crafted by our AI engine matching global interior architectural standards.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {styles.map((style, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              key={idx}
              className="group rounded-2xl overflow-hidden border border-foreground/5 bg-background shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={style.image}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <h3 className="text-xl font-bold text-white tracking-wide">{style.name}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-foreground/70">{style.desc}</p>
                <Link href={`/generator?style=${style.name}`} className="mt-4 text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 group/btn">
                  Try style <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. PROCESS STEPS */}
      <section className="py-24 bg-secondary/5 dark:bg-black/20 border-b border-foreground/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair">How It Works</h2>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground/60">Three simple steps to unlock high-fidelity room rendering transformations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl mx-auto">1</div>
              <h3 className="text-lg font-bold">Upload Room Photo</h3>
              <p className="text-sm text-foreground/60">Drag and drop or snap a picture of your room from any device. We accept PNG, JPG, and webp.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl mx-auto">2</div>
              <h3 className="text-lg font-bold">Choose Design Scheme</h3>
              <p className="text-sm text-foreground/60">Select from 20+ styles, define your target budget caps, and enter custom design themes.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl mx-auto">3</div>
              <h3 className="text-lg font-bold">Generate Room</h3>
              <p className="text-sm text-foreground/60">Our AI visualizer generates photorealistic transformations, color theories, and list guides in 3 seconds.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-foreground/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair leading-tight">Advanced Features for Creative Planning</h2>
            <p className="text-sm sm:text-base text-foreground/75 leading-relaxed">DecorAI provides professional decorators, staging agents, and homeowners with complete control over digital mockups, palettes, and budgets.</p>
            <div className="pt-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Link href="/services" className="inline-block px-6 py-3.5 bg-secondary text-white dark:bg-white dark:text-black hover:bg-primary hover:text-white rounded-xl font-semibold shadow-md transition-all text-sm cursor-pointer">
                  Explore Services
                </Link>
              </motion.div>
            </div>
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((feat, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.93 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
                key={idx}
                className="p-6 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="p-3 w-fit rounded-xl bg-primary/10">{feat.icon}</div>
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className="text-sm text-foreground/60">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRICING PREVIEW */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-foreground/5 text-center">
        <div className="space-y-4 mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair">Affordable Premium Plans</h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground/60">Unlock HD layouts, priority render queues, and complete support options.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-8 rounded-2xl border border-foreground/5 bg-background flex flex-col justify-between text-left shadow-sm"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Free Plan</h3>
              <p className="text-sm text-foreground/60">Standard visual generation trials.</p>
              <p className="text-3xl font-extrabold">$0 <span className="text-xs text-foreground/45 font-medium">/ month</span></p>
              <ul className="space-y-3 pt-6 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> 5 standard renders/mo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> 8 interior styles</li>
                <li className="flex items-center gap-2 text-foreground/40"><CheckCircle2 className="w-4 h-4 shrink-0" /> No HD Downloads</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8 py-3 text-center rounded-xl bg-secondary/5 dark:bg-white/5 border border-foreground/10 text-foreground font-semibold hover:border-primary transition-colors text-sm cursor-pointer">
              Get Started
            </Link>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.2 } }}
            className="p-8 rounded-2xl border-2 border-primary bg-background flex flex-col justify-between text-left relative shadow-lg"
          >
            <span className="absolute -top-3.5 right-8 px-3.5 py-1 bg-primary text-white text-[10px] uppercase font-bold tracking-widest rounded-full">Popular Choice</span>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Pro Plan</h3>
              <p className="text-sm text-foreground/60">Perfect for design enthusiasts.</p>
              <p className="text-3xl font-extrabold">$29 <span className="text-xs text-foreground/45 font-medium">/ month</span></p>
              <ul className="space-y-3 pt-6 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Unlimited generations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> HD renders + downloads</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Priority processing</li>
              </ul>
            </div>
            <Link href="/pricing" className="mt-8 py-3 text-center rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors text-sm shadow-md shadow-primary/20 cursor-pointer">
              Upgrade to Pro
            </Link>
          </motion.div>

          {/* Business Plan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-8 rounded-2xl border border-foreground/5 bg-background flex flex-col justify-between text-left shadow-sm"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Business</h3>
              <p className="text-sm text-foreground/60">For professional interior studios.</p>
              <p className="text-3xl font-extrabold">$89 <span className="text-xs text-foreground/45 font-medium">/ month</span></p>
              <ul className="space-y-3 pt-6 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Collaborative workspaces</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Client layout exports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> Dedicated API channels</li>
              </ul>
            </div>
            <Link href="/pricing" className="mt-8 py-3 text-center rounded-xl bg-secondary/5 dark:bg-white/5 border border-foreground/10 text-foreground font-semibold hover:border-primary transition-colors text-sm cursor-pointer">
              Upgrade to Business
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair">Frequently Asked Questions</h2>
          <p className="text-sm sm:text-base text-foreground/60">Have questions about DecorAI? Here are general answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={idx}
                className="border border-foreground/10 rounded-xl overflow-hidden bg-background"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between font-bold text-left hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-sm text-foreground/70 leading-relaxed border-t border-foreground/5 bg-secondary/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

    </motion.div>
  );
}
