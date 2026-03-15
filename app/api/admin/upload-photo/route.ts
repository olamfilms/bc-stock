import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
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
  // Auth check
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const notes = (formData.get('notes') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // ---- Step 1: Upload to Cloudinary ----
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary environment variables not configured' },
        { status: 500 }
      )
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const folder = 'bc-stock'

    // Signature: SHA1 of "folder=bc-stock&timestamp=<ts><secret>"
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex')

    // Build multipart body for Cloudinary
    const cloudinaryForm = new FormData()
    cloudinaryForm.append('file', file)
    cloudinaryForm.append('api_key', apiKey)
    cloudinaryForm.append('timestamp', String(timestamp))
    cloudinaryForm.append('signature', signature)
    cloudinaryForm.append('folder', folder)

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryForm,
      }
    )

    if (!cloudinaryRes.ok) {
      const errText = await cloudinaryRes.text()
      return NextResponse.json(
        { error: `Cloudinary upload failed: ${errText}` },
        { status: 500 }
      )
    }

    const cloudinaryData = await cloudinaryRes.json()
    const publicId: string = cloudinaryData.public_id
    const secureUrl: string = cloudinaryData.secure_url

    if (!publicId || !secureUrl) {
      return NextResponse.json(
        { error: 'Cloudinary response missing public_id or secure_url' },
        { status: 500 }
      )
    }

    // ---- Step 2: Claude vision analysis ----
    const notesLine = notes.trim()
      ? `Location/context from photographer: "${notes.trim()}". `
      : ''

    const prompt = `You are helping catalog BC (British Columbia, Canada) stock photography for licensing. Analyze this photo. ${notesLine}Generate catalog metadata. Available categories: ${AVAILABLE_CATEGORIES.join(', ')}. Respond with ONLY valid JSON: { "title": "...", "description": "two polished sentences for stock licensing", "suggestedCategories": ["Category1"], "tags": ["tag1","tag2","tag3","tag4","tag5"] }`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: secureUrl,
              },
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

    // Extract JSON — handle any surrounding text or code fences
    let parsed: {
      title?: string
      description?: string
      suggestedCategories?: string[]
      tags?: string[]
    }

    try {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response')
      }
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json(
        { error: `Failed to parse Claude response: ${content.text}` },
        { status: 500 }
      )
    }

    // Sanitize
    const title =
      typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : file.name.replace(/\.[^.]+$/, '')

    const description =
      typeof parsed.description === 'string' && parsed.description.trim()
        ? parsed.description.trim()
        : ''

    const suggestedCategories = Array.isArray(parsed.suggestedCategories)
      ? parsed.suggestedCategories.filter((c) =>
          AVAILABLE_CATEGORIES.includes(c)
        )
      : []

    const tags = Array.isArray(parsed.tags)
      ? parsed.tags.slice(0, 8).map((t) => String(t).toLowerCase())
      : []

    return NextResponse.json({
      publicId,
      cloudinaryUrl: secureUrl,
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
