// Mock appointments database
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
  {
    id: 2,
    userId: 1,
    doctorName: 'Dr. Michael Brown',
    specialty: 'General Practitioner',
    date: '2024-02-20',
    time: '2:30 PM',
    duration: 45,
    status: 'Pending',
    type: 'Telemedicine',
    location: 'Video Call',
    notes: 'Follow-up on recent lab results',
    phone: '+1 (555) 987-6543',
    createdAt: '2024-01-22T14:15:00Z',
  },
  {
    id: 3,
    userId: 1,
    doctorName: 'Dr. Emily Davis',
    specialty: 'Dermatologist',
    date: '2024-01-10',
    time: '11:15 AM',
    duration: 30,
    status: 'Completed',
    type: 'In-Person',
    location: 'Skin Health Clinic, 456 Wellness Blvd',
    notes: 'Skin examination and mole check',
    phone: '+1 (555) 456-7890',
    createdAt: '2024-01-05T16:30:00Z',
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');
    const upcoming = url.searchParams.get('upcoming');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let filteredAppointments = appointments.filter(a => a.userId === parseInt(userId));

    // Filter by status
    if (status) {
      filteredAppointments = filteredAppointments.filter(a => 
        a.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter upcoming appointments
    if (upcoming === 'true') {
      const today = new Date();
      filteredAppointments = filteredAppointments.filter(a => {
        const appointmentDate = new Date(a.date);
        return appointmentDate >= today && a.status !== 'Completed' && a.status !== 'Cancelled';
      });
    }

    // Sort by date and time
    filteredAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    return Response.json({
      success: true,
      appointments: filteredAppointments,
      total: filteredAppointments.length,
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
    const appointmentData = await request.json();

    const {
      userId,
      doctorName,
      specialty,
      date,
      time,
      duration,
      type,
      location,
      notes,
      phone,
    } = appointmentData;

    if (!userId || !doctorName || !specialty || !date || !time) {
      return new Response(JSON.stringify({ error: 'Required fields are missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate appointment date is not in the past
    const appointmentDate = new Date(`${date} ${time}`);
    const now = new Date();
    if (appointmentDate <= now) {
      return new Response(JSON.stringify({ error: 'Appointment date must be in the future' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newAppointment = {
      id: Date.now(),
      userId: parseInt(userId),
      doctorName,
      specialty,
      date,
      time,
      duration: parseInt(duration) || 30,
      status: 'Pending',
      type: type || 'In-Person',
      location: location || '',
      notes: notes || '',
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    appointments.push(newAppointment);

    return Response.json({
      success: true,
      appointment: newAppointment,
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}