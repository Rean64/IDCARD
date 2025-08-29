import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (development only)
  if (process.env.NODE_ENV === 'development') {
    await prisma.payment.deleteMany();
    await prisma.document.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.application.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();
    console.log('📝 Cleared existing data');
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('mindef2024', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mindef.gov.cm',
      password: hashedPassword,
      firstName: 'Colonel',
      lastName: 'Administrator',
      role: 'ADMIN'
    }
  });
  console.log('👤 Created admin user');

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'MINDEF Central Office',
        address: 'Avenue Kennedy, Yaoundé Centre',
        district: 'Yaoundé',
        workingHours: '8:00 AM - 4:00 PM',
        availableDays: [1, 2, 3, 4, 5], // Monday to Friday
        capacity: 20
      }
    }),
    prisma.location.create({
      data: {
        name: 'MINDEF Douala Regional Office',
        address: 'Boulevard de la Liberté, Douala',
        district: 'Douala',
        workingHours: '8:00 AM - 4:00 PM',
        availableDays: [1, 2, 3, 4, 5],
        capacity: 25
      }
    }),
    prisma.location.create({
      data: {
        name: 'MINDEF Northwest Regional Office',
        address: 'Commercial Avenue, Bamenda',
        district: 'Bamenda',
        workingHours: '9:00 AM - 3:00 PM',
        availableDays: [2, 4], // Tuesday and Thursday
        capacity: 15
      }
    }),
    prisma.location.create({
      data: {
        name: 'MINDEF West Regional Office',
        address: 'Route de Douala, Bafoussam',
        district: 'Bafoussam',
        workingHours: '8:30 AM - 3:30 PM',
        availableDays: [1, 3, 5], // Monday, Wednesday, Friday
        capacity: 18
      }
    })
  ]);
  console.log('📍 Created locations');

  // Create sample applications
  const sampleApplications = [
    {
      applicationId: 'MINDEF-1735186234567',
      idType: 'FIRST',
      firstName: 'Jean',
      lastName: 'Baptiste',
      dateOfBirth: new Date('1995-03-15'),
      placeOfBirth: 'Yaoundé, Centre',
      nationality: 'Cameroonian',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      profession: 'Military Officer',
      address: '123 Avenue Kennedy, Yaoundé Centre, Cameroon',
      phoneNumber: '+237 670123456',
      email: 'jean.baptiste@mindef.gov.cm',
      emergencyContact: 'Marie Baptiste',
      emergencyPhone: '+237 698765432',
      fatherName: 'Paul Baptiste',
      fatherProfession: 'Teacher',
      motherName: 'Marie Baptiste',
      motherProfession: 'Nurse',
      paymentAmount: 10000,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'MOBILE_MONEY',
      paymentReference: 'TXN-MB123456',
      paidAt: new Date(),
      status: 'PAYMENT_COMPLETED',
      submittedAt: new Date()
    },
    {
      applicationId: 'MINDEF-1735186234568',
      idType: 'RENEWAL',
      firstName: 'Marie',
      lastName: 'Claire',
      dateOfBirth: new Date('1988-07-22'),
      placeOfBirth: 'Douala, Littoral',
      nationality: 'Cameroonian',
      gender: 'FEMALE',
      maritalStatus: 'MARRIED',
      profession: 'Administrative Officer',
      address: '456 Rue de la Réunification, Douala, Cameroon',
      phoneNumber: '+237 695876543',
      email: 'marie.claire@mindef.gov.cm',
      previousIdNumber: 'CNI-2019-456789',
      expiryDate: new Date('2024-07-22'),
      paymentAmount: 5000,
      paymentStatus: 'COMPLETED',
      paymentMethod: 'CARD',
      paymentReference: 'TXN-CD789012',
      paidAt: new Date(),
      status: 'DOCUMENT_REVIEW',
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      applicationId: 'MINDEF-1735186234569',
      idType: 'LOST',
      firstName: 'Paul',
      lastName: 'Kamga',
      dateOfBirth: new Date('1992-11-08'),
      placeOfBirth: 'Bamenda, Northwest',
      nationality: 'Cameroonian',
      gender: 'MALE',
      maritalStatus: 'SINGLE',
      profession: 'Security Officer',
      address: '789 Commercial Avenue, Bamenda, Cameroon',
      phoneNumber: '+237 654321098',
      email: 'paul.kamga@mindef.gov.cm',
      previousIdNumber: 'CNI-2020-123456',
      paymentAmount: 10000,
      paymentStatus: 'PENDING',
      status: 'PAYMENT_PENDING',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }
  ];

  for (const appData of sampleApplications) {
    await prisma.application.create({
      data: appData
    });
  }
  console.log('📋 Created sample applications');

  // Create appointments for completed applications
  const completedApps = await prisma.application.findMany({
    where: { paymentStatus: 'COMPLETED' }
  });

  for (let i = 0; i < completedApps.length; i++) {
    const app = completedApps[i];
    const location = locations[i % locations.length];
    
    // Create appointment for tomorrow
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        timeSlot: ['09:00', '10:00', '11:00', '14:00'][i % 4],
        locationId: location.id,
        status: 'SCHEDULED'
      }
    });

    // Link appointment to application
    await prisma.application.update({
      where: { id: app.id },
      data: {
        appointmentId: appointment.id,
        status: 'APPOINTMENT_SCHEDULED'
      }
    });
  }
  console.log('📅 Created sample appointments');

  // Create sample payments
  const applications = await prisma.application.findMany({
    where: { paymentStatus: 'COMPLETED' }
  });

  for (const app of applications) {
    await prisma.payment.create({
      data: {
        applicationId: app.id,
        amount: app.paymentAmount,
        currency: 'FCFA',
        method: app.paymentMethod || 'MOBILE_MONEY',
        status: 'COMPLETED',
        transactionId: app.paymentReference,
        description: `Payment for ${app.idType} ID card application`,
        paidAt: app.paidAt
      }
    });
  }
  console.log('💳 Created payment records');

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin user: admin@mindef.gov.cm / mindef2024`);
  console.log(`- Locations: ${locations.length}`);
  console.log(`- Applications: ${sampleApplications.length}`);
  console.log(`- Appointments: ${completedApps.length}`);
  console.log(`- Payments: ${applications.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });