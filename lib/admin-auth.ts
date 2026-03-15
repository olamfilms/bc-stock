import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'admin_session'
const EXPIRES_IN = '24h'

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function signAdminToken(): Promise<string> {
  const secret = getSecret()
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret)
  return token
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = getSecret()
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export { COOKIE_NAME }
