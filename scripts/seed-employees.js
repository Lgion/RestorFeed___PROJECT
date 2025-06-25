const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const MOCK_EMPLOYEES = [
  {
    name: "Ethan Carter",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    contact: "555–123–4567",
    assignedTables: [1, 2, 3],
    location: "Dining Area",
    availability: "Available",
    schedule: "Mon–Fri, 10 AM - 6 PM",
    role: "Serveur"
  },
  {
    name: "Alice Dupont",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    contact: "555–987–6543",
    assignedTables: [4, 5],
    location: "Terrasse",
    availability: "Absent",
    schedule: "Tue–Sat, 12 PM - 8 PM",
    role: "Serveuse"
  },
  {
    name: "Jean Martin",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    contact: "555–111–2222",
    assignedTables: [6],
    location: "Bar",
    availability: "Available",
    schedule: "Mon–Fri, 18 PM - 23 PM",
    role: "Barman"
  }
];

async function seedEmployees() {
  try {
    console.log('Seeding employees...');
    
    for (const emp of MOCK_EMPLOYEES) {
      await prisma.employee.create({
        data: {
          ...emp,
          assignedTables: JSON.stringify(emp.assignedTables)
        }
      });
    }
    
    console.log('✅ Employees seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding employees:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedEmployees();
