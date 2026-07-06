'use client';

import React from 'react';
import { Award, Users, Shield, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'Muhammad Bilal',
    role: 'CEO & Founder',
    image: '/bilal.jpg',
    bio: 'Former architectural director with 2-3 years leading high-end commercial stagers.',
    objectPosition: 'object-top'
  },
  {
    name: 'Ayaan Tanveer',
    role: 'Principal Interior Architect',
    image: '/ayaan.jpg',
    bio: 'Nordic minimalist designer. Specialized in space layout efficiency.',
    objectPosition: 'object-top'
  },
  {
    name: 'Muhammad Bilal',
    role: 'Lead AI Engineer',
    image: '/bilal.jpg',
    bio: 'Stanford CS graduate. Pioneer in visual diffusion models and deep architecture learning.',
    objectPosition: 'object-top'
  }
];

export default function AboutPage() {
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
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 14 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.5 }}
      className="flex-grow w-full bg-background font-sans py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24"
    >
      
      {/* Upper banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 85 }}
          className="lg:col-span-6 space-y-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-wider text-primary">
            <Compass className="w-3.5 h-3.5" /> Our Studio Narrative
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-playfair leading-tight">
            Pioneering the Digital <br />
            Interior Frontier
          </h1>
          <p className="text-sm sm:text-base text-foreground/75 leading-relaxed">
            Founded in 2024, DecorAI was born from a simple thesis: interior design should be instant, personal, and premium. By combining the precision of spatial AI with classical architectural guidelines, we help stagers, homeowners, and realtors render visual layout options in seconds instead of weeks.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 85 }}
          className="lg:col-span-6 h-96 overflow-hidden rounded-3xl border border-primary/10 shadow-lg"
        >
          <motion.img
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&fit=crop"
            alt="Studio office layout"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Grid Values */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-8"
      >
        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-8 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Our Mission</h3>
          <p className="text-xs text-foreground/60 leading-relaxed font-light">
            To democratize high-fidelity interior styling by equipping creators and design studios with zero-latency visual rendering tools.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-8 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Our Vision</h3>
          <p className="text-xs text-foreground/60 leading-relaxed font-light">
            To make DecorAI the global standard backend for digital staging, room visualization, and furniture catalog integration.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ y: -4 }} className="p-8 rounded-2xl border border-foreground/5 bg-background shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Our Integrity</h3>
          <p className="text-xs text-foreground/60 leading-relaxed font-light">
            Encapsulating private user data inside secure cloud vaults and providing reliable color theory calculations.
          </p>
        </motion.div>
      </motion.div>

      {/* Team section */}
      <div className="space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair">Meet Our Founders</h2>
          <p className="max-w-md mx-auto text-sm text-foreground/60">A diverse team of architects, deep learning engineers, and creative artists.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          {teamMembers.map((member, idx) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              key={idx}
              className="p-6 rounded-2xl border border-foreground/5 bg-background text-center shadow-sm space-y-4 hover:shadow-lg transition-all"
            >
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={member.image}
                  alt={member.name}
                  className={`w-full h-full rounded-full object-cover ${member.objectPosition || 'object-center'} mx-auto border-2 border-primary/20`}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-xs text-primary font-semibold">{member.role}</p>
              </div>
              <p className="text-xs text-foreground/60 leading-relaxed max-w-xs mx-auto font-light">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* 4. DESIGN PHILOSOPHY SECTION */}
      <div className="space-y-12 border-t border-foreground/5 pt-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair">Our Design Philosophy</h2>
          <p className="max-w-xl mx-auto text-sm text-foreground/60">How we blend classical architectural guidelines with advanced digital engineering.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl border border-foreground/5 bg-background shadow-sm hover:shadow-md transition-shadow space-y-4"
          >
            <h4 className="font-bold text-lg text-primary">01. Spatial Symmetry</h4>
            <p className="text-xs text-foreground/70 leading-relaxed font-light">
              We believe in preserving the physical blueprint integrity. Our neural network models are programmed to respect existing door, window, and structural load coordinates while introducing aesthetic layout updates.
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl border border-foreground/5 bg-background shadow-sm hover:shadow-md transition-shadow space-y-4"
          >
            <h4 className="font-bold text-lg text-primary">02. Curated Sourcing</h4>
            <p className="text-xs text-foreground/70 leading-relaxed font-light">
              AI design is only as good as its real-world execution. Every color swatch and texture recommendation corresponds to professional catalog indexes and material lists, allowing realistic translation from render to reality.
            </p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl border border-foreground/5 bg-background shadow-sm hover:shadow-md transition-shadow space-y-4"
          >
            <h4 className="font-bold text-lg text-primary">03. Cultural Harmony</h4>
            <p className="text-xs text-foreground/70 leading-relaxed font-light">
              From the warm coziness of Scandinavian hygge to the absolute simplicity of Japanese Zen and the geometric balances of modern styling, we honor global design languages with meticulous detail.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* 5. STUDIO MILESTONE TIMELINE */}
      <div className="space-y-12 border-t border-foreground/5 pt-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-playfair">Studio Milestones</h2>
          <p className="max-w-xl mx-auto text-sm text-foreground/60">Our growth narrative from a simple staging engine to a global architectural platform.</p>
        </div>

        <div className="relative border-l border-primary/20 ml-4 md:ml-32 space-y-12">
          {/* Milestone 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 90, damping: 15 }}
            className="relative pl-8 md:pl-12 group"
          >
            <span className="absolute -left-3 top-1.5 w-6 h-6 rounded-full bg-background border-4 border-primary shadow-sm group-hover:scale-125 transition-transform duration-300" />
            <div className="space-y-2">
              <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase">2024 - Foundation</span>
              <h4 className="text-lg font-bold">DecorAI Studio Launch</h4>
              <p className="text-xs text-foreground/60 leading-relaxed max-w-2xl font-light">
                Founded by Muhammad Bilal and Ayaan Tanveer in Dubai. Launched our initial spatial rendering visual models, serving our first 10,000 automated room designs for residential staging agents.
              </p>
            </div>
          </motion.div>

          {/* Milestone 2 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.15 }}
            className="relative pl-8 md:pl-12 group"
          >
            <span className="absolute -left-3 top-1.5 w-6 h-6 rounded-full bg-background border-4 border-primary shadow-sm group-hover:scale-125 transition-transform duration-300" />
            <div className="space-y-2">
              <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase">2025 - Series A Funding</span>
              <h4 className="text-lg font-bold">High-Fidelity Diffusion Staging</h4>
              <p className="text-xs text-foreground/60 leading-relaxed max-w-2xl font-light">
                Secured seed investment to integrate proprietary visual diffusion workflows. Introduced HD rendering, color theory generators, and private cloud storage buckets for enterprise design teams.
              </p>
            </div>
          </motion.div>

          {/* Milestone 3 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 90, damping: 15, delay: 0.3 }}
            className="relative pl-8 md:pl-12 group"
          >
            <span className="absolute -left-3 top-1.5 w-6 h-6 rounded-full bg-background border-4 border-primary shadow-sm group-hover:scale-125 transition-transform duration-300" />
            <div className="space-y-2">
              <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase">2026 - Enterprise Expansion</span>
              <h4 className="text-lg font-bold">Studio Workspaces & API Channels</h4>
              <p className="text-xs text-foreground/60 leading-relaxed max-w-2xl font-light">
                Released multiplayer team work groups and real estate API staging integrations, serving over 350,000 photorealistic room transformations worldwide.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
