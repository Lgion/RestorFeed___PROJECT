"use client"

import { useState, useEffect, useRef } from "react";
import { UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useUser,
  useAuth
} from '@clerk/nextjs'
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ClipboardList, LayoutDashboard, Users, ShieldCheck, Truck, Menu, ShoppingCart, Filter } from "lucide-react";
import { getAppDataKey, setAppDataKey } from "../utils/localStorageApp";
import RoleGuard from "./RoleGuard";
import RoleSwitcher from "./RoleSwitcher";
import CartHover from "./CartHover";

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
    href: "/admin",
    label: "Administration complète",
  },
  {
    minRole: "admin",
    icon: Truck,
    href: "/suppliers",
    label: "Gestion Fournisseurs",
  },
];

export default function ActionHeader({ handleValidate, isLoading, cart = [], onFilterToggle, filterVisible = false }) {
  const [hovered, setHovered] = useState(null);
  const [shrink, setShrink] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  
  // États pour les toggles mobile
  const [actionsVisible, setActionsVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  
  const searchParams = useSearchParams();
  const lastScroll = useRef(0);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  
  // Force le re-render lors des changements d'authentification
  const [authState, setAuthState] = useState({ isLoaded, isSignedIn });
  
  useEffect(() => {
    setAuthState({ isLoaded, isSignedIn });
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    let tableNumber = getAppDataKey('tableNumber');
    if (typeof window !== 'undefined') {
      if (!tableNumber) {
        tableNumber = searchParams.get("tableNumber") || String(Math.floor(1 + Math.random() * 10)); // 2 chiffres
        setAppDataKey('tableNumber', tableNumber);
      }
      try {
        setTableNumber(tableNumber ?? '');
      } catch {
        setTableNumber('');
      }
    }
  }, [authState]); // Ajout de authState comme dépendance

  const handleTableChange = (e) => {
    const value = e.target.value;
    setTableNumber(value);
    try {
      const restOrFeed = JSON.parse(localStorage.getItem('restOrFeed')) || {};
      localStorage.setItem('restOrFeed', JSON.stringify({ ...restOrFeed, tableNumber: value }));
    } catch {
      localStorage.setItem('restOrFeed', JSON.stringify({ tableNumber: value }));
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const y = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setShrink(prev => {
            const newShrink = y > 40;
            return newShrink;
          });
          if (y > 80) {
            setHidden(prev => {
              return false;
            });
          } else {
            const shouldHide = y > 40 && y > lastScroll.current;
            setHidden(prev => {
              return shouldHide;
            });
          }
          lastScroll.current = y;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`actionHeader${shrink ? ' actionHeader--shrink' : ''}${hidden ? ' actionHeader--hide' : ''}`}>
      {/* Mobile toggle buttons */}
      <div className="actionHeader__mobile-toggles">
        <button 
          className={`actionHeader__toggle-btn${actionsVisible ? ' actionHeader__toggle-btn--active' : ''}`}
          onClick={() => setActionsVisible(!actionsVisible)}
          aria-label="Toggle actions menu"
        >
          <Menu size={20} />
        </button>
        
        <button 
          className={`actionHeader__toggle-btn${filterVisible ? ' actionHeader__toggle-btn--active' : ''}`}
          onClick={onFilterToggle}
          aria-label="Toggle category filter"
        >
          <Filter size={20} />
        </button>
        
        <button 
          className={`actionHeader__toggle-btn${cartVisible ? ' actionHeader__toggle-btn--active' : ''}`}
          onClick={() => setCartVisible(!cartVisible)}
          aria-label="Toggle cart"
        >
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <span className="actionHeader__toggle-btn-badge">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      <h1 className="menuLayout__title">Menu Digital - Sushi</h1>

      <div className={`actionHeader__actions${actionsVisible ? ' actionHeader__actions--mobile-visible' : ''}`}>
      {actions.map(({ minRole, icon: Icon, href, label }, idx) => (
        <RoleGuard key={label} minRole={minRole}>
          <Link href={href} legacyBehavior>
            <a
              className={`actionHeader__action${hovered === idx ? ' actionHeader__action--hovered' : ''}`}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              onMouseDown={() => setHovered(idx)}
              onMouseUp={() => setHovered(null)}
              onClick={() => setActionsVisible(false)} // Fermer le menu mobile après clic
            >
              <Icon size={28} color="#c0392b" />
              {hovered === idx && (
                <span>{label}</span>
              )}
            </a>
          </Link>
        </RoleGuard>
      ))}
      <RoleSwitcher />
      </div>
      
      <div className={`actionHeader__cart${cartVisible ? ' actionHeader__cart--mobile-visible' : ''}`}>
        <CartHover handleValidate={handleValidate} isLoading={isLoading} />
      </div>
      
      <div>
        {user && <RoleGuard minRole="employee">
          <select
            value={tableNumber}
            onChange={handleTableChange}
            className="actionHeader__table"
          >
            <option value="">Choisir la table du client</option>
            {Array.from({ length: process.env.NEXT_PUBLIC_NOMBRE_TABLES}).map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </RoleGuard>}
        <RoleGuard minRole="public">
          <b className="actionHeader__tableActive">#{tableNumber}</b>
        </RoleGuard>
      </div>
      
      <div className="actionHeader__clerk">
        <SignedOut>
          <SignInButton className="actionHeader__clerk-btn actionHeader__clerk-btn--signin" />
          <SignUpButton className="actionHeader__clerk-btn actionHeader__clerk-btn--signup" />
        </SignedOut>
        <SignedIn>
          <UserButton className="actionHeader__clerk-btn actionHeader__clerk-btn--user" />
        </SignedIn>
      </div>
    </header>
  );
}
