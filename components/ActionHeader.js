"use client"

import { useState } from "react";
import { Tooltip } from "react-tooltip";
import { ClipboardList, LayoutDashboard, Users, ShieldCheck, Truck } from "lucide-react";
import RoleGuard from "./RoleGuard";
import RoleSwitcher from "./RoleSwitcher";
import Link from "next/link";

const actions = [
  {
    minRole: "employee",
    icon: ClipboardList,
    href: "/menu/orders",
    label: "Voir les commandes en cours",
  },
  {
    minRole: "manager",
    icon: LayoutDashboard,
    href: "/dashboard",
    label: "Dashboard Manager",
  },
  {
    minRole: "manager",
    icon: Users,
    href: "/menu/employees",
    label: "Gestion Employés",
  },
  {
    minRole: "admin",
    icon: ShieldCheck,
    href: "/menu/admin",
    label: "Administration complète",
  },
  {
    minRole: "admin",
    icon: Truck,
    href: "/suppliers",
    label: "Gestion Fournisseurs",
  },
];

import CartHover from "./CartHover";

export default function ActionHeader() {
  const [hovered, setHovered] = useState(null);
  return (
    <header style={{display: 'flex', gap: 24, alignItems: 'center', padding: '16px 0', justifyContent: 'center', position: 'relative'}}>
      <div style={{display: 'flex', gap: 24, alignItems: 'center', flex: 1, justifyContent: 'center'}}>
      {actions.map(({ minRole, icon: Icon, href, label }, idx) => (
        <RoleGuard key={label} minRole={minRole}>
          <Link href={href} legacyBehavior>
            <a
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              onMouseDown={() => setHovered(idx)}
              onMouseUp={() => setHovered(null)}
              style={{
                background: hovered === idx ? '#f4f4f4' : 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: hovered === idx ? '0 2px 8px rgba(0,0,0,0.07)' : 'none',
                transition: 'all 0.14s',
                minWidth: 44,
                minHeight: 44
              }}
            >
              <Icon size={28} color="#c0392b" />
              {hovered === idx && (
                <span style={{
                  position: 'absolute',
                  bottom: -38,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#222',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 14,
                  whiteSpace: 'nowrap',
                  zIndex: 100,
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.13)'
                }}>{label}</span>
              )}
            </a>
          </Link>
        </RoleGuard>
      ))}
      <RoleSwitcher />
      </div>
      <div style={{position: 'absolute', right: 24, top: 10}}>
        <CartHover />
      </div>
    </header>
  );
}
