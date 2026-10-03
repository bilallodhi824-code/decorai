import OpenAI from 'openai';

export interface AIAnalysisRequest {
  roomType: string;
  style: string;
  budget: string;
  theme?: string;
  originalImageUrl?: string;
}

export interface AIAnalysisResponse {
  responseText: string;
  generatedImageUrl: string;
  promptSuggestions: string;
}

// Map of high quality visual representations for mock generator responses
const STYLE_ROOM_IMAGES: Record<string, Record<string, string>> = {
  'Modern': {
    'Living Room': 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?q=80&w=800&fit=crop',
    'Kitchen': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&fit=crop',
    'Bathroom': 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=800&fit=crop',
    'Office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&fit=crop'
  },
  'Scandinavian': {
    'Living Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&fit=crop',
    'Kitchen': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&fit=crop',
    'Bathroom': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&fit=crop',
    'Office': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&fit=crop'
  },
  'Luxury': {
    'Living Room': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&fit=crop',
    'Kitchen': 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=800&fit=crop',
    'Bathroom': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800&fit=crop',
    'Office': 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&fit=crop'
  },
  'Japanese': {
    'Living Room': 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&fit=crop',
    'Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&fit=crop',
    'Bathroom': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=800&fit=crop'
  },
  'Industrial': {
    'Living Room': 'https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&fit=crop',
    'Kitchen': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&fit=crop',
    'Bathroom': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&fit=crop'
  },
  'Minimalist': {
    'Living Room': 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800&fit=crop'
  },
  'Bohemian': {
    'Living Room': 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&fit=crop'
  },
  'Contemporary': {
    'Living Room': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&fit=crop',
    'Bedroom': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&fit=crop',
    'default': 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&fit=crop'
  }
};

const defaultImage = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&fit=crop';

