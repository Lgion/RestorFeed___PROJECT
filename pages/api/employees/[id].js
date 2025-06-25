import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const employeeId = parseInt(id);

  if (isNaN(employeeId)) {
    return res.status(400).json({ error: 'Invalid employee ID' });
  }

  if (req.method === 'GET') {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId }
      });
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // Parse assignedTables from JSON string
      const employeeWithTables = {
        ...employee,
        assignedTables: JSON.parse(employee.assignedTables || '[]')
      };
      
      res.status(200).json(employeeWithTables);
    } catch (error) {
      console.error('Error fetching employee:', error);
      res.status(500).json({ error: 'Error fetching employee' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { 
        name, 
        avatar, 
        contact, 
        email,
        dateOfBirth,
        address,
        socialSecurityNumber,
        hireDate,
        fireDate,
        contractType,
        salary,
        status,
        notes,
        assignedTables, 
        location, 
        availability, 
        schedule, 
        role 
      } = req.body;
      
      const employee = await prisma.employee.update({
        where: { id: employeeId },
        data: {
          name,
          avatar,
          contact,
          email,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          socialSecurityNumber,
          hireDate: hireDate ? new Date(hireDate) : null,
          fireDate: fireDate ? new Date(fireDate) : null,
          contractType,
          salary: salary ? parseFloat(salary) : null,
          status,
          notes,
          assignedTables: JSON.stringify(assignedTables || []),
          location,
          availability: availability || 'Available',
          schedule,
          role
        }
      });
      
      // Return employee with parsed assignedTables
      const employeeWithTables = {
        ...employee,
        assignedTables: JSON.parse(employee.assignedTables)
      };
      
      res.status(200).json(employeeWithTables);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Error updating employee' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const updateData = {};
      
      // Only update fields that are provided
      const allowedFields = ['status', 'fireDate'];
      
      for (const field of allowedFields) {
        if (req.body.hasOwnProperty(field)) {
          if (field === 'fireDate' && req.body[field]) {
            updateData[field] = new Date(req.body[field]);
          } else {
            updateData[field] = req.body[field];
          }
        }
      }
      
      const employee = await prisma.employee.update({
        where: { id: employeeId },
        data: updateData
      });
      
      // Return employee with parsed assignedTables
      const employeeWithTables = {
        ...employee,
        assignedTables: JSON.parse(employee.assignedTables || '[]')
      };
      
      res.status(200).json(employeeWithTables);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Error updating employee' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.employee.delete({
        where: { id: employeeId }
      });
      
      res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Error deleting employee' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
