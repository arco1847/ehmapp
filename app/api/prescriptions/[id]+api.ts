// Mock prescriptions database (same as index)
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
];

export async function GET(request: Request, { id }: { id: string }) {
  try {
    const prescriptionId = parseInt(id);
    const prescription = prescriptions.find(p => p.id === prescriptionId);

    if (!prescription) {
      return new Response(JSON.stringify({ error: 'Prescription not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return Response.json({
      success: true,
      prescription,
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
    const prescriptionId = parseInt(id);
    const updateData = await request.json();

    const prescriptionIndex = prescriptions.findIndex(p => p.id === prescriptionId);

    if (prescriptionIndex === -1) {
      return new Response(JSON.stringify({ error: 'Prescription not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update prescription
    prescriptions[prescriptionIndex] = {
      ...prescriptions[prescriptionIndex],
      ...updateData,
      id: prescriptionId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      success: true,
      prescription: prescriptions[prescriptionIndex],
      message: 'Prescription updated successfully',
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
    const prescriptionId = parseInt(id);
    const prescriptionIndex = prescriptions.findIndex(p => p.id === prescriptionId);

    if (prescriptionIndex === -1) {
      return new Response(JSON.stringify({ error: 'Prescription not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    prescriptions.splice(prescriptionIndex, 1);

    return Response.json({
      success: true,
      message: 'Prescription deleted successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}