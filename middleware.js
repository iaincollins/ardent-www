import { NextResponse } from 'next/server'

const maintenancePaths = ['/maintenance', '/_next', '/api']

export function middleware(req) {
  const url = req.nextUrl.clone()
  const { pathname } = url

  if (maintenancePaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const isMaintenance = process.env.MAINTENANCE_MODE === 'true'
  if (isMaintenance) {
    url.pathname = '/maintenance'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
