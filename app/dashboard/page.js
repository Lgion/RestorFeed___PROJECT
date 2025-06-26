"use client";
import { useEffect, useState } from "react";

const ORDER_STATUS = ["En cours", "Prête", "Livrée"];

function getOrders() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("orders");
    if (stored) return JSON.parse(stored);
  }
  return [];
}

function getTodaySales(orders) {
  const today = new Date().toISOString().slice(0, 10);
  let sum = 0;
  orders.forEach(o => {
    if (o.date && o.date.slice(0, 10) === today) {
      if (o.items) {
        o.items.forEach(item => {
          sum += (item.price || 10) * (item.qty || item.quantity || 1); // fallback price
        });
      }
    }
  });
  return sum;
}

function getHourlySales(orders) {
  const today = new Date().toISOString().slice(0, 10);
  const hours = Array(8).fill(0); // 10h à 18h (index 0 = 10h)
  orders.forEach(o => {
    if (o.date && o.date.slice(0, 10) === today && o.items) {
      const hour = new Date(o.date).getHours();
      if (hour >= 10 && hour <= 17) {
        let total = 0;
        o.items.forEach(item => {
          total += (item.price || 10) * (item.qty || item.quantity || 1);
        });
        hours[hour - 10] += total;
      }
    }
  });
  return hours;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tab, setTab] = useState("Employees");
  
  // Modal states
  const [showAssign, setShowAssign] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDirect, setShowDirect] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFireModal, setShowFireModal] = useState(false);
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    avatar: '',
    contact: '',
    userId: '',
    dateOfBirth: '',
    address: '',
    socialSecurityNumber: '',
    hireDate: '',
    contractType: '',
    salary: '',
    notes: '',
    assignedTables: '',
    location: '',
    availability: 'Available',
    schedule: '',
    role: ''
  });
  const [editEmployee, setEditEmployee] = useState({
    name: '',
    avatar: '',
    contact: '',
    userId: '',
    dateOfBirth: '',
    address: '',
    socialSecurityNumber: '',
    hireDate: '',
    fireDate: '',
    contractType: '',
    salary: '',
    status: 'Active',
    notes: '',
    assignedTables: '',
    location: '',
    availability: 'Available',
    schedule: '',
    role: ''
  });

  useEffect(() => {
    setOrders(getOrders());
    fetchEmployees();
    fetchUsers();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        if (data.length > 0 && !selectedEmployee) {
          setSelectedEmployee(data[0]); // Sélectionner le premier employé par défaut
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const employeeData = {
        ...newEmployee,
        assignedTables: newEmployee.assignedTables ? 
          newEmployee.assignedTables.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t)) : 
          []
      };

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        const addedEmployee = await response.json();
        setEmployees(prev => [...prev, addedEmployee]);
        setSelectedEmployee(addedEmployee);
        setShowAddEmployee(false);
        // Réinitialiser le formulaire
        setNewEmployee({
          name: '',
          avatar: '',
          contact: '',
          userId: '',
          dateOfBirth: '',
          address: '',
          socialSecurityNumber: '',
          hireDate: '',
          contractType: '',
          salary: '',
          notes: '',
          assignedTables: '',
          location: '',
          availability: 'Available',
          schedule: '',
          role: ''
        });
      } else {
        console.error('Error adding employee');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  // Fonction pour préparer l'édition d'un employé
  const handleStartEdit = () => {
    if (selectedEmployee) {
      // Fonction helper pour formater les dates pour les inputs date
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setEditEmployee({
        name: selectedEmployee.name,
        avatar: selectedEmployee.avatar || '',
        contact: selectedEmployee.contact || '',
        userId: selectedEmployee.userId || '',
        dateOfBirth: formatDateForInput(selectedEmployee.dateOfBirth),
        address: selectedEmployee.address || '',
        socialSecurityNumber: selectedEmployee.socialSecurityNumber || '',
        hireDate: formatDateForInput(selectedEmployee.hireDate),
        fireDate: formatDateForInput(selectedEmployee.fireDate),
        contractType: selectedEmployee.contractType || '',
        salary: selectedEmployee.salary || '',
        status: selectedEmployee.status || 'Active',
        notes: selectedEmployee.notes || '',
        assignedTables: selectedEmployee.assignedTables?.join(', ') || '',
        location: selectedEmployee.location || '',
        availability: selectedEmployee.availability || 'Available',
        schedule: selectedEmployee.schedule || '',
        role: selectedEmployee.role || ''
      });
      setShowEditEmployee(true);
    }
  };

  // Fonction pour éditer un employé
  const handleEditEmployee = async () => {
    try {
      const employeeData = {
        ...editEmployee,
        assignedTables: editEmployee.assignedTables ? 
          editEmployee.assignedTables.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t)) : 
          []
      };

      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        setSelectedEmployee(updatedEmployee);
        setShowEditEmployee(false);
      } else {
        console.error('Error editing employee');
      }
    } catch (error) {
      console.error('Error editing employee:', error);
    }
  };

  // Fonction pour supprimer un employé
  const handleDeleteEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
        setSelectedEmployee(null);
        setShowDeleteConfirm(false);
      } else {
        console.error('Error deleting employee');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        setSelectedEmployee(updatedEmployee);
        setShowStatusModal(false);
      } else {
        console.error('Error changing employee status');
      }
    } catch (error) {
      console.error('Error changing employee status:', error);
    }
  };

  const handleFireEmployee = async (fireDate) => {
    try {
      const response = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fireDate }),
      });

      if (response.ok) {
        const updatedEmployee = await response.json();
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        setSelectedEmployee(updatedEmployee);
        setShowFireModal(false);
      } else {
        console.error('Error firing employee');
      }
    } catch (error) {
      console.error('Error firing employee:', error);
    }
  };

  // Statistiques
  const total = orders.length;
  const byStatus = ORDER_STATUS.map(st => ({
    status: st,
    count: orders.filter(o => o.status === st).length
  }));
  // Ventes
  const dailySales = getTodaySales(orders);
  const hourlySales = getHourlySales(orders);
  const salesChange = "+15%"; // Simulation

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <span className="dashboard__header-title">Dashboard</span>
      </div>
      {/* Tabs */}
      <div className="dashboard__tabs">
        <div onClick={()=>setTab("Employees")} className={`dashboard__tab${tab==="Employees" ? ' dashboard__tab--active' : ''}`}>Employees</div>
        <div onClick={()=>setTab("Sales")} className={`dashboard__tab${tab==="Sales" ? ' dashboard__tab--active' : ''}`}>Sales</div>
      </div>
      {/* Employees tab */}
      {tab==="Employees" && (
        <>
          {/* Employee Selection */}
          {employees.length > 0 && (
            <div className="dashboard__employee-selector">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div className="dashboard__employee-title">Select Employee</div>
                <button 
                  onClick={() => setShowAddEmployee(true)}
                  style={{
                    background:'#007bff',
                    color:'white',
                    border:'none',
                    borderRadius:4,
                    padding:'6px 12px',
                    cursor:'pointer',
                    fontSize:12,
                    fontWeight:500
                  }}
                >
                  + Add Employee
                </button>
              </div>
              <select 
                value={selectedEmployee?.id || ''} 
                onChange={(e) => {
                  const emp = employees.find(emp => emp.id === parseInt(e.target.value));
                  setSelectedEmployee(emp);
                }}
                style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ddd',marginBottom:16}}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} - {emp.role}</option>
                ))}
              </select>
            </div>
          )}
          
          {employees.length === 0 && (
            <div style={{textAlign:'center',padding:40}}>
              <div style={{marginBottom:16}}>Aucun employé trouvé</div>
              <button 
                onClick={() => setShowAddEmployee(true)}
                style={{
                  background:'#007bff',
                  color:'white',
                  border:'none',
                  borderRadius:6,
                  padding:'10px 20px',
                  cursor:'pointer',
                  fontSize:14,
                  fontWeight:500
                }}
              >
                + Add First Employee
              </button>
            </div>
          )}
          
          {selectedEmployee ? (
            <div className="dashboard__employee">
              <div className="dashboard__employee-title">Employee Info</div>
              <div className="dashboard__employee-row">
                <img src={selectedEmployee.avatar} alt="avatar" className="dashboard__employee-avatar"/>
                <div>
                  <div className="dashboard__employee-name">{selectedEmployee.name}</div>
                  <div className="dashboard__employee-contact">Contact: {selectedEmployee.contact}</div>
                  {selectedEmployee.user && (
                    <div className="dashboard__employee-email">Email: {selectedEmployee.user.email}</div>
                  )}
                </div>
              </div>
              <div className="dashboard__employee-row">
                <div className="dashboard__employee-icon">📅</div>
                <div>
                  <b>Assigned Tables:</b> {selectedEmployee.assignedTables?.join(', ') || 'Aucune'}
                  <div className="dashboard__employee-location">Current Location: {selectedEmployee.location}</div>
                </div>
              </div>
              <div className="dashboard__employee-row">
                <div className="dashboard__employee-icon">🗓️</div>
                <div>
                  <b>Availability:</b> {selectedEmployee.availability}
                  <div className="dashboard__employee-schedule">Schedule: {selectedEmployee.schedule}</div>
                </div>
              </div>
              <div className="dashboard__employee-section">Employee Management</div>
              <div className="dashboard__employee-actions">
                <button onClick={()=>setShowAssign(true)} className="dashboard__button dashboard__button--assign">📋 Assign Tables <span className="dashboard__button-arrow">›</span></button>
                {/* <button onClick={()=>setShowChat(true)} className="dashboard__button dashboard__button--chat">💬 Chat <span className="dashboard__button-arrow">›</span></button> */}
                <button onClick={()=>setShowDirect(true)} className="dashboard__button dashboard__button--direct">📍 Direct to Location <span className="dashboard__button-arrow">›</span></button>
                <button onClick={handleStartEdit} className="dashboard__button dashboard__button--edit">✏️ Edit Employee <span className="dashboard__button-arrow">›</span></button>
                <button onClick={()=>setShowDeleteConfirm(true)} className="dashboard__button dashboard__button--delete">🗑️ Delete Employee <span className="dashboard__button-arrow">›</span></button>
                <button onClick={()=>setShowStatusModal(true)} className="dashboard__button dashboard__button--status">🔄 Change Status <span className="dashboard__button-arrow">›</span></button>
                <button onClick={()=>setShowFireModal(true)} className="dashboard__button dashboard__button--fire">🔴 Fire Employee <span className="dashboard__button-arrow">›</span></button>
              </div>
            </div>
          ) : (
            <div style={{textAlign:'center',padding:40}}>
              {employees.length === 0 ? 'Chargement des employés...' : 'Aucun employé sélectionné'}
            </div>
          )}
          
          {/* Assign Tables Modal */}
          {showAssign && selectedEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowAssign(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Assign Tables</div>
                <div className="dashboard__modal-desc">Select tables to assign to {selectedEmployee.name} :</div>
                <input type="text" placeholder="e.g. 1,2,3" defaultValue={selectedEmployee.assignedTables?.join(', ') || ''} className="dashboard__modal-input"/>
                <button onClick={()=>setShowAssign(false)} className="dashboard__modal-btn dashboard__modal-btn--save">Save</button>
              </div>
            </div>
          )}
          {/* Chat Modal */}
          {showChat && selectedEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowChat(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Chat with {selectedEmployee.name}</div>
                <textarea placeholder="Type your message..." className="dashboard__modal-input dashboard__modal-input--textarea"/>
                <button onClick={()=>setShowChat(false)} className="dashboard__modal-btn dashboard__modal-btn--send">Send</button>
              </div>
            </div>
          )}
          {/* Direct to Location Modal */}
          {showDirect && selectedEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowDirect(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Direct to Location</div>
                <div className="dashboard__modal-desc">Send directions to {selectedEmployee.name} for: <b>{selectedEmployee.location}</b></div>
                <button onClick={()=>setShowDirect(false)} className="dashboard__modal-btn dashboard__modal-btn--send">Send</button>
              </div>
            </div>
          )}
          {/* Add Employee Modal */}
          {showAddEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal" style={{maxWidth:400,maxHeight:'90vh',overflowY:'auto'}}>
                <button onClick={()=>setShowAddEmployee(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Add New Employee</div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Name *</label>
                  <input 
                    type="text" 
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({...prev, name: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Employee name"
                    required
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Avatar URL</label>
                  <input 
                    type="url" 
                    value={newEmployee.avatar}
                    onChange={(e) => setNewEmployee(prev => ({...prev, avatar: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Contact</label>
                  <input 
                    type="text" 
                    value={newEmployee.contact}
                    onChange={(e) => setNewEmployee(prev => ({...prev, contact: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Phone number or email"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Linked User</label>
                  <select 
                    value={newEmployee.userId}
                    onChange={(e) => setNewEmployee(prev => ({...prev, userId: e.target.value}))}
                    className="dashboard__modal-input"
                  >
                    <option value="">Select a user (optional)</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email} ({user.username || 'No username'}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Date of Birth</label>
                  <input 
                    type="date" 
                    value={newEmployee.dateOfBirth}
                    onChange={(e) => setNewEmployee(prev => ({...prev, dateOfBirth: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Date of Birth"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Address</label>
                  <input 
                    type="text" 
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee(prev => ({...prev, address: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Address"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Social Security Number</label>
                  <input 
                    type="text" 
                    value={newEmployee.socialSecurityNumber}
                    onChange={(e) => setNewEmployee(prev => ({...prev, socialSecurityNumber: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Social Security Number"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Hire Date</label>
                  <input 
                    type="date" 
                    value={newEmployee.hireDate}
                    onChange={(e) => setNewEmployee(prev => ({...prev, hireDate: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Hire Date"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Contract Type</label>
                  <select 
                    value={newEmployee.contractType}
                    onChange={(e) => setNewEmployee(prev => ({...prev, contractType: e.target.value}))}
                    className="dashboard__modal-input"
                  >
                    <option value="">Select contract type</option>
                    <option value="essai">Essai</option>
                    <option value="stage">Stage</option>
                    <option value="CDD">CDD</option>
                    <option value="CDI">CDI</option>
                    <option value="interim">Intérim</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Salary</label>
                  <input 
                    type="number" 
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee(prev => ({...prev, salary: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Salary"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Notes</label>
                  <textarea 
                    value={newEmployee.notes}
                    onChange={(e) => setNewEmployee(prev => ({...prev, notes: e.target.value}))}
                    className="dashboard__modal-input dashboard__modal-input--textarea"
                    placeholder="Notes"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Role *</label>
                  <select 
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee(prev => ({...prev, role: e.target.value}))}
                    className="dashboard__modal-input"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="Serveur">Serveur</option>
                    <option value="Serveuse">Serveuse</option>
                    <option value="Barman">Barman</option>
                    <option value="Chef">Chef</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                
                <div style={{display:'flex',gap:8}}>
                  <button 
                    onClick={()=>setShowAddEmployee(false)} 
                    style={{
                      flex:1,
                      background:'#f4f4f4',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor:'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddEmployee}
                    disabled={!newEmployee.name || !newEmployee.role}
                    style={{
                      flex:1,
                      background: newEmployee.name && newEmployee.role ? '#007bff' : '#ccc',
                      color:'white',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor: newEmployee.name && newEmployee.role ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Add Employee
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Edit Employee Modal */}
          {showEditEmployee && selectedEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal" style={{maxWidth:400,maxHeight:'90vh',overflowY:'auto'}}>
                <button onClick={()=>setShowEditEmployee(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Edit Employee</div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Name *</label>
                  <input 
                    type="text" 
                    value={editEmployee.name}
                    onChange={(e) => setEditEmployee(prev => ({...prev, name: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Employee name"
                    required
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Avatar URL</label>
                  <input 
                    type="url" 
                    value={editEmployee.avatar}
                    onChange={(e) => setEditEmployee(prev => ({...prev, avatar: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Phone</label>
                  <input 
                    type="text" 
                    value={editEmployee.contact}
                    onChange={(e) => setEditEmployee(prev => ({...prev, contact: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Phone number"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Linked User</label>
                  <select 
                    value={editEmployee.userId}
                    onChange={(e) => setEditEmployee(prev => ({...prev, userId: e.target.value}))}
                    className="dashboard__modal-input"
                  >
                    <option value="">Select a user (optional)</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email} ({user.username || 'No username'}) - {user.role}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Date of Birth</label>
                  <input 
                    type="date" 
                    value={editEmployee.dateOfBirth}
                    onChange={(e) => setEditEmployee(prev => ({...prev, dateOfBirth: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Date of Birth"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Address</label>
                  <input 
                    type="text" 
                    value={editEmployee.address}
                    onChange={(e) => setEditEmployee(prev => ({...prev, address: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Address"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Social Security Number</label>
                  <input 
                    type="text" 
                    value={editEmployee.socialSecurityNumber}
                    onChange={(e) => setEditEmployee(prev => ({...prev, socialSecurityNumber: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Social Security Number"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Hire Date</label>
                  <input 
                    type="date" 
                    value={editEmployee.hireDate}
                    onChange={(e) => setEditEmployee(prev => ({...prev, hireDate: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Hire Date"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Fire Date</label>
                  <input 
                    type="date" 
                    value={editEmployee.fireDate}
                    onChange={(e) => setEditEmployee(prev => ({...prev, fireDate: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Fire Date"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Contract Type</label>
                  <select 
                    value={editEmployee.contractType}
                    onChange={(e) => setEditEmployee(prev => ({...prev, contractType: e.target.value}))}
                    className="dashboard__modal-input"
                  >
                    <option value="">Select contract type</option>
                    <option value="essai">Essai</option>
                    <option value="stage">Stage</option>
                    <option value="CDD">CDD</option>
                    <option value="CDI">CDI</option>
                    <option value="interim">Intérim</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Salary</label>
                  <input 
                    type="number" 
                    value={editEmployee.salary}
                    onChange={(e) => setEditEmployee(prev => ({...prev, salary: e.target.value}))}
                    className="dashboard__modal-input"
                    placeholder="Salary"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Status</label>
                  <select 
                    value={editEmployee.status}
                    onChange={(e) => setEditEmployee(prev => ({...prev, status: e.target.value}))}
                    className="dashboard__modal-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Notes</label>
                  <textarea 
                    value={editEmployee.notes}
                    onChange={(e) => setEditEmployee(prev => ({...prev, notes: e.target.value}))}
                    className="dashboard__modal-input dashboard__modal-input--textarea"
                    placeholder="Notes"
                  />
                </div>
                
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Role *</label>
                  <select 
                    value={editEmployee.role}
                    onChange={(e) => setEditEmployee(prev => ({...prev, role: e.target.value}))}
                    className="dashboard__modal-input"
                    required
                  >
                    <option value="">Select role</option>
                    <option value="Serveur">Serveur</option>
                    <option value="Serveuse">Serveuse</option>
                    <option value="Barman">Barman</option>
                    <option value="Chef">Chef</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                
                <div style={{display:'flex',gap:8}}>
                  <button 
                    onClick={()=>setShowEditEmployee(false)} 
                    style={{
                      flex:1,
                      background:'#f4f4f4',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor:'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleEditEmployee}
                    disabled={!editEmployee.name || !editEmployee.role}
                    style={{
                      flex:1,
                      background: editEmployee.name && editEmployee.role ? '#007bff' : '#ccc',
                      color:'white',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor: editEmployee.name && editEmployee.role ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirm Modal */}
          {showDeleteConfirm && selectedEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowDeleteConfirm(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Delete Employee</div>
                <div className="dashboard__modal-desc">Are you sure you want to delete {selectedEmployee.name}?</div>
                <div style={{display:'flex',gap:8}}>
                  <button 
                    onClick={()=>setShowDeleteConfirm(false)} 
                    style={{
                      flex:1,
                      background:'#f4f4f4',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor:'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteEmployee}
                    style={{
                      flex:1,
                      background:'#dc3545',
                      color:'white',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor:'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Status Change Modal */}
          {showStatusModal && selectedEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowStatusModal(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Change Employee Status</div>
                <div className="dashboard__modal-desc">
                  Change status for {selectedEmployee.name}
                  <br />
                  Current status: <strong>{selectedEmployee.status}</strong>
                </div>
                <div style={{margin: '20px 0'}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>New Status</label>
                  <select 
                    value={selectedEmployee.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="dashboard__modal-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button 
                    onClick={()=>setShowStatusModal(false)} 
                    style={{
                      flex:1,
                      background:'#f4f4f4',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor:'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Fire Employee Modal */}
          {showFireModal && selectedEmployee && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowFireModal(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Fire Employee</div>
                <div className="dashboard__modal-desc">
                  Set fire date for {selectedEmployee.name}
                  {selectedEmployee.fireDate && <><br />Current fire date: <strong>{new Date(selectedEmployee.fireDate).toLocaleDateString()}</strong></>}
                </div>
                <div style={{margin: '20px 0'}}>
                  <label style={{display:'block',marginBottom:4,fontWeight:500}}>Fire Date</label>
                  <input 
                    type="date" 
                    defaultValue={selectedEmployee.fireDate ? new Date(selectedEmployee.fireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleFireEmployee(e.target.value)}
                    className="dashboard__modal-input"
                  />
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button 
                    onClick={()=>setShowFireModal(false)} 
                    style={{
                      flex:1,
                      background:'#f4f4f4',
                      border:'none',
                      borderRadius:6,
                      padding:'10px',
                      cursor:'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Sales tab */}
      {tab==="Sales" && (
        <div className="dashboard__sales">
          <div className="dashboard__sales-title">Sales Statistics</div>
          <div className="dashboard__sales-tabs">
            <button className="dashboard__sales-tab dashboard__sales-tab--active">Daily</button>
            <button className="dashboard__sales-tab">Weekly</button>
            <button className="dashboard__sales-tab">Monthly</button>
            <button className="dashboard__sales-tab">Historical</button>
          </div>
          <div className="dashboard__sales-total">${dailySales.toLocaleString()}</div>
          <div className="dashboard__sales-change">Today {salesChange}</div>
          {/* Bar chart simple */}
          <div className="dashboard__sales-bars">
            {getHourlySales(orders).map((v,i)=>(
              <div key={i} className="dashboard__sales-bar-col">
                <div className="dashboard__sales-bar" style={{height:Math.max(10,v/10)}}></div>
                <span className="dashboard__sales-bar-label">{10+i}AM</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Bottom nav (factice) */}
      {/* <div className="dashboard__nav">
        <div className="dashboard__nav-item">
          <span>🏠</span>
          <span className="dashboard__nav-label">Home</span>
        </div>
        <div className="dashboard__nav-item">
          <span>🧾</span>
          <span className="dashboard__nav-label">Orders</span>
        </div>
        <div className="dashboard__nav-item">
          <span>🍣</span>
          <span className="dashboard__nav-label">Menu</span>
        </div>
        <div className="dashboard__nav-item dashboard__nav-item--active">
          <span>📊</span>
          <span className="dashboard__nav-label">Dashboard</span>
        </div>
        <div className="dashboard__nav-item">
          <span>👤</span>
          <span className="dashboard__nav-label">Account</span>
        </div>
      </div> */}
    </div>
  );
}
