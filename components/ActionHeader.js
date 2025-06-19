"use client"

import { useState, useEffect, useRef } from "react";
import { UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
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

import CartHover from "./CartHover";

export default function ActionHeader({ handleValidate, isLoading }) {
  const [hovered, setHovered] = useState(null);
  const [shrink, setShrink] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const y = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // console.log('[ActionHeader] scrollY:', y, 'lastScroll:', lastScroll.current, 'shrink:', shrink, 'hidden:', hidden);
          setShrink(prev => {
            const newShrink = y > 40;
            // if (prev !== newShrink) console.log('[ActionHeader] setShrink:', newShrink);
            return newShrink;
          });
          // Le header ne disparaît que si on scrolle vers le bas ET qu’on est sous 80px
          if (y > 80) {
            setHidden(prev => {
              // if (prev !== false) console.log('[ActionHeader] setHidden: false (y > 80)');
              return false;
            });
          } else {
            const shouldHide = y > 40 && y > lastScroll.current;
            setHidden(prev => {
              // if (prev !== shouldHide) console.log('[ActionHeader] setHidden:', shouldHide, '(y <= 80)');
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
      <div className="actionHeader__actions">
      {actions.map(({ minRole, icon: Icon, href, label }, idx) => (
        <RoleGuard key={label} minRole={minRole}>
          <Link href={href} legacyBehavior>
            <a
              className={`actionHeader__action${hovered === idx ? ' actionHeader__action--hovered' : ''}`}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              onMouseDown={() => setHovered(idx)}
              onMouseUp={() => setHovered(null)}
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
      <div className="actionHeader__cart">
        <CartHover handleValidate={handleValidate} isLoading={isLoading} />
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
