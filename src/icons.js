// ============================================================
//  ICONS · Map de iconKey (string) → componente Lucide React
//  El JSON del cliente usa strings; aquí se resuelven a componentes
// ============================================================
import {
  AlertOctagon, ShieldAlert, ShieldCheck, FileText, ShoppingCart,
  CreditCard, Gavel, Calculator, DollarSign, Package, Megaphone,
  Globe, Cog, Users, Target, Box, UserCheck, Heart, Server,
  TrendingUp, Briefcase, Truck, Factory, Building, Layers,
  Activity, BarChart3, PieChart, LineChart, Wrench, Hammer,
  Lock, Key, Eye, Star, Award, Compass, Map, Network, GitBranch,
} from 'lucide-react';

const ICON_MAP = {
  AlertOctagon, ShieldAlert, ShieldCheck, FileText, ShoppingCart,
  CreditCard, Gavel, Calculator, DollarSign, Package, Megaphone,
  Globe, Cog, Users, Target, Box, UserCheck, Heart, Server,
  TrendingUp, Briefcase, Truck, Factory, Building, Layers,
  Activity, BarChart3, PieChart, LineChart, Wrench, Hammer,
  Lock, Key, Eye, Star, Award, Compass, Map, Network, GitBranch,
};

/**
 * Resuelve un iconKey (string del JSON) a un componente Lucide.
 * Si no existe, devuelve ShieldAlert como fallback.
 */
export const getIcon = (iconKey) => ICON_MAP[iconKey] || ShieldAlert;

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
