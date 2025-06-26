import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const employees = await prisma.employee.findMany({
        include: {
          user: true // Inclure les données user
        },
        orderBy: { createdAt: 'desc' }
      });
      
      // Parse assignedTables from JSON string
      const employeesWithTables = employees.map(employee => ({
        ...employee,
        assignedTables: JSON.parse(employee.assignedTables || '[]')
      }));
      
      res.status(200).json(employeesWithTables);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Error fetching employees' });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        name, 
        avatar, 
        contact, 
        userId,
        dateOfBirth,
        address,
        socialSecurityNumber,
        hireDate,
        contractType,
        salary,
        notes,
        assignedTables, 
        location, 
        availability, 
        schedule, 
        role 
      } = req.body;
      
      const employee = await prisma.employee.create({
        data: {
          name,
          avatar,
          contact,
          userId: userId ? parseInt(userId) : null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          socialSecurityNumber,
          hireDate: hireDate ? new Date(hireDate) : null,
          contractType,
          salary: salary ? parseFloat(salary) : null,
          notes,
          assignedTables: JSON.stringify(assignedTables || []),
          location,
          availability: availability || 'Available',
          schedule,
          role
        },
        include: {
          user: true // Inclure les données user dans la réponse
        }
      });
      
      // Return employee with parsed assignedTables
      const employeeWithTables = {
        ...employee,
        assignedTables: JSON.parse(employee.assignedTables)
      };
      
      res.status(201).json(employeeWithTables);
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ error: 'Error creating employee' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
