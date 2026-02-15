import { SideNavItem } from "@/types/types";
import { IconHome, IconShoppingCart, IconReceipt } from "@tabler/icons-react";

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: "Dashboard",
    path: "/user/dashboard",
    icon: <IconHome width="24" height="24" />,
  },
  {
    title: "Browse Products",
    path: "/user/browse",
    icon: <IconShoppingCart width="24" height="24" />,
  },
  {
    title: "My Orders",
    path: "/user/orders",
    icon: <IconReceipt width="24" height="24" />,
  },
];
