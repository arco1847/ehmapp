export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return new Response(JSON.stringify({ error: 'All required fields must be provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Password validation
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock user creation - replace with real database insertion
    const newUser = {
      id: Date.now(),
      email,
      name: `${firstName} ${lastName}`,
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    // Generate mock JWT token
    const token = `jwt_${newUser.id}_${Date.now()}`;

    return Response.json({
      success: true,
      user: newUser,
      token,
      message: 'Account created successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}