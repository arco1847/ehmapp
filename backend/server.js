const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'EMP',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (first_name, last_name, email, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [firstName, lastName, email, phone || null, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: result.insertId,
        email,
        name: `${firstName} ${lastName}`,
        phone: phone || null
      },
      token,
      message: 'Account created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, phone, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Prescription Routes
app.get('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    const { userId, status, search } = req.query;
    let query = 'SELECT * FROM prescriptions WHERE user_id = ?';
    let params = [userId || req.user.userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (medication LIKE ? OR doctor_name LIKE ? OR pharmacy_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [prescriptions] = await pool.execute(query, params);

    res.json({
      success: true,
      prescriptions,
      total: prescriptions.length
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/prescriptions', authenticateToken, async (req, res) => {
  try {
    const {
      medication,
      doctor,
      pharmacy,
      dosage,
      quantity,
      refills,
      instructions,
      strength
    } = req.body;

    if (!medication || !doctor || !dosage) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const [result] = await pool.execute(
      `INSERT INTO prescriptions 
       (user_id, medication, doctor_name, pharmacy_name, dosage, quantity, refills, instructions, strength, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', NOW())`,
      [
        req.user.userId,
        medication,
        doctor,
        pharmacy || null,
        dosage,
        quantity || null,
        parseInt(refills) || 0,
        instructions || null,
        strength || null
      ]
    );

    const [newPrescription] = await pool.execute(
      'SELECT * FROM prescriptions WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      prescription: newPrescription[0],
      message: 'Prescription saved successfully'
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/prescriptions/:id', authenticateToken, async (req, res) => {
  try {
    const [prescriptions] = await pool.execute(
      'SELECT * FROM prescriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (prescriptions.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json({
      success: true,
      prescription: prescriptions[0]
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/prescriptions/:id', authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;
    const prescriptionId = req.params.id;

    // Check if prescription exists and belongs to user
    const [existing] = await pool.execute(
      'SELECT id FROM prescriptions WHERE id = ? AND user_id = ?',
      [prescriptionId, req.user.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(prescriptionId, req.user.userId);

    await pool.execute(
      `UPDATE prescriptions SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    // Get updated prescription
    const [updated] = await pool.execute(
      'SELECT * FROM prescriptions WHERE id = ?',
      [prescriptionId]
    );

    res.json({
      success: true,
      prescription: updated[0],
      message: 'Prescription updated successfully'
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/prescriptions/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM prescriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Appointment Routes
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    let query = 'SELECT * FROM appointments WHERE user_id = ?';
    let params = [req.user.userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (upcoming === 'true') {
      query += ' AND appointment_date >= CURDATE() AND status NOT IN ("Completed", "Cancelled")';
    }

    query += ' ORDER BY appointment_date ASC, appointment_time ASC';

    const [appointments] = await pool.execute(query, params);

    res.json({
      success: true,
      appointments,
      total: appointments.length
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const {
      doctorName,
      specialty,
      appointmentDate,
      appointmentTime,
      duration,
      type,
      location,
      notes,
      phone
    } = req.body;

    if (!doctorName || !specialty || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const [result] = await pool.execute(
      `INSERT INTO appointments 
       (user_id, doctor_name, specialty, appointment_date, appointment_time, duration, type, location, notes, phone, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
      [
        req.user.userId,
        doctorName,
        specialty,
        appointmentDate,
        appointmentTime,
        parseInt(duration) || 30,
        type || 'In-Person',
        location || null,
        notes || null,
        phone || null
      ]
    );

    const [newAppointment] = await pool.execute(
      'SELECT * FROM appointments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      appointment: newAppointment[0],
      message: 'Appointment booked successfully'
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctor Routes
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialty, search, location } = req.query;
    let query = 'SELECT * FROM doctors WHERE 1=1';
    let params = [];

    if (specialty) {
      query += ' AND specialty LIKE ?';
      params.push(`%${specialty}%`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR specialty LIKE ? OR location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    query += ' ORDER BY rating DESC';

    const [doctors] = await pool.execute(query, params);

    res.json({
      success: true,
      doctors,
      total: doctors.length
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health Stats Route
app.get('/api/health/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get prescription stats
    const [prescriptionStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired,
        SUM(CASE WHEN refills > 0 THEN 1 ELSE 0 END) as refills_available
       FROM prescriptions WHERE user_id = ?`,
      [userId]
    );

    // Get appointment stats
    const [appointmentStats] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN appointment_date >= CURDATE() AND status NOT IN ('Completed', 'Cancelled') THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM appointments WHERE user_id = ?`,
      [userId]
    );

    const stats = {
      prescriptions: prescriptionStats[0],
      appointments: appointmentStats[0],
      medications: {
        dailyMedications: 4,
        asNeededMedications: 2,
        totalDosesThisWeek: 28,
        missedDoses: 1
      },
      healthMetrics: {
        lastCheckup: '2024-01-15',
        nextAppointment: '2024-02-15',
        activePrescriptions: prescriptionStats[0].active,
        healthScore: 85
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get health stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8081'}`);
  });
}

startServer().catch(console.error);

module.exports = app;