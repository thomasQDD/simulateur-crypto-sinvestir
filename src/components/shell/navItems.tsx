import type { ReactNode } from "react";
import {
  DashboardIcon,
  ChartIcon,
  CompareIcon,
  BookmarkIcon,
  GiftIcon,
} from "@/components/ui/icons";

export interface NavItem {
  label: string;
  icon: ReactNode;
  active?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", icon: <DashboardIcon /> },
  { label: "Les simulateurs", icon: <ChartIcon />, active: true },
  { label: "Les comparateurs", icon: <CompareIcon /> },
  { label: "Mes simulations", icon: <BookmarkIcon /> },
  { label: "Formation offerte", icon: <GiftIcon /> },
];
