// Mock user profiles
let userProfiles = [
  {
    id: 1,
    email: 'john.doe@email.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-06-15',
    address: '123 Main St, Anytown, ST 12345',
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543',
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BC123456789',
      groupNumber: 'GRP001',
    },
    medicalHistory: [
      'Hypertension',
      'Type 2 Diabetes',
    ],
    allergies: [
      'Penicillin',
      'Shellfish',
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
];

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

    const profile = userProfiles.find(p => p.id === parseInt(userId));

    if (!profile) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return Response.json({
      success: true,
      profile,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request) {
  try {
    const updateData = await request.json();
    const { userId, ...profileData } = updateData;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const profileIndex = userProfiles.findIndex(p => p.id === parseInt(userId));

    if (profileIndex === -1) {
      return new Response(JSON.stringify({ error: 'User profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update profile
    userProfiles[profileIndex] = {
      ...userProfiles[profileIndex],
      ...profileData,
      id: parseInt(userId), // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      success: true,
      profile: userProfiles[profileIndex],
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}