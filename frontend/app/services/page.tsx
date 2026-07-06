'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Compass } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  features: string[];
  roomType: string;
}

const services: ServiceItem[] = [
  {
    id: 'living',
    title: 'Living Room Design',
    description: 'Transform your main seating space into an inviting, premium communal hub with custom focal walls and luxury couches.',
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=600&fit=crop',
    price: '$29 / render',
    features: ['Chandelier & lighting layouts', 'Acoustic treatment zones', 'Sectional couch coordinates', 'Custom media console designs'],
    roomType: 'Living Room'
  },
  {
    id: 'bedroom',
    title: 'Bedroom Design',
    description: 'Craft a peaceful, restorative sanctuary. Optimize layouts for bed structures, nightstands, and soft ambient backlighting.',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&fit=crop',
    price: '$29 / render',
    features: ['Accent bed wall sizing', 'Wardrobe spacing layout', 'Organic fabric selection', 'Muted color suggestions'],
    roomType: 'Bedroom'
  },
  {
    id: 'kitchen',
    title: 'Kitchen Design',
    description: 'Balance functional cooking layouts with premium dining aesthetics. Formulate island setups and storage systems.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&fit=crop',
    price: '$49 / render',
    features: ['Countertop quartz selection', 'Storage optimization maps', 'Appliance integration details', 'Bar stool coordinates'],
    roomType: 'Kitchen'
  },
  {
    id: 'bathroom',
    title: 'Bathroom Design',
    description: 'Turn your standard wash space into a zen, spa-like escape utilizing stone finishes, walk-in showers, and ambient mirrors.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&fit=crop',
    price: '$29 / render',
    features: ['River stone cladding tips', 'Rain shower hardware styles', 'Floating vanity measurements', 'Backlit LED mirror specs'],
    roomType: 'Bathroom'
  },
  {
    id: 'office',
    title: 'Office Design',
    description: 'Boost deep work concentration with ergonomic desk planning, dynamic storage shelves, and glare-free lighting schemes.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&fit=crop',
    price: '$29 / render',
    features: ['Ergonomic desk positioning', 'Video backdrop templates', 'Bookshelf floating structures', 'Natural light optimizations'],
    roomType: 'Office'
  },
  {
    id: 'outdoor',
    title: 'Outdoor Design',
    description: 'Design premium terraces, pool decks, or gardens with weather-proof furniture layouts and cozy fire-pit assemblies.',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=600&fit=crop',
    price: '$49 / render',
    features: ['Teak wood lounge settings', 'Weather-proof fabrics list', 'Accent lighting plans', 'Potted greenery spacing'],
    roomType: 'Outdoor'
  },
  {
    id: 'apartment',
    title: 'Apartment Design',
    description: 'Unlock multi-functional layouts tailored to small spaces. Utilize partition systems and convertible furniture.',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&fit=crop',
    price: '$59 / project',
    features: ['Convertible couch recommendations', 'Foldable desk assemblies', 'Mirror reflection expansions', 'Vertical storage systems'],
    roomType: 'Apartment'
  },
  {
    id: 'fullhouse',
    title: 'Full House Design',
    description: 'Maintain fluid stylistic transitions across all rooms. A unified visual design package for your entire residence.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=600&fit=crop',
    price: '$199 / package',
    features: ['Unified material catalogs', 'Color transitions flowmaps', 'Whole house style audit', 'Vip processing queue'],
    roomType: 'Full House'
  }
];

export default function ServicesPage() {
  return (
    <div className="flex-1 w-full bg-background font-sans py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-wider text-primary">
          <Compass className="w-3.5 h-3.5" /> Premium Architectural Offerings
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-playfair">
          Our Specialization Offerings
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-foreground/60 leading-relaxed font-light">
          Choose a target room package to generate custom visual coordinates. Fully styled and optimized by DecorAI.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="group flex flex-col justify-between rounded-2xl overflow-hidden border border-foreground/5 bg-background shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 text-white font-bold text-xs rounded-full backdrop-blur-md">
                  {service.price}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold tracking-wide group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-xs text-foreground/65 leading-relaxed">{service.description}</p>
                
                <div className="border-t border-foreground/5 pt-4 space-y-2">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-foreground/75">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href={`/generator?roomType=${service.roomType}`}
                className="w-full py-3 rounded-lg border border-primary/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary text-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
              >
                Redesign Room <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
