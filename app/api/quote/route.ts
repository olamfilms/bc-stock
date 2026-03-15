import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { sendQuoteEmail } from '@/lib/resend'
import type { QuoteFormData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const data: QuoteFormData = await request.json()

    // Basic validation
    if (!data.email || !data.description) {
      return NextResponse.json(
        { error: 'Email and description are required' },
        { status: 400 }
      )
    }

    // Insert into quote_requests table
    const { error: dbError } = await supabaseServer
      .from('quote_requests')
      .insert({
        email: data.email,
        organization: data.organization || null,
        format: data.format || null,
        usage: data.usage || [],
        runtime: data.runtime || null,
        description: data.description,
        media_ids: data.mediaIds || [],
      })

    if (dbError) {
      console.error('DB insert error:', dbError)
      // Don't fail the whole request just because DB insert failed
    }

    // Fetch the media items to include in the email
    let mediaItems = []
    if (data.mediaIds && data.mediaIds.length > 0) {
      const { data: mediaData } = await supabaseServer
        .from('media')
        .select('*')
        .in('id', data.mediaIds)

      mediaItems = mediaData || []
    }

    // Send email notifications
    await sendQuoteEmail(data, mediaItems)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Quote submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
