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

/**
 * Intelligent grounded fallback responses when GEMINI_API_KEY is not configured or offline.
 */
export function getGroundedMockChatResponse(
  event: Event,
  userMessage: string,
  eventContextSummary: string
): string {
  const query = userMessage.toLowerCase();

  if (query.includes('budget') || query.includes('cost') || query.includes('money') || query.includes('spend') || query.includes('price')) {
    return `### 💰 Budget Analysis for **${event.name}**

Here is your current financial status from your event records:
- **Total Allocated Budget:** ${formatCurrency(event.total_budget)}
- **Guest Scale:** ${event.guest_count} guests (approx. **${formatCurrency(event.guest_count > 0 ? Math.round(event.total_budget / event.guest_count) : 0)}** per guest)

**Actionable Budget Tips for ${event.event_type}:**
1. **Prioritize Anchor Items:** Venue and catering typically account for 45–55% of your total spend. Ensure contracts lock in service fees and taxes.
2. **Buffer for Incidentals:** Set aside a 5–10% contingency cushion for unexpected overtime, service gratuities, or rush deliveries.
3. **Tradeoff Analysis:** Check your Budget Tracker tab to compare planned amounts vs. actual quotes to spot categories with surplus budget.`;
  }

  if (query.includes('vendor') || query.includes('hire') || query.includes('booked') || query.includes('cater') || query.includes('photograph') || query.includes('dj') || query.includes('music')) {
    return `### 🤝 Vendor Strategy for **${event.name}**

Looking at your Vendor Directory records:
- **Celebration Type:** ${event.event_type.toUpperCase()}
- **Event Date:** ${event.event_date}

**Strategic Vendor Checklist:**
1. **Essential Priority:** Secure your primary venue and catering first, as they dictate guest capacity, layout rules, and curfew timing.
2. **Next Tier:** Photography/videography and music entertainment book up 6–12 months in advance for peak weekend dates.
3. **Contract Protection:** Always request itemized proposals, setup/breakdown hours, and backup plans in case of inclement weather or vendor illness.`;
  }

  if (query.includes('next') || query.includes('step') || query.includes('timeline') || query.includes('deadline') || query.includes('milestone') || query.includes('when')) {
    return `### 📅 Immediate Planning Steps for **${event.name}**

Target Date: **${event.event_date}** (${event.guest_count} guests)

**What to tackle next:**
1. **Review Pending Milestones:** Check the **Timeline & Milestones** tab to verify upcoming deadlines.
2. **Confirm Headcount Thresholds:** Send out RSVP reminders to lock in final table counts for catering.
3. **Checklist Review:** Visit your **✨ AI Checklist** tab to mark off completed items and generate targeted subtasks.`;
  }

  if (query.includes('idea') || query.includes('theme') || query.includes('decor') || query.includes('fun') || query.includes('recommend') || query.includes('unique')) {
    if (event.event_type === 'wedding') {
      return `### ✨ Personalized Ideas for **${event.name}**

Tailored for **${event.guest_count} guests** with a budget of **${formatCurrency(event.total_budget)}**:
1. **Interactive Guestbook Station:** Replace the traditional book with an audio guestbook phone or a polaroid photo memory board.
2. **Signature His & Hers Cocktails:** Name custom cocktails after meaningful shared memories or your favorite travel destinations.
3. **Late-Night Snack Surprise:** Treat dancing guests to gourmet sliders, artisan pretzel bites, or a mini taco bar during the last hour.
4. **Ambient Lighting Magic:** Fairy light curtains or warm uplighting transform any venue affordably.`;
    }

    if (event.event_type === 'birthday') {
      return `### 🎂 Creative Birthday Concepts for **${event.name}**

Tailored for a **${event.guest_count}-guest** party:
1. **Custom Interactive Trivia:** Host a 15-minute trivia quiz about the guest of honor with fun mini prizes.
2. **Themed Photo Backdrop:** Create an organic balloon garland with marquee LED numbers for Instagram moments.
3. **Signature Dessert Bar:** Complement the main cake with mini dessert shooters, a donut wall, or gourmet popcorn station.
4. **Curated Decades Playlist:** Feature songs from milestones across the celebrant's life.`;
    }

    return `### 🌟 Community Celebration Ideas for **${event.name}**

Tailored for **${event.guest_count} community participants**:
1. **Local Makers & Artisans Showcase:** Invite neighborhood crafters and independent vendors to host pop-up stalls.
2. **Interactive Community Mural:** Set up a large collaborative canvas where attendees paint handprints or community messages.
3. **Main Stage Local Talent:** Feature youth bands, cultural dance troupes, and local acoustic musicians throughout the afternoon.
4. **Family Activity Zone:** Lawn games (giant Jenga, cornhole), face painting, and a scavenger hunt.`;
  }

  return `### 🤖 Antigravity Planning Assistant

I am grounded in your live event profile for **${event.name}** (${event.event_type}, ${event.guest_count} attendees, scheduled for ${event.event_date}).

**How I can assist you today:**
- 💰 **Budget Guidance:** Ask *"How is my budget looking?"* or *"Where can I cut costs?"*
- 🤝 **Vendor Recommendations:** Ask *"What vendors should I prioritize booking?"*
- 📅 **Timeline Deadlines:** Ask *"What are my immediate next steps?"*
- ✨ **Creative Themes:** Ask *"Suggest personalized ideas for my guests"*

What would you like to explore first?`;
}

