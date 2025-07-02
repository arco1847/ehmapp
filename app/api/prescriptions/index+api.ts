// Mock prescriptions database
let prescriptions = [
  {
    id: 1,
    userId: 1,
    medication: 'Amoxicillin 500mg',
    doctor: 'Dr. Smith',
    pharmacy: 'CVS Pharmacy',
    date: '2024-01-15',
    status: 'Active',
    dosage: '3 times daily',
    quantity: '30 tablets',
    refills: 2,
    instructions: 'Take with food. Complete the full course.',
    strength: '500mg',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    medication: 'Lisinopril 10mg',
    doctor: 'Dr. Johnson',
    pharmacy: 'Walgreens',
    date: '2024-01-10',
    status: 'Active',
    dosage: 'Once daily',
    quantity: '90 tablets',
    refills: 5,
    instructions: 'Take in the morning with water.',
    strength: '10mg',
    createdAt: '2024-01-10T14:30:00Z',
  },
  {
    id: 3,
    userId: 1,
    medication: 'Metformin 500mg',
    doctor: 'Dr. Brown',
    pharmacy: 'CVS Pharmacy',
    date: '2024-01-05',
    status: 'Expired',
    dosage: 'Twice daily',
    quantity: '60 tablets',
    refills: 0,
    instructions: 'Take with meals to reduce stomach upset.',
    strength: '500mg',
    createdAt: '2024-01-05T09:15:00Z',
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let filteredPrescriptions = prescriptions.filter(p => p.userId === parseInt(userId));

    // Filter by status
    if (status) {
      filteredPrescriptions = filteredPrescriptions.filter(p => 
        p.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Search functionality
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPrescriptions = filteredPrescriptions.filter(p =>
        p.medication.toLowerCase().includes(searchLower) ||
        p.doctor.toLowerCase().includes(searchLower) ||
        p.pharmacy.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filteredPrescriptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Response.json({
      success: true,
      prescriptions: filteredPrescriptions,
      total: filteredPrescriptions.length,
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
    const prescriptionData = await request.json();

    const {
      userId,
      medication,
      doctor,
      pharmacy,
      date,
      dosage,
      quantity,
      refills,
      instructions,
      strength,
    } = prescriptionData;

    if (!userId || !medication || !doctor || !dosage) {
      return new Response(JSON.stringify({ error: 'Required fields are missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newPrescription = {
      id: Date.now(),
      userId: parseInt(userId),
      medication,
      doctor,
      pharmacy: pharmacy || '',
      date: date || new Date().toISOString().split('T')[0],
      status: 'Active',
      dosage,
      quantity: quantity || '',
      refills: parseInt(refills) || 0,
      instructions: instructions || '',
      strength: strength || '',
      createdAt: new Date().toISOString(),
    };

    prescriptions.push(newPrescription);

    return Response.json({
      success: true,
      prescription: newPrescription,
      message: 'Prescription saved successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}