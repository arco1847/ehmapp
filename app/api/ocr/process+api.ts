export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OCR results - in real app, this would use actual OCR service
    const mockOCRResults = [
      {
        medication: 'Amoxicillin',
        strength: '500mg',
        dosage: '3 times daily',
        quantity: '30 tablets',
        doctor: 'Dr. Smith',
        pharmacy: 'CVS Pharmacy',
        date: new Date().toISOString().split('T')[0],
        refills: '2',
        instructions: 'Take with food. Complete the full course.',
      },
      {
        medication: 'Lisinopril',
        strength: '10mg',
        dosage: 'Once daily',
        quantity: '90 tablets',
        doctor: 'Dr. Johnson',
        pharmacy: 'Walgreens',
        date: new Date().toISOString().split('T')[0],
        refills: '5',
        instructions: 'Take in the morning with water.',
      },
      {
        medication: 'Metformin',
        strength: '500mg',
        dosage: 'Twice daily',
        quantity: '60 tablets',
        doctor: 'Dr. Brown',
        pharmacy: 'CVS Pharmacy',
        date: new Date().toISOString().split('T')[0],
        refills: '3',
        instructions: 'Take with meals to reduce stomach upset.',
      },
    ];

    // Return random mock result
    const randomResult = mockOCRResults[Math.floor(Math.random() * mockOCRResults.length)];

    return Response.json({
      success: true,
      extractedData: randomResult,
      confidence: 0.95,
      message: 'OCR processing completed successfully',
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'OCR processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}