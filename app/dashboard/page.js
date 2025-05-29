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
    <div style={{maxWidth:400,margin:"0 auto",padding:0,fontFamily:'Inter,sans-serif',background:'#fff',minHeight:'100vh'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:54,borderBottom:'1px solid #eee',position:'sticky',top:0,background:'#fff',zIndex:10}}>
        <span style={{fontSize:20,fontWeight:600}}>Dashboard</span>
      </div>
      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'1px solid #eee',marginBottom:8}}>
        <div onClick={()=>setTab("Employees")} style={{flex:1,padding:12,cursor:'pointer',fontWeight:500,borderBottom:tab==="Employees"?'2px solid #111':'none'}}>Employees</div>
        <div onClick={()=>setTab("Sales")} style={{flex:1,padding:12,cursor:'pointer',fontWeight:500,borderBottom:tab==="Sales"?'2px solid #111':'none'}}>Sales</div>
      </div>
      {/* Employees tab */}
      {tab==="Employees" && (
        <>
          <div style={{padding:'0 20px'}}>
            <div style={{fontWeight:600,fontSize:16,marginBottom:10,marginTop:12}}>Employee Info</div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
              <img src={EMPLOYEE.avatar} alt="avatar" style={{width:48,height:48,borderRadius:'50%'}}/>
              <div>
                <div style={{fontWeight:500}}>{EMPLOYEE.name}</div>
                <div style={{fontSize:13,color:'#888'}}>Contact: {EMPLOYEE.contact}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
              <div style={{fontSize:18}}>📅</div>
              <div>
                <b>Assigned Tables:</b> {EMPLOYEE.assignedTables.join(', ')}
                <div style={{fontSize:13,color:'#888'}}>Current Location: {EMPLOYEE.location}</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{fontSize:18}}>🗓️</div>
              <div>
                <b>Availability:</b> {EMPLOYEE.availability}
                <div style={{fontSize:13,color:'#888'}}>Schedule: {EMPLOYEE.schedule}</div>
              </div>
            </div>
            <div style={{fontWeight:600,marginBottom:10}}>Employee Management</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:18}}>
              <button onClick={()=>setShowAssign(true)} style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'#f4f4f4',border:'none',borderRadius:8,fontWeight:500,cursor:'pointer'}}>📋 Assign Tables <span style={{marginLeft:'auto'}}>›</span></button>
              <button onClick={()=>setShowChat(true)} style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'#f4f4f4',border:'none',borderRadius:8,fontWeight:500,cursor:'pointer'}}>💬 Chat <span style={{marginLeft:'auto'}}>›</span></button>
              <button onClick={()=>setShowDirect(true)} style={{display:'flex',alignItems:'center',gap:10,padding:12,background:'#f4f4f4',border:'none',borderRadius:8,fontWeight:500,cursor:'pointer'}}>📍 Direct to Location <span style={{marginLeft:'auto'}}>›</span></button>
            </div>
          </div>
          {/* Assign Tables Modal */}
          {showAssign && (
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
              <div style={{background:'#fff',borderRadius:16,padding:28,minWidth:260,boxShadow:'0 4px 24px #0002',position:'relative'}}>
                <button onClick={()=>setShowAssign(false)} style={{position:'absolute',top:10,right:10,border:'none',background:'none',fontSize:22,cursor:'pointer'}}>×</button>
                <div style={{fontWeight:600,marginBottom:12}}>Assign Tables</div>
                <div style={{marginBottom:10}}>Select tables to assign to {EMPLOYEE.name} :</div>
                <input type="text" placeholder="e.g. 1,2,3" defaultValue={EMPLOYEE.assignedTables.join(', ')} style={{padding:7,width:'100%',marginBottom:12,border:'1px solid #ccc',borderRadius:6}}/>
                <button onClick={()=>setShowAssign(false)} style={{background:'#111',color:'#fff',padding:'8px 18px',border:'none',borderRadius:6,fontWeight:500,width:'100%'}}>Save</button>
              </div>
            </div>
          )}
          {/* Chat Modal */}
          {showChat && (
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
              <div style={{background:'#fff',borderRadius:16,padding:28,minWidth:260,boxShadow:'0 4px 24px #0002',position:'relative'}}>
                <button onClick={()=>setShowChat(false)} style={{position:'absolute',top:10,right:10,border:'none',background:'none',fontSize:22,cursor:'pointer'}}>×</button>
                <div style={{fontWeight:600,marginBottom:12}}>Chat with {EMPLOYEE.name}</div>
                <textarea placeholder="Type your message..." style={{width:'100%',height:60,padding:7,marginBottom:12,border:'1px solid #ccc',borderRadius:6}}/>
                <button onClick={()=>setShowChat(false)} style={{background:'#111',color:'#fff',padding:'8px 18px',border:'none',borderRadius:6,fontWeight:500,width:'100%'}}>Send</button>
              </div>
            </div>
          )}
          {/* Direct to Location Modal */}
          {showDirect && (
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.15)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
              <div style={{background:'#fff',borderRadius:16,padding:28,minWidth:260,boxShadow:'0 4px 24px #0002',position:'relative'}}>
                <button onClick={()=>setShowDirect(false)} style={{position:'absolute',top:10,right:10,border:'none',background:'none',fontSize:22,cursor:'pointer'}}>×</button>
                <div style={{fontWeight:600,marginBottom:12}}>Direct to Location</div>
                <div style={{marginBottom:10}}>Send directions to {EMPLOYEE.name} for: <b>{EMPLOYEE.location}</b></div>
                <button onClick={()=>setShowDirect(false)} style={{background:'#111',color:'#fff',padding:'8px 18px',border:'none',borderRadius:6,fontWeight:500,width:'100%'}}>Send</button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Sales tab */}
      {tab==="Sales" && (
        <div style={{padding:'0 20px'}}>
          <div style={{fontWeight:600,fontSize:16,marginBottom:10,marginTop:12}}>Sales Statistics</div>
          <div style={{display:'flex',gap:8,marginBottom:18}}>
            <button style={{padding:'6px 14px',borderRadius:16,border:'none',background:'#eee',fontWeight:500,marginRight:4}}>Daily</button>
            <button style={{padding:'6px 14px',borderRadius:16,border:'none',background:'#fff',fontWeight:500,marginRight:4}}>Weekly</button>
            <button style={{padding:'6px 14px',borderRadius:16,border:'none',background:'#fff',fontWeight:500,marginRight:4}}>Monthly</button>
            <button style={{padding:'6px 14px',borderRadius:16,border:'none',background:'#fff',fontWeight:500}}>Historical</button>
          </div>
          <div style={{fontSize:32,fontWeight:600,marginBottom:4}}>${dailySales.toLocaleString()}</div>
          <div style={{color:'#2ecc40',fontWeight:500,marginBottom:10}}>Today {salesChange}</div>
          {/* Bar chart simple */}
          <div style={{display:'flex',alignItems:'end',height:90,gap:8,marginBottom:14}}>
            {getHourlySales(orders).map((v,i)=>(
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{height:Math.max(10,v/10),width:18,background:'#ddd',borderRadius:6,marginBottom:4}}></div>
                <span style={{fontSize:12,color:'#888'}}>{10+i}AM</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Bottom nav (factice) */}
      <div style={{position:'fixed',bottom:0,left:0,width:'100vw',background:'#fff',borderTop:'1px solid #eee',display:'flex',justifyContent:'space-around',padding:'6px 0',zIndex:100}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:13,color:'#888'}}>
          <span>🏠</span>
          <span style={{fontSize:12}}>Home</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:13,color:'#888'}}>
          <span>🧾</span>
          <span style={{fontSize:12}}>Orders</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:13,color:'#888'}}>
          <span>🍣</span>
          <span style={{fontSize:12}}>Menu</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:13,color:'#111',fontWeight:600}}>
          <span>📊</span>
          <span style={{fontSize:12}}>Dashboard</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontSize:13,color:'#888'}}>
          <span>👤</span>
          <span style={{fontSize:12}}>Account</span>
        </div>
      </div>
    </div>
  );
}
