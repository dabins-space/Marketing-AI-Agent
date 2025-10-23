import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function PUT(request: NextRequest) {
  try {
    const { eventId, start, end, title, description, tokens } = await request.json();

    // Remove gcal_ prefix if present (handle multiple prefixes)
    let actualEventId = eventId;
    if (typeof eventId === 'string') {
      // Remove all gcal_ prefixes
      while (actualEventId.startsWith('gcal_')) {
        actualEventId = actualEventId.replace('gcal_', '');
      }
    }

    console.log('Update event request:', { 
      originalEventId: eventId, 
      actualEventId, 
      start, 
      end, 
      title, 
      description, 
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

    // Get the existing event first
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: actualEventId,
    });

    // Update the event
    const updatedEvent = await calendar.events.update({
      calendarId: 'primary',
      eventId: actualEventId,
      requestBody: {
        ...existingEvent.data,
        start: start ? { dateTime: start } : existingEvent.data.start,
        end: end ? { dateTime: end } : existingEvent.data.end,
        summary: title || existingEvent.data.summary,
        description: description || existingEvent.data.description,
      },
    });

    return NextResponse.json({ success: true, event: updatedEvent.data });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
