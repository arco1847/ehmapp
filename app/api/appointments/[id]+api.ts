// Mock appointments database (same as index)
let appointments = [
  {
    id: 1,
    userId: 1,
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    date: '2024-02-15',
    time: '10:00 AM',
    duration: 30,
    status: 'Confirmed',
    type: 'In-Person',
    location: 'Heart Care Center, 123 Medical Ave',
    notes: 'Regular checkup and blood pressure monitoring',
    phone: '+1 (555) 123-4567',
    createdAt: '2024-01-20T09:00:00Z',
  },
];

export async function GET(request: Request, { id }: { id: string }) {
  try {
    const appointmentId = parseInt(id);
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return Response.json({
      success: true,
      appointment,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request, { id }: { id: string }) {
  try {
    const appointmentId = parseInt(id);
    const updateData = await request.json();

    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);

    if (appointmentIndex === -1) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update appointment
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updateData,
      id: appointmentId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      success: true,
      appointment: appointments[appointmentIndex],
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request, { id }: { id: string }) {
  try {
    const appointmentId = parseInt(id);
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);

    if (appointmentIndex === -1) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mark as cancelled instead of deleting
    appointments[appointmentIndex].status = 'Cancelled';
    appointments[appointmentIndex].updatedAt = new Date().toISOString();

    return Response.json({
      success: true,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}