export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      this.openai = new OpenAI({ apiKey });
      console.log('AIService: OpenAI client initialized.');
    } else {
      console.log('AIService: Running in mock AI mode (no OpenAI API key).');
    }
  }

  /**
   * Generates design suggestions and performs visual transformation on the room
   */
  async generateDesign(req: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const { roomType, style, budget, theme } = req;
    
    // 1. Generate text suggestions using OpenAI if available
    let responseText = '';
    let promptSuggestions = '';

    if (this.openai) {
      try {
        const systemPrompt = `You are a world-class luxury interior designer at DecorAI. 
Analyze the room type: "${roomType}" under the style scheme "${style}" with a budget level of "${budget}"${theme ? ` and specific theme "${theme}"` : ''}.
Provide an elegant, detailed layout analysis. Specify:
1. Architectural recommendations (wall treatments, floors).
2. Furniture selection and layout alignment.
3. Luxury color palette recommendation (hex codes or elegant names).
4. Lighting solutions (spotlights, dimmers, natural flow).
Keep the tone highly professional, inspiring, and concise.`;

        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Generate layout analysis for my ${roomType}.` }],
          temperature: 0.7,
          max_tokens: 500
        });

        responseText = completion.choices[0]?.message?.content || '';
        promptSuggestions = `A beautiful ${style} style transformation of a ${roomType} using premium spacing.`;
      } catch (err) {
        console.error('OpenAI suggestion generation failed, falling back to template.', err);
        const fallbacks = this.getMockTextSuggestions(req);
        responseText = fallbacks.responseText;
        promptSuggestions = fallbacks.promptSuggestions;
      }
    } else {
      const fallbacks = this.getMockTextSuggestions(req);
      responseText = fallbacks.responseText;
      promptSuggestions = fallbacks.promptSuggestions;
    }

    // 2. Resolve image output (DALLE 3 or high quality mock template)
    let generatedImageUrl = '';
    const imageApiKey = process.env.IMAGE_GENERATION_API_KEY;

    if (imageApiKey && this.openai) {
      try {
        // Build an advanced prompt incorporating the user's custom theme requirements
        const themePromptPart = theme ? `, incorporating these specific design instructions: "${theme}"` : '';
        const imagePrompt = `A premium, high-end, luxury professional interior design photograph of a ${roomType} completely transformed and redesigned in a high-fidelity ${style} style${themePromptPart}. Designed to reflect a budget tier of ${budget}. Architectural Digest quality, ultra-detailed, cinematic soft lighting, realistic shadows, photorealistic 8k, perfectly composed furniture layout, showing the complete beautifully styled space.`;

        // Run DALL-E 3 image generation
        const response = await this.openai.images.generate({
          model: 'dall-e-3',
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024',
        });
        generatedImageUrl = (response && response.data && response.data[0]?.url) || this.getMockImage(style, roomType);
      } catch (err) {
        console.error('DALL-E image generation failed, falling back to high-res mockup.', err);
        generatedImageUrl = this.getMockImage(style, roomType);
      }
    } else {
      generatedImageUrl = this.getMockImage(style, roomType);
    }

    return {
      responseText,
      generatedImageUrl,
      promptSuggestions
    };
  }

  /**
   * Handle interactive design assistant chatbot logic
   */
  async getChatbotResponse(message: string, history: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are the DecorAI Luxury Design Assistant chatbot. Answer user queries about interior design, furniture selection, colors, styles, and budget optimizations. Keep your tone encouraging, premium, and professional.'
            },
            ...history,
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 300
        });
        return response.choices[0]?.message?.content || 'I apologize, I am experiencing temporary issues processing your message.';
      } catch (err) {
        console.error('Chatbot GPT generation failed.', err);
        return this.getMockChatResponse(message);
      }
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.getMockChatResponse(message));
        }, 800);
      });
    }
  }

  private getMockImage(style: string, roomType: string): string {
    const styleGroup = STYLE_ROOM_IMAGES[style];
    if (!styleGroup) return defaultImage;
    return styleGroup[roomType] || styleGroup['default'] || defaultImage;
  }

  private getMockTextSuggestions(req: AIAnalysisRequest) {
    const { roomType, style, budget, theme } = req;
    const themeStr = theme ? `, with an emphasis on "${theme}"` : '';
    
    let responseText = `### DecorAI Design Proposal: ${style} ${roomType}
Our AI agent analyzed your space and compiled a premium recommendation aligned with a budget tier of **${budget}**${themeStr}.

#### 1. Space Planning & Layout
- **Focal Point**: Arrange seating or beds to capture primary natural light. Introduce a custom accent wall in key visual zones.
- **Traffic Flow**: Maintain at least 3 feet of walking clearance between key items.

#### 2. Furniture & Textures
- **Materials**: Use authentic natural materials like brushed brass, textured linen, light oak, and matte black steel.
- **Accents**: Incorporate a custom wool-blend rug and geometric floating shelves for vertical interest.

#### 3. Color Palette: **${this.getPaletteForStyle(style)}**
- **Base (60%)**: Alabaster white or soft greige.
- **Secondary (30%)**: Muted bronze / oak wood grains.
- **Accent (10%)**: Deep forest green, clay terracotta, or metallic gold.

#### 4. Lighting Design
- **Task**: Install a gold-brushed structural chandelier.
- **Ambient**: Soft warm-white (2700K) LED backlighting behind custom frames or cabinets.`;

    const promptSuggestions = `Incorporate ${style === 'Luxury' ? 'velvet accents, crystal fixtures' : 'minimalist wood frame, clean linen layers'}, and lighting profiles matching the ${style} design system.`;

    return { responseText, promptSuggestions };
  }

  private getPaletteForStyle(style: string): string {
    switch (style) {
      case 'Scandinavian': return 'Muted Sand, Ash Oak, Sage Green';
      case 'Luxury': return 'Champagne Gold, Velvet Midnight Navy, Soft Alabaster';
      case 'Industrial': return 'Matte Black, Weathered Brick, Raw Steel';
      case 'Japanese': return 'Natural Cedar, Bamboo Green, Soft Charcoal';
      case 'Minimalist': return 'Pure White, Warm Gray, Matte Black';
      case 'Bohemian': return 'Clay Terracotta, Warm Ochre, Olive Green';
      case 'Contemporary': return 'Deep Graphite, Brushed Brass, Soft Ivory';
      default: return 'Sand Beige, Warm Oak, Slate Gray';
    }
  }

  private getMockChatResponse(message: string): string {
    const lower = message.toLowerCase().trim();

    // 1. GREETINGS (English, Roman Urdu, Arabic, Spanish, etc.)
    if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.startsWith('hello ') || lower.startsWith('hi ') || lower.startsWith('hey ') || lower.includes('assalam') || lower.includes('salaam') || lower.includes('namaste') || lower.includes('hola') || lower.includes('hallo')) {
      if (lower.includes('assalam') || lower.includes('salaam') || lower.includes('kamra') || lower.includes('he') || lower.includes('hai')) {
        return "Walaikum Assalam! Main Ayaan hoon, aapka DecorAI Design Assistant. Main rooms, styling, color schemes, aur furniture layouts design karne mein madad kar sakta hoon. Aaj kis space ko transform karna hai?";
      }
      if (lower.includes('hola')) {
        return "¡Hola! Soy Ayaan, tu asistente de diseño de DecorAI. ¿Cómo puedo ayudarte a transformar tu espacio hoy?";
      }
      return "Hello! I'm Ayaan, your DecorAI Design Consultant. How can I help you transform your space today? You can ask me to style a room, recommend color schemes, or advise on budget layouts!";
    }

    // 2. ROMAN URDU / HINDI DETECTOR & HANDLER (Including 60sqf / small room queries!)
    const isRomanUrduHindi = lower.includes('kamra') || lower.includes('room') || lower.includes('saza') || 
                             lower.includes('rang') || lower.includes('color') || lower.includes('paint') || 
                             lower.includes('light') || lower.includes('roshni') || lower.includes('budget') || 
                             lower.includes('design') || lower.includes('karo') || lower.includes('karna') || 
                             lower.includes('hai') || lower.includes('he') || lower.includes('chota') ||
                             lower.includes('sqft') || lower.includes('sqf') || lower.includes('mirror') ||
                             lower.includes('furniture');

    if (isRomanUrduHindi) {
      if (lower.includes('60') || lower.includes('chota') || lower.includes('space') || lower.includes('choti')) {
        return "60 sqft ya chote rooms ke liye minimalist design sabse best hota hai. Walls par white/light colors lagayein taake room khula lage. Storage ke liye floating shelves use karein, aur ek bada wall mirror lagayein jo space ko double feel karwaye. Kya aap isko bedroom banana chahte hain ya office?";
      }
      if (lower.includes('rang') || lower.includes('color') || lower.includes('palette') || lower.includes('paint')) {
        return "Color selection ke liye 60-30-10 rule use karein: 60% dominant neutral color (cream ya soft sand), 30% wood grain/fabrics, aur 10% bold accent (jaise velvet teal ya gold touches).";
      }
      if (lower.includes('light') || lower.includes('lighting') || lower.includes('roshni')) {
        return "Cozy look ke liye three layers important hain: ceiling main lights (ambient), table lamp (task), aur bed headboard ya cabinets ke piche warm white LED strips (accent). Isse room luxury lagta hai.";
      }
      if (lower.includes('furniture') || lower.includes('sofa') || lower.includes('bed')) {
        return "Chote rooms ke liye multi-functional furniture (jaise sofa-cum-bed ya hydraulic storage bed) choose karein. Natural wood textures look ko warm aur elegant banate hain.";
      }
      return "Main aapko designs, furniture layouts, colors, aur budget plans ke baray mein recommendations de sakta hoon. Mujhe batayein aap kis room par kaam kar rahe hain?";
    }

    // 3. SPECIFIC STYLES
    if (lower.includes('scandinavian') || lower.includes('nordic') || lower.includes('scandi')) {
      return "Scandinavian style combines functional simplicity, neutral colors (whites/grays), natural light oak wood, and cozy linen sheets. Sage green or slate accents work best here.";
    }
    if (lower.includes('luxury') || lower.includes('premium') || lower.includes('gold') || lower.includes('rich')) {
      return "Luxury design features rich textures: deep navy velvet sofas, brushed gold metal frame tables, marble accent walls, and warm indirect cove lighting.";
    }
    if (lower.includes('minimalist') || lower.includes('minimalism') || lower.includes('simple')) {
      return "Minimalism focuses on clean line layouts, hidden storage, and a monochrome palette (pure white, warm gray, matte black steel).";
    }
    if (lower.includes('industrial') || lower.includes('loft') || lower.includes('brick')) {
      return "Industrial style uses raw elements: exposed red brick, concrete, black steel fixtures, balanced by warm cognac leather seating and Edison bulb lamps.";
    }
    if (lower.includes('japanese') || lower.includes('zen') || lower.includes('japandi')) {
      return "Japandi (Japanese + Scandinavian) blends low-profile furniture, sliding bamboo screen panels, cedarwood, and clay tones for a serene, Zen atmosphere.";
    }

    // 4. OTHER LANGUAGES
    if (lower.includes('habitación') || lower.includes('dormitorio') || lower.includes('muebles') || lower.includes('color')) {
      return "Para el dormitorio, recomiendo tonos neutros suaves y luces LED cálidas (2700K) detrás del cabecero para crear un ambiente relajante. ¿Quieres más ideas de diseño?";
    }
    if (lower.includes('chambre') || lower.includes('meuble') || lower.includes('couleur') || lower.includes('salon')) {
      return "Pour une chambre confortable, privilégiez des tons neutres et un éclairage indirect chaud (2700K). Les textures naturelles comme le lin et le bois clair créent un effet spa.";
    }
    if (lower.includes('schlafzimmer') || lower.includes('farbe') || lower.includes('möbel') || lower.includes('zimmer')) {
      return "Für ein gemütliches Schlafzimmer empfehle ich Sandtöne, helles Holz und warmweißes Licht (2700K) hinter dem Bettkopfteil für eine entspannte Atmosphäre.";
    }
    if (lower.includes('غرفة') || lower.includes('تصميم') || lower.includes('ألوان') || lower.includes('أثاث')) {
      return "لتصميم غرفة نوم مريحة، نوصي باستخدام الألوان الترابية الفاتحة والإضاءة الدافئة خلف السرير مع لمسات خشبية طبيعية.";
    }

    // 5. GENERAL DESIGN CHAT & GENERAL CONVERSATION
    if (lower.includes('how are you') || lower === 'kaise ho' || lower === 'kese ho') {
      return "I'm doing absolutely fantastic, thank you! Ready to brainstorm some stunning interior concepts with you. What room are we styling?";
    }
    if (lower.includes('thank you') || lower.includes('thanks') || lower.includes('shukriya') || lower === 'ok' || lower === 'okay') {
      return "You're very welcome! Helping you style beautiful, functional spaces is my passion. What should we plan next?";
    }

    // 6. DEFAULT FALLBACK
    return `That's a very interesting design topic! As your DecorAI consultant, I recommend matching it with our **AI Design Generator** to view real layout suggestions. Could you share more details about your room size, current layout, or color preferences so I can give you specific tips?`;
  }
}

export const aiService = new AIService();
