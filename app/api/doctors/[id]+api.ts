// Mock doctors database (same as index)
const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.9,
    experience: 15,
    location: 'Heart Care Center, 123 Medical Ave',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@heartcare.com',
    bio: 'Dr. Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions.',
    education: 'MD from Harvard Medical School',
    languages: ['English', 'Spanish'],
    acceptsInsurance: true,
    availableSlots: [
      { date: '2024-02-15', times: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { date: '2024-02-16', times: ['9:30 AM', '10:30 AM', '1:30 PM', '2:30 PM'] },
      { date: '2024-02-17', times: ['9:00 AM', '11:00 AM', '3:00 PM', '4:00 PM'] },
    ],
    image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 2,
    name: 'Dr. Michael Brown',
    specialty: 'General Practitioner',
    rating: 4.7,
    experience: 12,
    location: 'Family Health Clinic, 456 Wellness Blvd',
    phone: '+1 (555) 987-6543',
    email: 'michael.brown@familyhealth.com',
    bio: 'Dr. Brown provides comprehensive primary care services for patients of all ages.',
    education: 'MD from Johns Hopkins University',
    languages: ['English'],
    acceptsInsurance: true,
    availableSlots: [
      { date: '2024-02-15', times: ['8:00 AM', '9:00 AM', '1:00 PM', '4:00 PM'] },
      { date: '2024-02-16', times: ['8:30 AM', '10:00 AM', '2:00 PM', '3:30 PM'] },
      { date: '2024-02-18', times: ['9:00 AM', '10:30 AM', '2:30 PM'] },
    ],
    image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export async function GET(request: Request, { id }: { id: string }) {
  try {
    const doctorId = parseInt(id);
    const doctor = doctors.find(d => d.id === doctorId);

    if (!doctor) {
      return new Response(JSON.stringify({ error: 'Doctor not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return Response.json({
      success: true,
      doctor,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}