// Mock doctors database
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
  {
    id: 3,
    name: 'Dr. Emily Davis',
    specialty: 'Dermatologist',
    rating: 4.8,
    experience: 10,
    location: 'Skin Health Clinic, 789 Beauty Lane',
    phone: '+1 (555) 456-7890',
    email: 'emily.davis@skinhealth.com',
    bio: 'Dr. Davis specializes in medical and cosmetic dermatology with a focus on skin cancer prevention.',
    education: 'MD from Stanford University',
    languages: ['English', 'French'],
    acceptsInsurance: true,
    availableSlots: [
      { date: '2024-02-16', times: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { date: '2024-02-17', times: ['9:00 AM', '1:00 PM', '2:00 PM'] },
      { date: '2024-02-19', times: ['10:30 AM', '11:30 AM', '3:30 PM'] },
    ],
    image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Orthopedist',
    rating: 4.6,
    experience: 18,
    location: 'Bone & Joint Center, 321 Sports Ave',
    phone: '+1 (555) 234-5678',
    email: 'james.wilson@bonecenter.com',
    bio: 'Dr. Wilson is an orthopedic surgeon specializing in sports medicine and joint replacement.',
    education: 'MD from Mayo Clinic',
    languages: ['English'],
    acceptsInsurance: true,
    availableSlots: [
      { date: '2024-02-15', times: ['11:00 AM', '1:00 PM', '3:00 PM'] },
      { date: '2024-02-17', times: ['9:30 AM', '2:30 PM', '4:00 PM'] },
      { date: '2024-02-18', times: ['10:00 AM', '1:30 PM'] },
    ],
    image: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 5,
    name: 'Dr. Lisa Chen',
    specialty: 'Pediatrician',
    rating: 4.9,
    experience: 8,
    location: 'Children\'s Health Center, 654 Kids Way',
    phone: '+1 (555) 345-6789',
    email: 'lisa.chen@childrenshealth.com',
    bio: 'Dr. Chen is a pediatrician dedicated to providing comprehensive care for children from infancy through adolescence.',
    education: 'MD from UCLA',
    languages: ['English', 'Mandarin'],
    acceptsInsurance: true,
    availableSlots: [
      { date: '2024-02-16', times: ['8:00 AM', '9:00 AM', '10:00 AM', '2:00 PM'] },
      { date: '2024-02-17', times: ['8:30 AM', '11:00 AM', '1:30 PM'] },
      { date: '2024-02-19', times: ['9:00 AM', '10:30 AM', '3:00 PM'] },
    ],
    image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const specialty = url.searchParams.get('specialty');
    const search = url.searchParams.get('search');
    const location = url.searchParams.get('location');

    let filteredDoctors = [...doctors];

    // Filter by specialty
    if (specialty) {
      filteredDoctors = filteredDoctors.filter(d => 
        d.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDoctors = filteredDoctors.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.specialty.toLowerCase().includes(searchLower) ||
        d.location.toLowerCase().includes(searchLower)
      );
    }

    // Filter by location
    if (location) {
      filteredDoctors = filteredDoctors.filter(d =>
        d.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Sort by rating (highest first)
    filteredDoctors.sort((a, b) => b.rating - a.rating);

    return Response.json({
      success: true,
      doctors: filteredDoctors,
      total: filteredDoctors.length,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}