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

const EMPLOYEE = {
  name: "Ethan Carter",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  contact: "555–123–4567",
  assignedTables: [1, 2, 3],
  location: "Dining Area",
  availability: "Available",
  schedule: "Mon–Fri, 10 AM - 6 PM"
};


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
  const [tab, setTab] = useState("Employees");
  const [showAssign, setShowAssign] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDirect, setShowDirect] = useState(false);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

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
          <div className="dashboard__employee">
            <div className="dashboard__employee-title">Employee Info</div>
            <div className="dashboard__employee-row">
              <img src={EMPLOYEE.avatar} alt="avatar" className="dashboard__employee-avatar"/>
              <div>
                <div className="dashboard__employee-name">{EMPLOYEE.name}</div>
                <div className="dashboard__employee-contact">Contact: {EMPLOYEE.contact}</div>
              </div>
            </div>
            <div className="dashboard__employee-row">
              <div className="dashboard__employee-icon">📅</div>
              <div>
                <b>Assigned Tables:</b> {EMPLOYEE.assignedTables.join(', ')}
                <div className="dashboard__employee-location">Current Location: {EMPLOYEE.location}</div>
              </div>
            </div>
            <div className="dashboard__employee-row">
              <div className="dashboard__employee-icon">🗓️</div>
              <div>
                <b>Availability:</b> {EMPLOYEE.availability}
                <div className="dashboard__employee-schedule">Schedule: {EMPLOYEE.schedule}</div>
              </div>
            </div>
            <div className="dashboard__employee-section">Employee Management</div>
            <div className="dashboard__employee-actions">
              <button onClick={()=>setShowAssign(true)} className="dashboard__button dashboard__button--assign">📋 Assign Tables <span className="dashboard__button-arrow">›</span></button>
              <button onClick={()=>setShowChat(true)} className="dashboard__button dashboard__button--chat">💬 Chat <span className="dashboard__button-arrow">›</span></button>
              <button onClick={()=>setShowDirect(true)} className="dashboard__button dashboard__button--direct">📍 Direct to Location <span className="dashboard__button-arrow">›</span></button>
            </div>
          </div>
          {/* Assign Tables Modal */}
          {showAssign && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowAssign(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Assign Tables</div>
                <div className="dashboard__modal-desc">Select tables to assign to {EMPLOYEE.name} :</div>
                <input type="text" placeholder="e.g. 1,2,3" defaultValue={EMPLOYEE.assignedTables.join(', ')} className="dashboard__modal-input"/>
                <button onClick={()=>setShowAssign(false)} className="dashboard__modal-btn dashboard__modal-btn--save">Save</button>
              </div>
            </div>
          )}
          {/* Chat Modal */}
          {showChat && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowChat(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Chat with {EMPLOYEE.name}</div>
                <textarea placeholder="Type your message..." className="dashboard__modal-input dashboard__modal-input--textarea"/>
                <button onClick={()=>setShowChat(false)} className="dashboard__modal-btn dashboard__modal-btn--send">Send</button>
              </div>
            </div>
          )}
          {/* Direct to Location Modal */}
          {showDirect && (
            <div className="dashboard__modal-bg">
              <div className="dashboard__modal">
                <button onClick={()=>setShowDirect(false)} className="dashboard__modal-close">×</button>
                <div className="dashboard__modal-title">Direct to Location</div>
                <div className="dashboard__modal-desc">Send directions to {EMPLOYEE.name} for: <b>{EMPLOYEE.location}</b></div>
                <button onClick={()=>setShowDirect(false)} className="dashboard__modal-btn dashboard__modal-btn--send">Send</button>
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
      <div className="dashboard__nav">
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
      </div>
    </div>
  );
}
