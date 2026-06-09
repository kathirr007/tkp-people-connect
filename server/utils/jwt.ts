import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export async function generateRefreshToken(payload: TokenPayload): Promise<string> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtRefreshSecret)

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)

  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as TokenPayload
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtRefreshSecret)

  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as TokenPayload
}

export function setAuthCookies(event: H3Event, accessToken: string, refreshToken: string) {
  setCookie(event, 'access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  })

  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearAuthCookies(event: H3Event) {
  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })
}
