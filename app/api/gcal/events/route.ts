import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Helper function to update strategy events with proper tags
async function updateStrategyEvents(events: any[], oauth2Client: any) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  for (const event of events) {
    try {
      // Extract the actual Google Calendar event ID
      const actualEventId = event.id.replace('gcal_', '');
      
      // Get the existing event
      const existingEvent = await calendar.events.get({
        calendarId: 'primary',
        eventId: actualEventId,
      });

      // Update with proper tags
      const updatedEvent = {
        ...existingEvent.data,
        summary: `[전략] ${event.title}`,
        description: `[MARKETING_STRATEGY]\n${event.description}`
      };

      await calendar.events.update({
        calendarId: 'primary',
        eventId: actualEventId,
        requestBody: updatedEvent,
      });

      console.log(`Updated strategy event: ${event.title}`);
    } catch (error) {
      console.error(`Failed to update strategy event ${event.title}:`, error);
    }
  }
}

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get tokens from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No valid authorization token provided' },
        { status: 401 }
      );
    }

    const tokenData = JSON.parse(authHeader.replace('Bearer ', ''));
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get events for the requested month
    const url = new URL(request.url);
    const year = parseInt(url.searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(url.searchParams.get('month') || new Date().getMonth().toString());
    
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    // Format events for frontend
    const formattedEvents = events.map((event, index) => {
      const start = event.start?.dateTime || event.start?.date;
      const end = event.end?.dateTime || event.end?.date;
      
      // Check if this is a strategy event (created by our app)
      const isStrategyEvent = event.description?.includes('[MARKETING_STRATEGY]') || 
                             event.summary?.includes('[전략]') ||
                             event.description?.includes('전략 실행') ||
                             event.description?.includes('전략:') ||
                             event.description?.includes('실행 모드:') ||
                             event.description?.includes('📍 채널:') ||
                             event.description?.includes('📦 산출물:') ||
                             event.description?.includes('Influencer') ||
                             event.description?.includes('마케팅') ||
                             event.description?.includes('콘텐츠');
      
      // Extract strategy code and title for strategy events
      let strategyCode = null;
      let strategyTitle = null;
      
      if (isStrategyEvent) {
        // Extract strategy code
        const codeMatch = event.description?.match(/전략 코드:\s*([A-Z0-9]+)/i);
        strategyCode = codeMatch ? codeMatch[1] : null;
        
        // Extract strategy title
        const titleMatch = event.description?.match(/전략:\s*([^\n]+)/);
        strategyTitle = titleMatch ? titleMatch[1] : null;
      }
      
      return {
        id: `gcal_${event.id || index}`,
        title: isStrategyEvent ? (event.summary || '제목 없음').replace(/^\[전략\]\s*/, '') : (event.summary || '제목 없음'),
        description: isStrategyEvent ? (event.description || '').replace(/^\[MARKETING_STRATEGY\]\n?/, '') : (event.description || ''),
        start: start,
        end: end,
        location: event.location || '',
        isAllDay: !event.start?.dateTime,
        type: isStrategyEvent ? 'strategy' as const : 'personal' as const,
        color: isStrategyEvent ? 'bg-gradient-to-r from-[#FF8C00] to-[#FF6B35]' : 'bg-blue-500',
        source: 'google',
        strategyCode: strategyCode,
        strategyTitle: strategyTitle
      };
    });

    // Auto-update strategy events that don't have proper tags
    const strategyEventsToUpdate = formattedEvents.filter(event => 
      event.type === 'strategy' && 
      !event.description.includes('[MARKETING_STRATEGY]') &&
      !event.title.includes('[전략]')
    );

    // Update strategy events in background (don't wait for completion)
    if (strategyEventsToUpdate.length > 0) {
      updateStrategyEvents(strategyEventsToUpdate, oauth2Client).catch(console.error);
    }

    return NextResponse.json({ 
      success: true, 
      events: formattedEvents 
    });

  } catch (error: any) {
    console.error('Google Calendar events fetch error:', error);
    
    // Check if it's an authentication error
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json(
        { error: 'Authentication expired. Please reconnect to Google Calendar.', code: 'AUTH_EXPIRED' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
