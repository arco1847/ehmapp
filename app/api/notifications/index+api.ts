// Mock notifications database
let notifications = [
  {
    id: 1,
    userId: 1,
    title: 'Prescription Reminder',
    message: 'Time to take your Amoxicillin 500mg',
    type: 'medication',
    priority: 'high',
    read: false,
    createdAt: '2024-01-25T08:00:00Z',
    scheduledFor: '2024-01-25T08:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. Johnson tomorrow at 10:00 AM',
    type: 'appointment',
    priority: 'medium',
    read: false,
    createdAt: '2024-01-24T18:00:00Z',
    scheduledFor: '2024-01-24T18:00:00Z',
  },
  {
    id: 3,
    userId: 1,
    title: 'Refill Available',
    message: 'Your Lisinopril prescription is ready for refill',
    type: 'refill',
    priority: 'low',
    read: true,
    createdAt: '2024-01-23T12:00:00Z',
    scheduledFor: '2024-01-23T12:00:00Z',
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const unreadOnly = url.searchParams.get('unreadOnly');
    const type = url.searchParams.get('type');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let filteredNotifications = notifications.filter(n => n.userId === parseInt(userId));

    // Filter unread only
    if (unreadOnly === 'true') {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }

    // Filter by type
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Response.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount: notifications.filter(n => n.userId === parseInt(userId) && !n.read).length,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const notificationData = await request.json();

    const {
      userId,
      title,
      message,
      type,
      priority,
      scheduledFor,
    } = notificationData;

    if (!userId || !title || !message) {
      return new Response(JSON.stringify({ error: 'Required fields are missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newNotification = {
      id: Date.now(),
      userId: parseInt(userId),
      title,
      message,
      type: type || 'general',
      priority: priority || 'medium',
      read: false,
      createdAt: new Date().toISOString(),
      scheduledFor: scheduledFor || new Date().toISOString(),
    };

    notifications.push(newNotification);

    return Response.json({
      success: true,
      notification: newNotification,
      message: 'Notification created successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}