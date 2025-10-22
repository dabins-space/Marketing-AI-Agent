import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface CreateEventRequest {
  title: string;
  description: string;
  location?: string;
  startISO: string;
  endISO: string;
  attendees?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEventRequest = await request.json();
    const { title, description, location, startISO, endISO, attendees } = body;

    // Get tokens from request headers (in production, get from secure storage)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid authorization token provided' },
        { status: 401 }
      );
    }

    const tokenData = JSON.parse(authHeader.replace('Bearer ', ''));
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      '', // Client secret is not needed for public OAuth clients
      'http://localhost:3000/api/gcal/callback'
    );

    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Parse dates and determine if it's all-day
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    
    // Check if it's all-day (dates only, no time)
    const isAllDay = startISO.includes('T') === false || 
                     (startDate.getHours() === 0 && startDate.getMinutes() === 0 && 
                      endDate.getHours() === 0 && endDate.getMinutes() === 0);

    // Format dates for Google Calendar
    let eventStart, eventEnd;
    
    if (isAllDay) {
      // All-day event - use date only
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = new Date(endDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Google Calendar all-day events end date is exclusive
      
      eventStart = { date: startDateStr };
      eventEnd = { date: endDateStr };
    } else {
      // Timed event - use datetime with timezone
      eventStart = { 
        dateTime: startISO,
        timeZone: process.env.GCAL_TIMEZONE || 'Asia/Seoul'
      };
      eventEnd = { 
        dateTime: endISO,
        timeZone: process.env.GCAL_TIMEZONE || 'Asia/Seoul'
      };
    }

    // Prepare attendees
    const attendeeList = attendees?.map(email => ({ email })) || [];

    // Create event
    const event = {
      summary: title,
      description: description,
      location: location || '',
      start: eventStart,
      end: eventEnd,
      attendees: attendeeList,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 10 },
          { method: 'email', minutes: 1440 } // 24 hours
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({ 
      success: true, 
      eventId: response.data.id,
      eventLink: response.data.htmlLink 
    });

  } catch (error: any) {
    console.error('Google Calendar create event error:', error);
    
    // Check if it's an authentication error
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json(
        { error: 'Authentication expired. Please reconnect to Google Calendar.', code: 'AUTH_EXPIRED' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
