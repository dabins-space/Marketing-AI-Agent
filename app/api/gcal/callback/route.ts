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
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
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

    // Return HTML page that stores tokens and redirects
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Google Calendar 연결 완료</title>
</head>
<body>
    <script>
        // Store tokens in localStorage
        const tokens = ${JSON.stringify(tokenData)};
        localStorage.setItem('google_calendar_tokens', JSON.stringify(tokens));
        
        // Redirect to main page with success parameter
        window.location.href = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?gcal_connected=true&success=true';
    </script>
    <p>구글 캘린더 연결이 완료되었습니다. 잠시 후 메인 페이지로 이동합니다...</p>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=callback_failed`);
  }
}
