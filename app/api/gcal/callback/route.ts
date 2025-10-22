import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    console.log('OAuth callback received:');
    console.log('URL:', request.url);
    console.log('Code:', code ? 'Present' : 'Missing');
    console.log('Error:', error || 'None');
    console.log('State:', state || 'None');
    console.log('All params:', Object.fromEntries(searchParams.entries()));

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_denied`);
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      '', // Client secret is not needed for public OAuth clients
      'http://localhost:3000/api/gcal/callback'
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Store tokens in localStorage via client-side redirect
    // Note: In production, you should store these securely in a database
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    };

    // Redirect to frontend with success message
    const redirectUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('gcal_connected', 'true');
    
    // Store tokens in URL hash (temporary solution)
    // In production, use secure server-side storage
    const tokenString = encodeURIComponent(JSON.stringify(tokenData));
    redirectUrl.hash = `tokens=${tokenString}`;

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=callback_failed`);
  }
}
