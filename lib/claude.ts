import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const AVAILABLE_CATEGORIES = [
  'Featured',
  'Wildlife',
  'Indigenous',
  'Aerial',
  'Coastal',
  'Interior',
  'Industry',
  'Salmon',
  'Urban',
  'Rivers & Streams',
  'Mountains',
]

export interface EnrichmentResult {
  description: string
  suggestedCategories: string[]
  tags: string[]
}

export async function enrichMediaItem(
  title: string,
  description: string,
  categories: string[],
  shotOn: string,
  type: 'video' | 'photo'
): Promise<EnrichmentResult> {
  const mediaType = type === 'video' ? 'stock footage clip' : 'stock photo'
  const existingDescription = description?.trim() || ''
  const existingCategories = categories.filter(Boolean).join(', ')

  const prompt = `You are a professional stock media cataloger specializing in British Columbia, Canada content.

You are enriching a ${mediaType} for a stock licensing library.

Title: ${title}
Shot on / Location: ${shotOn || 'British Columbia, Canada'}
Existing categories: ${existingCategories || 'none'}
Existing description: ${existingDescription || 'none provided'}

Available categories to choose from (pick 1–3 that best fit):
${AVAILABLE_CATEGORIES.join(', ')}

Please return a JSON object with exactly these fields:
{
  "description": "One concise factual sentence describing what is shown in the clip. No marketing language, no flowery adjectives, no AI-sounding phrases.",
  "suggestedCategories": ["Category1", "Category2"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Requirements:
- description: One sentence. Factual and plain. Describe what is literally visible, no mood or marketing language.
- suggestedCategories: 1–3 categories chosen ONLY from the available list above. Must be exact matches.
- tags: 5–8 lowercase keyword tags relevant to the content (e.g. "british columbia", "wildlife", "4k", "nature", "aerial")

Return ONLY the JSON object. No markdown, no explanation, no code blocks.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  let result: EnrichmentResult
  try {
    // Strip any accidental markdown code fences
    const cleaned = content.text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    result = JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${content.text}`)
  }

  // Validate and sanitize
  if (!result.description || typeof result.description !== 'string') {
    result.description = existingDescription || title
  }
  if (!Array.isArray(result.suggestedCategories)) {
    result.suggestedCategories = categories.length > 0 ? categories : []
  }
  // Filter to only valid categories
  result.suggestedCategories = result.suggestedCategories.filter((c) =>
    AVAILABLE_CATEGORIES.includes(c)
  )
  if (!Array.isArray(result.tags)) {
    result.tags = []
  }
  result.tags = result.tags.slice(0, 8).map((t) => String(t).toLowerCase())

  return result
}
