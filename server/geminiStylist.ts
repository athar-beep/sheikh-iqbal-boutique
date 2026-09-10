import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { db } from './db';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

export interface StylingConsultationRequest {
  occasion: string; // e.g., 'Mehndi Night', 'Barat Wedding', 'Eid-ul-Fitr', 'Corporate Soirée', 'Walima Reception'
  budgetPkr?: number;
  preferredFabric?: string; // Lawn, Raw Silk, Organza, Velvet, Chiffon, Cotton Karandi
  gender?: 'Women' | 'Men' | 'Both';
  cityOrClimate?: string; // Karachi humid, Lahore winter, Islamabad spring, Quetta, Overseas
  userQuery: string;
}

export async function generateStylingConsultation(req: StylingConsultationRequest): Promise<{
  recommendation: string;
  suggestedProductIds: string[];
  stylingTips: string[];
}> {
  const products = db.getProducts({ status: 'active' });
  const catalogSummary = products.map(p => ({
    id: p.id,
    title: p.title,
    category: p.categoryName,
    fabric: p.fabric,
    pricePkr: p.salePrice || p.price,
    embroidery: p.embroideryWork,
    pieceCount: p.pieceCount
  }));

  const systemInstruction = `You are the premier Chief Fashion Director and Haute Couture Consultant at Sheikh Iqbal Cloth & Boutique Centre in Pakistan.
You possess encyclopedic mastery of Pakistani high fashion, traditional embroidery craftsmanship (Zardozi, Tilla, Marori, Gota Patti, Resham, Schiffli cutwork, Mukesh, Aari, Vasli), heritage royal cuts (Kalidaar Peshwas, Farshi Gharara, Angrakha, Jamawar Waistcoat, Classic Kurta Pajama), seasonal fabric pairing for Pakistani climates (Karachi humidity vs Lahore/Islamabad winters), wedding function dress codes (Mayun, Mehndi, Sangeet, Barat, Walima, Qawwali Night), and jewelry/dupatta styling.

Available Boutique Catalog:
${JSON.stringify(catalogSummary, null, 2)}

Your tone is regal, culturally authentic, discerning, and deeply hospitable (incorporate refined Urdu sartorial terms gracefully, like "Nafasat", "Rewayat", "Zari", "Drape", "Khaas").

Always structure your advice:
1. Sartorial Vision & Silhouette Advice (Tailored to their specific event and climate).
2. Curated Product Recommendations from the Boutique Catalog (Reference exact product titles and IDs).
3. Dupatta, Jewelry & Khussa/Footwear Pairing tips.
4. Sizing & Stitching Guidance (Standard ready-to-wear vs bespoke custom measurements).`;

  const userPrompt = `Client Consultation Request:
- Occasion: ${req.occasion || 'Festive Celebration'}
- Budget: ${req.budgetPkr ? `Up to Rs. ${req.budgetPkr.toLocaleString()} PKR` : 'Flexible Luxury'}
- Preferred Fabric / Aesthetic: ${req.preferredFabric || 'Open to recommendations'}
- Gender / Wardrobe: ${req.gender || 'Women'}
- City / Climate Context: ${req.cityOrClimate || 'Pakistan'}
- Specific Query: "${req.userQuery}"

Provide an exhaustive, high-fashion consultation with deep reasoning.`;

  const client = getAiClient();

  if (!client) {
    // Fallback recommendation if GEMINI_API_KEY is not configured yet
    const matching = products.slice(0, 3);
    return {
      recommendation: `Welcome to Sheikh Iqbal Cloth & Boutique Centre. For a ${req.occasion || 'festive occasion'} in ${req.cityOrClimate || 'Pakistan'}, we highly recommend our handcrafted royal silhouettes. Our 80g pure raw silk peshwas and crinkle chiffon angrakhas offer the perfect balance of regal presence and effortless movement. Pair with antique gold jhumkas and traditional embellished khussas for an iconic festive look.`,
      suggestedProductIds: matching.map(m => m.id),
      stylingTips: [
        'For evening functions, deep jewel tones like Ruby Crimson, Emerald Bottle Green, or Ivory Gold catch candlelight magnificently.',
        'Pair pure raw silk with a contrasting organza dupatta draped over one shoulder with scalloped edges pinned delicately.',
        'For Karachi weather, lightweight pure French chiffon or Pima lawn provides breathable elegance without sacrificing grandeur.'
      ]
    };
  }

  try {
    // Calling gemini-3.1-pro-preview with ThinkingLevel.HIGH as mandated by system directive!
    const response = await client.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    const text = response.text || '';

    // Match suggested product IDs from catalog
    const foundIds: string[] = [];
    products.forEach(p => {
      if (text.toLowerCase().includes(p.title.toLowerCase()) || text.includes(p.id)) {
        foundIds.push(p.id);
      }
    });

    if (foundIds.length === 0) {
      foundIds.push(...products.slice(0, 3).map(p => p.id));
    }

    return {
      recommendation: text,
      suggestedProductIds: Array.from(new Set(foundIds)),
      stylingTips: [
        'Coordinate your footwear with traditional Tilla or velvet embroidered khussas.',
        'Choose pure raw silk or micro-velvet for air-conditioned marquees and winter soirées.',
        'Opt for our complimentary custom tailoring service if your measurements fall between standard sizes.'
      ]
    };
  } catch (err: any) {
    console.error('Gemini Stylist generation error:', err);
    return {
      recommendation: `At Sheikh Iqbal Cloth & Boutique Centre, for ${req.occasion}, we recommend our signature handcrafted ensembles. Explore our Gul-e-Noor Zardozi Raw Silk Peshwas or Surmayi Chiffon Angrakha paired with traditional polki jewelry and hand-finished organza dupattas.`,
      suggestedProductIds: products.slice(0, 2).map(p => p.id),
      stylingTips: [
        'Pin the dupatta pallu securely with antique brooches for fluid movement.',
        'Select our bespoke custom-stitched option for custom sleeve and shirt length requirements.'
      ]
    };
  }
}
