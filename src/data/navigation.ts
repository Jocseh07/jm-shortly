export type NavigationLink = {
  label: string;
  href: string;
};

export const publicNavigation: NavigationLink[] = [
  // {
  //   label: "Features",
  //   href: "#",
  // },
];

export const authenticatedNavigation: NavigationLink[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
];
