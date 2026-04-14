import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary environment variables not configured' },
      { status: 500 }
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = 'bc-stock'
  const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto
    .createHash('sha1')
    .update(signatureString)
    .digest('hex')

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder })
}
