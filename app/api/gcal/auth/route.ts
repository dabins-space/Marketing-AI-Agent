import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    console.log('Google Calendar auth endpoint called');
    console.log('Environment variables check:');
    console.log('VITE_GOOGLE_CLIENT_ID:', process.env.VITE_GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
    console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI ? 'Set' : 'Not set');

    if (!process.env.VITE_GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Missing required environment variables. Please check your .env file.' },
        { status: 500 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      '', // Client secret is not needed for public OAuth clients
      'http://localhost:3000/api/gcal/callback'
    );

    // Generate the URL for OAuth2 consent screen
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent', // Force consent screen to get refresh token
    });

    console.log('Generated auth URL:', authUrl);
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google Calendar auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
