import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth'

const anthropic = new Anthropic({
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

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { cloudinaryUrl, publicId, notes, filename } = body

    if (!cloudinaryUrl || !publicId) {
      return NextResponse.json(
        { error: 'cloudinaryUrl and publicId are required' },
        { status: 400 }
      )
    }

    const notesLine = (notes || '').trim()
      ? `Location/context from photographer: "${notes.trim()}". `
      : ''

    const prompt = `You are helping catalog BC (British Columbia, Canada) stock photography for licensing. Analyze this photo. ${notesLine}Generate catalog metadata. Available categories: ${AVAILABLE_CATEGORIES.join(', ')}. Respond with ONLY valid JSON: { "title": "short plain 3-5 word title, no marketing language (e.g. 'Bald Eagle in Flight', 'Coastal Fog at Dusk')", "description": "one concise factual sentence describing what is in the photo, no flowery or AI-sounding language", "suggestedCategories": ["Category1"], "tags": ["tag1","tag2","tag3","tag4","tag5"] }`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'url', url: cloudinaryUrl },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response type from Claude' },
        { status: 500 }
      )
    }

    let parsed: {
      title?: string
      description?: string
      suggestedCategories?: string[]
      tags?: string[]
    }

    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in Claude response')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json(
        { error: `Failed to parse Claude response: ${content.text}` },
        { status: 500 }
      )
    }

    const baseName = (filename as string | undefined)?.replace(/\.[^.]+$/, '') ?? publicId
    const title =
      typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : baseName

    const description =
      typeof parsed.description === 'string' && parsed.description.trim()
        ? parsed.description.trim()
        : ''

    const suggestedCategories = Array.isArray(parsed.suggestedCategories)
      ? parsed.suggestedCategories.filter((c) => AVAILABLE_CATEGORIES.includes(c))
      : []

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.slice(0, 8).map((t) => String(t).toLowerCase())
      : []

    return NextResponse.json({
      publicId,
      cloudinaryUrl,
      title,
      description,
      suggestedCategories,
      tags,
    })
  } catch (err) {
    console.error('upload-photo error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
