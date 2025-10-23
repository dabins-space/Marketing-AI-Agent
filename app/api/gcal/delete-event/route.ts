import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function DELETE(request: NextRequest) {
  try {
    const { eventId, tokens } = await request.json();

    // Remove gcal_ prefix if present (handle multiple prefixes)
    let actualEventId = eventId;
    if (typeof eventId === 'string') {
      // Remove all gcal_ prefixes
      while (actualEventId.startsWith('gcal_')) {
        actualEventId = actualEventId.replace('gcal_', '');
      }
    }

    console.log('Delete event request:', { 
      originalEventId: eventId, 
      actualEventId, 
      hasTokens: !!tokens,
      eventIdType: typeof eventId 
    });

    if (!actualEventId) {
      console.error('No eventId provided');
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    if (!tokens) {
      console.error('No tokens provided');
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/gcal/callback'
    );

    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: actualEventId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
