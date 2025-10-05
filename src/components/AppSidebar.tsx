import { useState } from "react";
import { Home, User, FileText, Calendar, Upload, Download, Shield, Settings, Bell, LogOut, Building2, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
interface AppSidebarProps {
  language: 'bn' | 'en';
  onNavigate: (section: string) => void;
}
export function AppSidebar({
  language,
  onNavigate
}: AppSidebarProps) {
  const {
    state
  } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [toolsOpen, setToolsOpen] = useState(true);
  const mainMenuItems = [{
    title: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    url: '/',
    icon: Home,
    section: 'dashboard'
  }, 
  // {
  //   title: language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Info',
  //   url: '/personal',
  //   icon: User,
  //   section: 'personal'
  // }
  // , 
  {
    title: language === 'bn' ? 'দাপ্তরিক তথ্যাবলি' : 'Office Information',
    url: '/office-information',
    icon: Building2,
    section: 'office-information'
  }, 
  // {
  //   title: language === 'bn' ? 'পেশাগত তথ্য' : 'Professional Data',
  //   url: '/professional',
  //   icon: Building2,
  //   section: 'professional'
  // }, 
  // {
  //   title: language === 'bn' ? 'নথিপত্র' : 'Documents',
  //   url: '/documents',
  //   icon: FileText,
  //   section: 'documents'
  // }, {
  //   title: language === 'bn' ? 'ছুটির আবেদন' : 'Leave Application',
  //   url: '/leave',
  //   icon: Calendar,
  //   section: 'leave'
  // }
];
  const toolsMenuItems = [{
    title: language === 'bn' ? 'আপলোড' : 'Upload',
    url: '/upload',
    icon: Upload,
    section: 'upload'
  }, {
    title: language === 'bn' ? 'ডাউনলোড' : 'Download',
    url: '/download',
    icon: Download,
    section: 'download'
  }, {
    title: language === 'bn' ? 'নোটিফিকেশন' : 'Notifications',
    url: '/notifications',
    icon: Bell,
    section: 'notifications'
  }];
  const settingsMenuItems = [{
    title: language === 'bn' ? 'নিরাপত্তা' : 'Security',
    url: '/security',
    icon: Shield,
    section: 'security'
  }, {
    title: language === 'bn' ? 'সেটিংস' : 'Settings',
    url: '/settings',
    icon: Settings,
    section: 'settings'
  }];
  const isActive = (section: string) => {
    if (section === 'dashboard') return currentPath === '/';
    return currentPath.includes(section);
  };
  const getMenuButtonClass = (section: string) => {
    return isActive(section) ? "bg-primary text-primary-foreground font-medium shadow-sm" : "hover:bg-accent hover:text-accent-foreground";
  };
  const employeeData = {
    name: language === 'bn' ? 'মোহাম্মদ রহিম উদ্দিন' : 'Mohammad Rahim Uddin',
    employeeId: 'EMP-2024-0158',
    designation: language === 'bn' ? 'সহকারী প্রোগ্রামার' : 'Assistant Programmer'
  };
  return <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-border bg-card`} collapsible="icon">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed ? <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-card-foreground truncate">
                {language === 'bn' ? 'ই-চাকরি বৃত্তান্ত পোর্টাল' : 'E-Service Record Portal'}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {language === 'bn' ? 'গেজেটেড সরকারি কর্মচারীগণ' : 'Gazetted Govt. Employees'}
              </p>
            </div>
          </div> : <div className="flex justify-center">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>}
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="p-2">
        {/* Main Menu */}
        <SidebarGroup className="mx-0 px-0">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            {language === 'bn' ? 'প্রধান মেনু' : 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map(item => <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton onClick={() => onNavigate(item.section)} className={getMenuButtonClass(item.section)} size={collapsed ? "sm" : "default"}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup className="px-0">
          <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
            <SidebarGroupLabel className={collapsed ? "sr-only" : "flex items-center justify-between"}>
              <span>{language === 'bn' ? 'সরঞ্জাম' : 'Tools'}</span>
              {!collapsed && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? '' : '-rotate-90'}`} />
                  </Button>
                </CollapsibleTrigger>
              )}
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {toolsMenuItems.map(item => <SidebarMenuItem key={item.section}>
                      <SidebarMenuButton onClick={() => onNavigate(item.section)} className={getMenuButtonClass(item.section)} size={collapsed ? "sm" : "default"}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                        {item.section === 'notifications' && <div className="ml-auto h-2 w-2 bg-destructive rounded-full"></div>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            {language === 'bn' ? 'সেটিংস' : 'Settings'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsMenuItems.map(item => <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton onClick={() => onNavigate(item.section)} className={getMenuButtonClass(item.section)} size={collapsed ? "sm" : "default"}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-2 border-t border-border">
        {!collapsed ? <div className="space-y-2">
            {/* User Profile */}
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {employeeData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-card-foreground truncate">
                  {employeeData.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {employeeData.employeeId}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onNavigate('logout')}>
              <LogOut className="h-4 w-4 mr-2" />
              {language === 'bn' ? 'লগ আউট' : 'Logout'}
            </Button>
          </div> : <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full p-2" onClick={() => onNavigate('profile')}>
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {employeeData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </Button>
            <Button variant="outline" size="sm" className="w-full p-2" onClick={() => onNavigate('logout')}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>}
      </SidebarFooter>
    </Sidebar>;
}