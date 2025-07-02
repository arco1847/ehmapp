// Mock notifications database (same as index)
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
];

export async function PUT(request: Request, { id }: { id: string }) {
  try {
    const notificationId = parseInt(id);
    const notificationIndex = notifications.findIndex(n => n.id === notificationId);

    if (notificationIndex === -1) {
      return new Response(JSON.stringify({ error: 'Notification not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mark as read
    notifications[notificationIndex].read = true;

    return Response.json({
      success: true,
      notification: notifications[notificationIndex],
      message: 'Notification marked as read',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}