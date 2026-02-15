import { SideNavItem } from "@/types/types";
import {
  IconHome,
  IconUsers,
} from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: <IconHome width="24" height="24" />,
  },
  {
    title: "Manage Farmers",
    path: "/admin/manage-farmers",
    icon: <IconUsers width="24" height="24" />,
  },
];
