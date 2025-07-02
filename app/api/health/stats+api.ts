export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock health statistics
    const healthStats = {
      prescriptions: {
        total: 12,
        active: 8,
        expired: 4,
        refillsAvailable: 3,
      },
      appointments: {
        total: 15,
        upcoming: 2,
        completed: 12,
        cancelled: 1,
      },
      medications: {
        dailyMedications: 4,
        asNeededMedications: 2,
        totalDosesThisWeek: 28,
        missedDoses: 1,
      },
      healthMetrics: {
        lastCheckup: '2024-01-15',
        nextAppointment: '2024-02-15',
        activePrescriptions: 8,
        healthScore: 85,
      },
      recentActivity: [
        {
          type: 'prescription_added',
          description: 'Added Amoxicillin 500mg',
          date: '2024-01-20',
        },
        {
          type: 'appointment_booked',
          description: 'Booked appointment with Dr. Johnson',
          date: '2024-01-18',
        },
        {
          type: 'medication_taken',
          description: 'Took morning medications',
          date: '2024-01-25',
        },
      ],
    };

    return Response.json({
      success: true,
      stats: healthStats,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}