/**
 * Generate a conversational response from Gemini AI grounded in real event context.
 */
export async function generateChatResponse(
  event: Event,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  eventContextSummary: string
): Promise<{ response: string; isMock: boolean; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      response: getGroundedMockChatResponse(event, userMessage, eventContextSummary),
      isMock: true,
      model: 'grounded-event-assistant',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `You are Antigravity Event Planner, an expert, thoughtful, and highly competent GenAI planning assistant.
You help users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.
You are directly grounded in the user's real event data provided below. Use this actual data whenever answering questions about budget, timeline, vendors, or tasks.
If asked for ideas, provide creative, actionable, and personalized suggestions fitting the budget and guest count. Keep responses clear, helpful, and formatted in clean GitHub markdown.

${eventContextSummary}`,
    });

    const recentTurns = history.slice(-8).map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: recentTurns,
    });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    return {
      response: text.trim(),
      isMock: false,
      model: 'gemini-2.0-flash',
    };
  } catch (error) {
    console.warn('Gemini chat failed or network unreachable. Falling back to grounded assistant:', error);
    return {
      response: getGroundedMockChatResponse(event, userMessage, eventContextSummary),
      isMock: true,
      model: 'grounded-event-assistant',
    };
  }
}

export interface GeneratedEmailDraft {
  subject: string;
  body: string;
  isMock: boolean;
  model: string;
}

export interface DraftEmailOptions {
  emailType?: 'inquiry' | 'quote' | 'tasting_tour' | 'negotiation';
  tone?: 'professional' | 'warm' | 'direct';
  specificQuestions?: string;
}

/**
 * Generates structured fallback vendor email drafts when GEMINI_API_KEY is not configured or offline.
 */
