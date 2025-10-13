import { useState, useEffect } from "react";
import { Home, User, FileText, Calendar, Upload, Download, Shield, Settings, Bell, LogOut, Building2, ChevronDown } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  type IconType = React.ComponentType<{ className?: string }>;

  const [mainMenuItems, setMainMenuItems] = useState<Array<{ title: string; url: string; icon: IconType; section: string }>>([
    { title: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard', url: '/', icon: Home as IconType, section: 'dashboard' },
    { title: language === 'bn' ? 'দাপ্তরিক তথ্যাবলি' : 'Office Information', url: '/office-information', icon: Building2 as IconType, section: 'office-information' },
  ]);

  const [toolsMenuItems, setToolsMenuItems] = useState<Array<{ title: string; url: string; icon: IconType; section: string }>>([
    { title: language === 'bn' ? 'আপলোড' : 'Upload', url: '/upload', icon: Upload as IconType, section: 'upload' },
    { title: language === 'bn' ? 'ডাউনলোড' : 'Download', url: '/download', icon: Download as IconType, section: 'download' },
    { title: language === 'bn' ? 'নোটিফিকেশন' : 'Notifications', url: '/notifications', icon: Bell as IconType, section: 'notifications' },
  ]);

  const [settingsMenuItems, setSettingsMenuItems] = useState<Array<{ title: string; url: string; icon: IconType; section: string }>>([
    { title: language === 'bn' ? 'নিরাপত্তা' : 'Security', url: '/security', icon: Shield as IconType, section: 'security' },
    { title: language === 'bn' ? 'সেটিংস' : 'Settings', url: '/settings', icon: Settings as IconType, section: 'settings' },
  ]);

  // Icon map for DB-driven items (map section -> icon component)
  const iconMap: Record<string, IconType> = {
    dashboard: Home,
    'office-information': Building2,
    upload: Upload,
    download: Download,
    notifications: Bell,
    security: Shield,
    settings: Settings,
    personal: User,
    documents: FileText,
    leave: Calendar,
  };

  // Fetch menu items from DB and replace the static lists when available
  const fetchMenus = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase as any)
        .from('menu_items')
        .select('title_en,title_bn,url,section,group,order')
        .order('group', { ascending: true })
        .order('order', { ascending: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = res?.data as Array<any> | null;
      if (rows && rows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const main: Array<any> = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tools: Array<any> = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const settingsArr: Array<any> = [];

        rows.forEach((r) => {
          const title = language === 'bn' ? (r.title_bn || r.title_en || r.title) : (r.title_en || r.title_bn || r.title);
          const iconFor = (r.section && iconMap[r.section]) ? iconMap[r.section] : FileText as IconType;
          const item = { title, url: r.url || '/', section: r.section || '', icon: iconFor };
          const group = (r.group || 'main').toString().toLowerCase();
          if (group === 'tools') tools.push(item);
          else if (group === 'settings') settingsArr.push(item);
          else main.push(item);
        });

        if (main.length) setMainMenuItems(main);
        if (tools.length) setToolsMenuItems(tools);
        if (settingsArr.length) setSettingsMenuItems(settingsArr);
      }
    } catch (err) {
      // keep fallbacks
      console.warn('Failed to load menu items from DB:', err);
    }
  };

  // Fetch menus on mount and when language changes
  useEffect(() => {
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);
  const isActive = (section: string) => {
    if (section === 'dashboard') return currentPath === '/';
    return currentPath.includes(section);
  };
  const getMenuButtonClass = (section: string) => {
    return isActive(section) ? "bg-primary text-primary-foreground font-medium shadow-sm" : "hover:bg-accent hover:text-accent-foreground";
  };
  const { user } = useAuth();

  // Employee/profile data for footer — fetched from DB when user is available.
  const [employeeData, setEmployeeData] = useState({
    name: language === 'bn' ? 'মোহাম্মদ রহিম উদ্দিন' : 'Mohammad Rahim Uddin',
    employeeId: 'EMP-2024-0158',
    designation: language === 'bn' ? 'সহকারী প্রোগ্রামার' : 'Assistant Programmer'
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile for the logged-in user and update sidebar footer.
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, employee_id, designation, passport_photo_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Failed to load profile for sidebar:', error);
          return;
        }

        if (data) {
          setEmployeeData({
            name: data.full_name || (language === 'bn' ? 'অজ্ঞাত ব্যবহারকারী' : 'Unknown User'),
            employeeId: data.employee_id || '',
            designation: data.designation || '',
          });

          if (data.passport_photo_url) {
            const rawPath = data.passport_photo_url;

            try {
              if (/^https?:\/\//i.test(rawPath)) {
                const storageMarker = '/storage/v1/object/public/';
                const markerIndex = rawPath.indexOf(storageMarker);

                if (markerIndex !== -1) {
                  const after = rawPath.slice(markerIndex + storageMarker.length);
                  const [bucket, ...rest] = after.split('/');
                  const path = rest.join('/');

                  try {
                    const { data: signedUrlData, error: signedError } = await supabase.storage
                      .from(bucket)
                      .createSignedUrl(path, 3600);

                    if (!signedError && signedUrlData?.signedUrl) {
                      setAvatarUrl(signedUrlData.signedUrl);
                    } else {
                      setAvatarUrl(rawPath);
                    }
                  } catch (err) {
                    console.error('Error requesting signed URL from public storage URL:', err);
                    setAvatarUrl(rawPath);
                  }
                } else {
                  setAvatarUrl(rawPath);
                }
              } else {
                const path = rawPath.replace(/^\/+/, '');

                const { data: signedUrlData, error: signedError } = await supabase.storage
                  .from('passport-photos')
                  .createSignedUrl(path, 3600);

                if (!signedError && signedUrlData?.signedUrl) {
                  setAvatarUrl(signedUrlData.signedUrl);
                } else {
                  const { data: publicData } = await supabase.storage
                    .from('passport-photos')
                    .getPublicUrl(path);

                  if (publicData?.publicUrl) {
                    setAvatarUrl(publicData.publicUrl);
                  } else {
                    setAvatarUrl(rawPath);
                  }
                }
              }
            } catch (err) {
              console.error('Unexpected error resolving avatar URL:', err);
              setAvatarUrl(rawPath);
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error loading sidebar profile:', err);
      }
    };

    fetchProfile();
  }, [user, language]);
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
          <p className="text-xs text-muted-foreground truncate">
            {/* soon it gonna be used for admin */}
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
            {mainMenuItems.map(item => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const Icon = item.icon as any;
              return (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton onClick={() => onNavigate(item.section)} className={getMenuButtonClass(item.section)} size={collapsed ? "sm" : "default"}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
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
                {toolsMenuItems.map(item => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const Icon = item.icon as any;
                  return (
                    <SidebarMenuItem key={item.section}>
                      <SidebarMenuButton onClick={() => onNavigate(item.section)} className={getMenuButtonClass(item.section)} size={collapsed ? "sm" : "default"}>
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                        {item.section === 'notifications' && <div className="ml-auto h-2 w-2 bg-destructive rounded-full"></div>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
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
            {settingsMenuItems.map(item => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const Icon = item.icon as any;
              return (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton onClick={() => onNavigate(item.section)} className={getMenuButtonClass(item.section)} size={collapsed ? "sm" : "default"}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="ml-2 truncate">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    {/* Footer */}
    <SidebarFooter className="p-2 border-t border-border">
      {!collapsed ? <div className="space-y-2">
        {/* User Profile */}
        <div className="flex items-center gap-3 p-2 rounded-lg transition-colors">
          <Avatar className="h-8 w-8">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {employeeData.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-card-foreground truncate ">
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
                {avatarUrl ? <AvatarImage src={avatarUrl} /> : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {employeeData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
        <Button variant="outline" size="sm" className="w-full p-2" onClick={() => onNavigate('logout')}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>}
    </SidebarFooter>
  </Sidebar>;
}