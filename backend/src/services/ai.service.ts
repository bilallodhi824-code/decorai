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
        // Run DALL-E 3 image generation
        const response = await this.openai.images.generate({
          model: 'dall-e-3',
          prompt: `A high-end, luxury professional photograph of a ${roomType} redesigned in a premium ${style} style. Highly detailed, photorealistic, architectural digest quality, rich lighting, budget tier: ${budget}.`,
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

    // 1. KOREAN LANGUAGE DETECTOR & HANDLER
    if (/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(message)) {
      if (lower.includes('방') || lower.includes('침실')) {
        return "침실 디자인의 경우, 아늑하고 평온한 분위기를 조성하는 것이 중요합니다. 패브릭 헤드보드와 내추럴 우드 톤 가구, 그리고 침대 헤드 뒤쪽에 2700K 웜 화이트 간접 조명을 설치해 보세요. 미니멀이나 내추럴 스타일을 추천합니다.";
      }
      if (lower.includes('거실')) {
        return "거실은 집의 중심 공간입니다. 메인 소파가 거실의 메인 뷰(창문 또는 TV)를 향하도록 배치하고, 발이 편안한 플러시 울 러그로 공간을 아늑하게 묶어주는 것이 중요합니다.";
      }
      if (lower.includes('색') || lower.includes('컬러') || lower.includes('페인트')) {
        return "색상 매칭에는 60-30-10 법칙이 가장 효과적입니다. 60%는 메인 뉴트럴 톤(웜 아이보리 또는 그레이지), 30%는 원목이나 가죽 등의 세컨더리 톤, 10%는 딥 그린이나 오렌지 같은 세련된 포인트 톤을 추천합니다.";
      }
      return "안녕하세요! 저는 DecorAI의 가상 인테리어 디자인 어시스턴트 아얀(Ayaan)입니다. 가구 매칭, 색상 조합, 또는 특정 공간의 공간 기획에 대해 질문해 주세요. 최고의 디자인을 제안해 드리겠습니다!";
    }

    // 2. URDU / HINDI SCRIPT DETECTOR & HANDLER
    if (/[\u0600-\u06FF]/.test(message)) { // Urdu script
      if (lower.includes('کمرہ') || lower.includes('بیڈ روم')) {
        return "بیڈ روم کو خوبصورت اور پرسکون بنانے کے لیے، ہلکے رنگ جیسے آف وائٹ یا بیج کا استعمال کریں۔ بیڈ کے پیچھے وارم ایل ای ڈی لائٹس لگائیں اور ملٹی فنکشنل فرنیچر استعمال کریں۔ کیا آپ رنگوں کے امتزاج کے بارے میں جاننا چاہتے ہیں؟";
      }
      if (lower.includes('رنگ') || lower.includes('ڈیزائن')) {
        return "ڈیزائننگ کے لیے 60-30-10 کا اصول بہترین ہے۔ 60٪ دیواروں کے لیے ہلکا رنگ، 30٪ لکڑی یا فرنیچر کا رنگ، اور 10٪ گہرے رنگ کے کشن یا ڈیکوریشن کے لیے استعمال کریں۔";
      }
      return "السلام علیکم! میں ہوں ایان، آپ کا ڈیزائن کنسلٹنٹ۔ میں آپ کے کمرے، رنگوں کی اسکیم، اور فرنیچر کی ترتیب کو ڈیزائن کرنے میں مدد کر سکتا ہوں۔ آپ اپنے پروجیکٹ کے بارے میں کچھ بھی پوچھ سکتے ہیں!";
    }

    if (/[\u0900-\u097F]/.test(message)) { // Hindi script
      if (lower.includes('कमरा') || lower.includes('बेडरूम')) {
        return "बेडरूम को आरामदायक बनाने के लिए ऑफ-व्हाइट या हल्के रंगों का उपयोग करें। बेड के पीछे वार्म एलईडी लाइट लगाना बहुत अच्छा रहेगा। क्या आप कलर पैलेट या लेआउट के बारे में जानना चाहते हैं?";
      }
      if (lower.includes('रंग') || lower.includes('डिज़ाइन')) {
        return "इंटीरियर डिजाइनिंग के लिए 60-30-10 नियम सबसे अच्छा है। 60% हिस्सा मुख्य न्यूट्रल रंग (जैसे क्रीम या ग्रेज) का, 30% सेकेंडरी रंग (जैसे लकड़ी के टोन) का और 10% बोल्ड रंग का होना चाहिए।";
      }
      return "नमस्ते! मैं अयान हूँ, आपका इंटीरियर डिज़ाइन सहायक। मैं आपके घर या कमरे के लेआउट, रंगों की योजना और फर्नीचर चयन में मदद कर सकता हूँ। आप मुझसे कोई भी सवाल पूछ सकते हैं!";
    }

    // 3. SPANISH LANGUAGE DETECTOR & HANDLER
    if (lower.includes('hola') || lower.includes('diseño') || lower.includes('habitacion') || lower.includes('habitación') || lower.includes('dormitorio') || lower.includes('muebles') || lower.includes('color')) {
      if (lower.includes('habitacion') || lower.includes('habitación') || lower.includes('dormitorio') || lower.includes('dormir')) {
        return "Para un dormitorio acogedor y relajante, recomiendo usar tonos suaves como el beige o blanco roto. Añadir tiras de luces LED cálidas detrás del cabecero crea una atmósfera spa increíble. ¿Prefieres un estilo Minimalista o de Lujo?";
      }
      if (lower.includes('color') || lower.includes('paleta') || lower.includes('pintura')) {
        return "¡La paleta de colores ideal sigue la regla 60-30-10! 60% color dominante neutro (arena, blanco hueso), 30% madera/texturas, y 10% un color de acento vibrante como el verde bosque o azul marino. ¿Qué habitación estás diseñando?";
      }
      return "¡Hola! Soy Ayaan, tu consultor de diseño de DecorAI. Puedo ayudarte con la distribución de muebles, paletas de colores y estilos de diseño (Escandinavo, Moderno o Minimalista). ¿Qué espacio transformamos hoy?";
    }

    // 4. GERMAN LANGUAGE DETECTOR & HANDLER
    if (lower.includes('hallo') || lower.includes('zimmer') || lower.includes('farbe') || lower.includes('möbel') || lower.includes('wohnen') || lower.includes('schlafzimmer')) {
      if (lower.includes('schlafzimmer') || lower.includes('bett') || lower.includes('zimmer')) {
        return "Für ein gemütliches Schlafzimmer empfehle ich weiche Sandtöne und warmweißes Licht (2700K) hinter dem Bettkopfteil. Helle Leinenstoffe und dezente Holzmöbel lassen den Raum ruhig und einladend wirken.";
      }
      if (lower.includes('farbe') || lower.includes('palette') || lower.includes('wand')) {
        return "Wählen Sie Farben nach der 60-30-10-Regel: 60% dominanter Neutralton (z.B. Greige oder warmes Weiß), 30% Sekundärfarbe (Holz/Strukturen) und 10% ein Akzent (z.B. Salbeigrün oder Samtblau).";
      }
      return "Hallo! Ich bin Ayaan, Ihr DecorAI-Designberater. Ich helfe Ihnen gerne bei Raumaufteilung, Farbauswahl und Möbelstilen (wie skandinavisch, minimalistisch oder modern). Welchen Raum gestalten wir heute?";
    }

    // 5. ROMAN URDU / HINDI DETECTOR & HANDLER (Including 60sqf queries!)
    const isRomanUrduHindi = lower.includes('kamra') || lower.includes('design') || lower.includes('rang') || 
                             lower.includes('saza') || lower.includes('decor') || lower.includes('banwa') || 
                             lower.includes('chota') || lower.includes('bada') || lower.includes('ghar') || 
                             lower.includes('roshni') || lower.includes('kaise') || lower.includes('karo') || 
                             lower.includes('karne') || lower.includes('he') || lower.includes('hai') || 
                             lower.includes('ko') || lower.includes('se') || lower.includes('ka') ||
                             lower.includes('sqf') || lower.includes('sqft') || lower.includes('square');

    if (isRomanUrduHindi) {
      // Small room query (e.g. 60 sqft room)
      if (lower.includes('60') || lower.includes('chota') || lower.includes('space') || lower.includes('choti')) {
        return "60 sqft (ya chota) kamra design karne ke liye spatial planning aur minimalist layout sabse zaroori hai. Meri recommendations:\n\n" +
               "1. **Light Colors**: Walls aur flooring ke liye white, light beige ya soft gray use karein taake roshni reflect ho aur kamra bada lage.\n" +
               "2. **Multifunctional Furniture**: Sofa-cum-bed ya fold-down wall desk lagayein taake extra space bach sake.\n" +
               "3. **Vertical Storage**: Floating shelves aur wall cabinets use karein, floor area ko clean rakhein.\n" +
               "4. **Mirror Magic**: Ek bada mirror lagane se space double feel hoti hai.\n\n" +
               "Kya aap is kamre ko bedroom banana chahte hain ya study/office?";
      }
      if (lower.includes('kamra') || lower.includes('bedroom') || lower.includes('room')) {
        return "Bedroom ko sazanay ke liye, bed ki back panel par warm white LED strip lights (2700K) lagayein jo bohat premium look deti hain. Light curtains aur light wood texture use karein. Kya aapko color palette ki suggestions chahiye?";
      }
      if (lower.includes('rang') || lower.includes('color') || lower.includes('palette') || lower.includes('paint')) {
        return "Colors select karne ke liye 60-30-10 rule follow karein. 60% dominant neutral color (cream ya soft sand), 30% secondary texture (oak wood ya fabric), aur 10% bold accent (forest green ya gold touch).";
      }
      if (lower.includes('light') || lower.includes('lighting') || lower.includes('roshni')) {
        return "Lighting bohat important hai. Kamre mein teen tarah ki lights honi chahiye: ambient ceiling lights, task desk lamp, aur warm accent strips. Isse room bada aur premium lagta hai.";
      }
      return "Hello! Main Ayaan hoon, aapka DecorAI Design Assistant. Main furniture layouts, colors, styles (Scandinavian, Luxury, Minimalist), aur small spaces ke budget layouts design karne mein aapki madad kar sakta hoon. Aaj kis space ko transform karna hai?";
    }

    // 6. DEFAULT ENGLISH HANDLER
    // Parse Name / Introductions
    const nameMatch = lower.match(/(?:my name is|myself|i am|i'm|me)\s+([a-zA-Z\s]{2,20})/i) || 
                      (lower.startsWith('my self ') ? [null, lower.replace('my self ', '')] : null);
    if (nameMatch && nameMatch[1]) {
      const name = nameMatch[1].trim().replace(/^\w/, (c) => c.toUpperCase());
      return `Hello ${name}! It is wonderful to meet you. I am Ayaan, your personal DecorAI Design Consultant. How can I help you transform your space today? You can ask me about styling your living room, picking color palettes, or furniture ideas!`;
    }

    // Standard English check-ins
    if (lower === 'kaise ho' || lower === 'ap kaise ho' || lower === 'how are you') {
      return "I'm doing fantastic, thank you for asking! I'm ready to brainstorm some premium interior design concepts with you. What space are we designing today?";
    }
    if (lower.includes('shukriya') || lower.includes('dhanyawad') || lower === 'thanks' || lower === 'thank you') {
      return "You're very welcome! Styling beautiful spaces is my passion. Let me know if you need help with color selections, room layouts, or furniture sourcing!";
    }
    if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.startsWith('hello ') || lower.startsWith('hi ') || lower.startsWith('hey ') || lower.includes('assalam') || lower.includes('salaam') || lower.includes('namaste')) {
      return "Hello! I'm Ayaan, your DecorAI Design Consultant. How can I help you transform your space today? You can ask me to style a room (e.g., 'style a modern bedroom'), recommend color palettes, or advise on budget layouts!";
    }

    // Specific Style Queries
    if (lower.includes('scandinavian') || lower.includes('nordic')) {
      return "Scandinavian style focuses on functional simplicity, clean lines, and natural elements. I suggest using light ash oak wood, warm white textured linen sheets, and cozy knit throws. Keep the color base neutral (whites, soft sand) with subtle sage green or slate gray accents. Would you like a moodboard suggestion for a Scandinavian bedroom or living room?";
    }
    if (lower.includes('luxury') || lower.includes('premium') || lower.includes('gold')) {
      return "Luxury interior design is all about rich textures, symmetric layouts, and premium metallic accents. I recommend pairing deep navy velvet sofas with brushed gold frame coffee tables, backed by a white marble accent wall and warm cove lighting. What luxury room style can I help you create?";
    }
    if (lower.includes('minimalist') || lower.includes('minimalism')) {
      return "Minimalism is about 'less is more'—decluttered spaces, hidden storage, and high-quality statement pieces. Stick to a monochrome palette (pure white, warm gray, matte black accents) and natural light. It works perfectly in bedrooms and home offices. What minimalist space are you planning?";
    }
    if (lower.includes('industrial')) {
      return "Industrial design embraces raw materials: exposed red brick walls, concrete flooring, and matte black steel fixtures. Balance the coldness of steel with warm leather seating (like a cognac Chesterfield sofa) and Edison bulb light fixtures. What industrial space are we styling?";
    }
    if (lower.includes('japanese') || lower.includes('zen') || lower.includes('japandi')) {
      return "Japandi (Japanese + Scandinavian) is highly trendy! It uses low-profile furniture, natural sliding bamboo screens, cedarwood paneling, and stone elements. Use soft olive, charcoal, and warm clay tones. What room are we transforming into a Zen sanctuary?";
    }
    if (lower.includes('bohemian') || lower.includes('boho')) {
      return "Bohemian spaces are vibrant, artistic, and relaxed! Mix woven rattan chairs, textured macramé wall hangings, terracotta pots with leafy plants (like Monstera), and rich ochre or burnt orange cushions. Do you want Boho ideas for a living room, balcony, or bedroom?";
    }

    // Specific Room Queries
    if (lower.includes('bedroom')) {
      return "For a cozy, peaceful bedroom, layering is key: a tufted headboard, soft linen duvet, and ambient warm LED strip lighting (2700K) behind the bed panel. Keep clutter to a minimum. Do you prefer a Scandinavian, Luxury, or Minimalist aesthetic for your bedroom?";
    }
    if (lower.includes('living room') || lower.includes('lounge')) {
      return "The living room is the social hub. Place your primary sofa facing the main focal point (fireplace, media console, or large window view). Add a plush wool-blend rug that anchors the furniture legs. Would you like color palette recommendations for it?";
    }
    if (lower.includes('kitchen') || lower.includes('cooking')) {
      return "Kitchen transformations are very popular! For a modern, functional kitchen, I recommend matte black cabinets paired with light quartz countertops. Under-cabinet LED strip lights (3000K warm white) add spectacular depth. Would you prefer a Minimalist, Industrial, or Luxury style for your kitchen?";
    }
    if (lower.includes('bathroom') || lower.includes('bath')) {
      return "To make a bathroom feel like a luxury spa, use large format porcelain tiles, a floating vanity with undermount sinks, and gold or matte black plumbing fixtures. Backlit round mirrors make a huge visual difference! Would you like details on spa-style bathrooms?";
    }
    if (lower.includes('office') || lower.includes('study')) {
      return "A productive home office needs excellent task lighting (a sleek desk lamp), an ergonomic chair, and floating wooden shelves to keep paper off your workspace. Neutral colors like soft sage or warm taupe keep the atmosphere calm and focused.";
    }

    // Color and Decor elements
    if (lower.includes('color') || lower.includes('palette') || lower.includes('paint') || lower.includes('theme')) {
      return "Selecting a color palette is all about the 60-30-10 rule. 60% is your dominant neutral color (like greige or warm ivory), 30% is your secondary texture/wood grain, and 10% is your bold accent (like velvet teal, forest green, or burnt orange). Let me know the room, and I'll recommend the exact hex colors!";
    }
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('lighting')) {
      return "Lighting defines the mood! Use three layers: Task lighting (reading lamps), Ambient lighting (recessed ceiling lights), and Accent lighting (cove LED strips, picture lights). Warm white temperatures (2700K - 3000K) are best for cozy living areas.";
    }
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('price')) {
      return "DecorAI offers excellent options for every budget tier. Under $2,000, we recommend focusing on styling items: fresh paint, statement rugs, potted plants, and modern lighting. Over $5,000, you can start investing in structural improvements, custom millwork, and premium furniture sets.";
    }

    // General fallback response
    return "That sounds like a wonderful design challenge! I recommend using our **AI Design Generator** to upload a photo of that space, and select your preferred style. It will instantly render a complete before/after visual and give you specific furniture guidelines. Let me know if you have any other questions!";
  }
}

export const aiService = new AIService();
