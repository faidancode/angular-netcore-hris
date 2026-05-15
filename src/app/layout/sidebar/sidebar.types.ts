export interface NavItem {
    label: string;
    route?: string;
    icon?: any; // Using any for now to support Lucide icon components
    permission?: string;
    children?: NavItem[];
    expanded?: boolean;
}