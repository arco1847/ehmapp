export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock user authentication - replace with real database lookup
    const mockUsers = [
      { id: 1, email: 'john.doe@email.com', password: 'password123', name: 'John Doe', phone: '+1 (555) 123-4567' },
      { id: 2, email: 'jane.smith@email.com', password: 'password123', name: 'Jane Smith', phone: '+1 (555) 987-6543' },
    ];

    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate mock JWT token
    const token = `jwt_${user.id}_${Date.now()}`;

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}