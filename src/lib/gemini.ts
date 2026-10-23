import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Event, EventType } from '@/types';
import { formatCurrency } from './formatters';

export interface GeneratedTask {
  task: string;
  category: string;
  sort_order: number;
}

export interface GeneratedChecklistResult {
  items: GeneratedTask[];
  isMock: boolean;
  model: string;
}

/**
 * Sanitize text to avoid prompt injection and control character errors.
 */
function sanitizeText(str: string, maxLen = 300): string {
  if (!str) return '';
  return str
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\w\s.,!?'"()\-$/]/gi, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Return rich domain-specific fallback checklist recommendations
 * when GEMINI_API_KEY is not configured or network call fails.
 */
export function getMockChecklist(event: Event, focus?: string): GeneratedTask[] {
  const weddingTasks: Array<{ task: string; category: string }> = [
    { task: 'Book marriage ceremony and reception venue spaces', category: 'venue' },
    { task: 'Schedule wedding menu tasting with caterer and choose bar package', category: 'catering' },
    { task: 'Hire photographer and videographer with full timeline coverage', category: 'photography' },
    { task: 'Select florist for bridal bouquets, boutonnieres, and table centerpieces', category: 'decor' },
    { task: 'Order customized wedding cake and schedule delivery logistics', category: 'catering' },
    { task: 'Book DJ or live band and finalize "first dance" and "do-not-play" lists', category: 'music' },
    { task: 'Mail formal wedding invitations and launch RSVP tracking', category: 'guest-list' },
    { task: 'Apply for marriage license at city or county clerk office', category: 'logistics' },
    { task: 'Finalize day-of master itinerary and share with vendors', category: 'logistics' },
    { task: 'Design ceremony seating chart and print place cards', category: 'decor' },
    { task: 'Coordinate bridal party rehearsal dinner reservations', category: 'general' },
  ];

  const birthdayTasks: Array<{ task: string; category: string }> = [
    { task: 'Reserve party venue, park pavilion, or private dining room', category: 'venue' },
    { task: 'Order themed celebration cake or dessert display', category: 'catering' },
    { task: 'Send out digital or printed invitations and track RSVPs', category: 'guest-list' },
    { task: 'Book entertainer, DJ, or acoustic music performance', category: 'music' },
    { task: 'Purchase festive balloons, tableware, and photo backdrop', category: 'decor' },
    { task: 'Plan fun party games, activities, and guest prizes', category: 'general' },
    { task: 'Assemble party favor bags or souvenir gifts for guests', category: 'general' },
    { task: 'Coordinate finger foods, snack buffet, and beverage station', category: 'catering' },
    { task: 'Create celebration photo playlist and music queue', category: 'music' },
  ];

  const communityTasks: Array<{ task: string; category: string }> = [
    { task: 'Submit municipal park, sound, and street closure permit applications', category: 'permits' },
    { task: 'Rent event tents, stage, chairs, and waste management bins', category: 'logistics' },
    { task: 'Coordinate participating food trucks and health safety requirements', category: 'catering' },
    { task: 'Recruit volunteers and assign shift schedule duties', category: 'logistics' },
    { task: 'Install directional banners, welcome signage, and sponsor boards', category: 'decor' },
    { task: 'Set up wireless PA audio system and microphone test', category: 'music' },
    { task: 'Equip first-aid medical tent and review emergency plan', category: 'logistics' },
    { task: 'Promote event on local community social channels and flyers', category: 'guest-list' },
    { task: 'Organize post-event cleanup crew and equipment return', category: 'logistics' },
  ];

  const otherTasks: Array<{ task: string; category: string }> = [
    { task: 'Reserve and inspect event venue and facilities', category: 'venue' },
    { task: 'Finalize event program agenda and guest speaker introductions', category: 'general' },
    { task: 'Arrange catering service, coffee station, and dietary alternatives', category: 'catering' },
    { task: 'Send out calendar invitations and confirm attendee count', category: 'guest-list' },
    { task: 'Test audiovisual equipment, projector, and microphones', category: 'music' },
    { task: 'Prepare welcome badges and printed handouts', category: 'decor' },
    { task: 'Distribute event follow-up survey and thank-you notes', category: 'general' },
  ];

  const taskMap: Record<EventType, Array<{ task: string; category: string }>> = {
    wedding: weddingTasks,
    birthday: birthdayTasks,
    community: communityTasks,
    other: otherTasks,
  };

  const base = taskMap[event.event_type] || otherTasks;
  const items: GeneratedTask[] = [];

  // If special focus provided, add 1-2 focused tasks
  if (focus && focus.trim()) {
    items.push({
      task: `Implement focus: "${focus.trim()}" tailored for ${event.name}`,
      category: 'general',
      sort_order: 1,
    });
  }

  base.forEach((item, index) => {
    items.push({
      task: item.task,
      category: item.category,
      sort_order: items.length + 1,
    });
  });

  return items;
}

/**
 * Generate a personalized checklist using Gemini AI with fallback to mock data.
 */
export async function generatePersonalizedChecklist(
  event: Event,
  focus?: string
): Promise<GeneratedChecklistResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      items: getMockChecklist(event, focus),
      isMock: true,
      model: 'fallback-planner',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash or gemini-1.5-flash
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const budgetDollars = formatCurrency(event.total_budget);
    const sanitizedDescription = sanitizeText(event.description);
    const sanitizedFocus = focus ? sanitizeText(focus, 150) : '';

    const prompt = `
You are an expert event planner assistant.
Generate a structured, personalized planning checklist for the following event:
- Event Name: ${sanitizeText(event.name, 100)}
- Event Type: ${event.event_type} (e.g., wedding, birthday party, community event)
- Event Date: ${event.event_date}
- Guest Count: ${event.guest_count} attendees
- Total Budget: ${budgetDollars}
${sanitizedDescription ? `- Notes / Preferences: ${sanitizedDescription}` : ''}
${sanitizedFocus ? `- Special Planning Focus / Theme: ${sanitizedFocus}` : ''}

Instructions:
1. Provide between 8 to 14 actionable, highly relevant planning checklist tasks tailored to this specific event scale, budget, and celebration style.
2. Output MUST be a valid JSON array of objects with the exact schema:
[
  {
    "task": "Actionable task description",
    "category": "venue" | "catering" | "decor" | "music" | "guest-list" | "permits" | "logistics" | "general"
  }
]
3. Do not include markdown formatting or extra text outside the JSON array.
`;

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();

    // Clean JSON response (strip markdown fences if present)
    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI returned an invalid or empty checklist.');
    }

    const items: GeneratedTask[] = parsed.map((item, index) => ({
      task: String(item.task || 'Checklist task').slice(0, 250),
      category: String(item.category || 'general').slice(0, 50),
      sort_order: index + 1,
    }));

    return {
      items,
      isMock: false,
      model: 'gemini-2.0-flash',
    };
  } catch (error) {
    console.warn('Gemini checklist generation failed or API unreachable. Falling back to domain planner:', error);
    return {
      items: getMockChecklist(event, focus),
      isMock: true,
      model: 'fallback-planner',
    };
  }
}