export function getMockVendorEmail(
  event: Event,
  vendor: { name: string; category: string; contact_name?: string; price_quote?: number },
  options?: DraftEmailOptions
): { subject: string; body: string } {
  const type = options?.emailType || 'inquiry';
  const salutation = vendor.contact_name ? vendor.contact_name : `${vendor.name} Team`;
  const questions = options?.specificQuestions?.trim();

  if (type === 'quote') {
    return {
      subject: `RFQ / Price Quote Request: ${event.name} (${event.event_date})`,
      body: `Dear ${salutation},

We are currently budgeting and evaluating proposals for ${vendor.category} services for "${event.name}" scheduled for ${event.event_date}.

Event Overview:
- Celebration Type: ${event.event_type}
- Event Date: ${event.event_date}
- Expected Guest Count: ${event.guest_count} attendees

Could you please provide an itemized quote or proposal outlining:
1. Base package inclusions and hours of service
2. Setup, teardown, and staffing charges
3. Payment terms and deposit requirements
${questions ? `4. Specific inquiry: ${questions}\n` : ''}
We appreciate your time and look forward to receiving your proposal.

Warm regards,
[Your Name]
[Your Phone Number]`,
    };
  }

  if (type === 'tasting_tour') {
    const isFood = vendor.category === 'catering' || vendor.category === 'bakery';
    return {
      subject: `Consultation & ${isFood ? 'Tasting' : 'Walkthrough'} Request: ${event.name}`,
      body: `Dear ${salutation},

We are very impressed by ${vendor.name} and would love to explore working together for "${event.name}" on ${event.event_date}.

Before making our final booking commitment, we would love to schedule a consultation ${isFood ? 'and menu tasting session' : 'and venue walkthrough'} with you to discuss our vision for our ${event.guest_count} guests.

Could you let us know your availability over the next two weeks?

${questions ? `Additional Notes: ${questions}\n\n` : ''}Thank you so much,
[Your Name]
[Your Contact Information]`,
    };
  }

  if (type === 'negotiation') {
    const quoteStr = vendor.price_quote && vendor.price_quote > 0 ? formatCurrency(vendor.price_quote) : 'your initial estimate';
    return {
      subject: `Proposal Discussion & Budget Alignment: ${event.name}`,
      body: `Dear ${salutation},

Thank you very much for providing your proposal and estimate of ${quoteStr} for our upcoming ${event.event_type}. We love your style and would be thrilled to have ${vendor.name} be part of our celebration.

We are managing our budget carefully for our ${event.guest_count} guests. We were hoping to explore whether there might be any flexibility in your package options or if we could adjust certain deliverables to align more closely with our allocated budget?

${questions ? `Specifically: ${questions}\n\n` : ''}We greatly respect your craft and look forward to seeing if we can find a mutually beneficial arrangement.

Sincerely,
[Your Name]
[Your Contact Information]`,
    };
  }

  // Default: Initial Inquiry
  return {
    subject: `Inquiry: Availability for ${event.name} on ${event.event_date}`,
    body: `Hello ${salutation},

I hope this email finds you well. I am reaching out regarding our upcoming ${event.event_type}, "${event.name}", taking place on ${event.event_date}.

We are expecting approximately ${event.guest_count} guests and admire the work that ${vendor.name} delivers in ${vendor.category}.

Could you please let us know if you currently have availability on this date, and share your standard package brochures and pricing guides?

${questions ? `We also have a few specific questions:\n- ${questions}\n\n` : ''}Thank you very much, and we look forward to hearing from you!

Best regards,
[Your Name]
[Your Phone Number]`,
  };
}

/**
 * Generate a customized vendor email draft using Gemini AI with fallback.
 */
export async function generateVendorEmail(
  event: Event,
  vendor: { name: string; category: string; contact_name?: string; contact_email?: string; price_quote?: number },
  options?: DraftEmailOptions
): Promise<GeneratedEmailDraft> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const mock = getMockVendorEmail(event, vendor, options);
    return {
      ...mock,
      isMock: true,
      model: 'fallback-email-drafter',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const emailType = options?.emailType || 'inquiry';
    const tone = options?.tone || 'professional';
    const questions = options?.specificQuestions ? sanitizeText(options.specificQuestions, 300) : '';

    const prompt = `
You are an expert event planner assistant drafting an email to a vendor.
Draft a professional, clear, and compelling email based on:
- Event: "${sanitizeText(event.name, 100)}" (${event.event_type})
- Event Date: ${event.event_date}
- Guest Count: ${event.guest_count} attendees
- Vendor: "${sanitizeText(vendor.name, 100)}" (${vendor.category})
${vendor.contact_name ? `- Contact Person: "${sanitizeText(vendor.contact_name, 100)}"` : ''}
${vendor.price_quote && vendor.price_quote > 0 ? `- Current Quote / Budget: ${formatCurrency(vendor.price_quote)}` : ''}
- Email Goal / Type: ${emailType} (inquiry = availability check; quote = detailed RFQ; tasting_tour = site visit/tasting request; negotiation = polite budget adjustment)
- Tone: ${tone}
${questions ? `- Specific Questions or Requirements to include: "${questions}"` : ''}

Instructions:
Output MUST be a valid JSON object with exact keys:
{
  "subject": "Clear, professional email subject line",
  "body": "Full formatted email body with salutation, context, questions, and polite sign-off"
}
Do not include markdown fences outside the JSON object.
`;

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();

    const cleanedText = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (!parsed.subject || !parsed.body) {
      throw new Error('AI returned an invalid email structure.');
    }

    return {
      subject: String(parsed.subject).trim(),
      body: String(parsed.body).trim(),
      isMock: false,
      model: 'gemini-2.0-flash',
    };
  } catch (error) {
    console.warn('Gemini vendor email drafting failed. Falling back to structured templates:', error);
    const mock = getMockVendorEmail(event, vendor, options);
    return {
      ...mock,
      isMock: true,
      model: 'fallback-email-drafter',
    };
  }
}
