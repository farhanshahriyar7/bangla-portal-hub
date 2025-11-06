import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { Bell, Filter, Download, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
// import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

interface ActivityLog {
  id: string;
  action_type: string;
  action_description: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
}

const Notifications = ({ language }: { language: "en" | "bn" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      title: "Activity Logs",
      subtitle: "Track all your dashboard activities",
      action: "Action",
      description: "Description",
      type: "Type",
      time: "Time",
      filter: "Filter by Type",
      all: "All Activities",
      download: "Download Logs",
      noLogs: "No activity logs found",
      create: "Created",
      update: "Updated",
      delete: "Deleted",
      view: "Viewed",
      login: "Login",
      logout: "Logout",
    },
    bn: {
      title: "কার্যক্রম লগ",
      subtitle: "আপনার সমস্ত ড্যাশবোর্ড কার্যক্রম ট্র্যাক করুন",
      action: "কার্যক্রম",
      description: "বিবরণ",
      type: "ধরন",
      time: "সময়",
      filter: "ধরন অনুযায়ী ফিল্টার করুন",
      all: "সমস্ত কার্যক্রম",
      download: "লগ ডাউনলোড করুন",
      noLogs: "কোনো কার্যক্রম লগ পাওয়া যায়নি",
      create: "তৈরি করা হয়েছে",
      update: "আপডেট করা হয়েছে",
      delete: "মুছে ফেলা হয়েছে",
      view: "দেখা হয়েছে",
      login: "লগইন",
      logout: "লগআউট",
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredLogs(activityLogs);
    } else {
      setFilteredLogs(activityLogs.filter(log => log.action_type === filterType));
    }
  }, [filterType, activityLogs]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // BACKEND INTEGRATION - Uncomment when SQL is pushed
      // const { data, error } = await supabase
      //   .from("activity_logs")
      //   .select("*")
      //   .eq("user_id", user?.id)
      //   .order("created_at", { ascending: false });

      // if (error) throw error;
      // setActivityLogs(data || []);
      // setFilteredLogs(data || []);

      // Mock data for demonstration
      const mockData: ActivityLog[] = [
        {
          id: "1",
          action_type: "create",
          action_description: "Created new general information record",
          entity_type: "general_information",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          action_type: "update",
          action_description: "Updated office information",
          entity_type: "office_information",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          action_type: "view",
          action_description: "Viewed profile settings",
          entity_type: "profile",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "4",
          action_type: "login",
          action_description: "User logged in",
          entity_type: "auth",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      setActivityLogs(mockData);
      setFilteredLogs(mockData);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    switch (actionType) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      case "view":
        return "outline";
      case "login":
      case "logout":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadLogs = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((log) => ({
        Action: log.action_type,
        Description: log.action_description,
        Type: log.entity_type || "N/A",
        Time: formatDateTime(log.created_at),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
    XLSX.writeFile(workbook, `activity_logs_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleNavigation = async (section: string) => {
    if (section === 'dashboard') {
      navigate('/');
      return;
    }

    if (section === 'office-information') {
      navigate('/office-information');
      return;
    }

    if (section === 'general-information') {
      navigate('/general-information');
      return;
    }
    
    if (section === 'children-information') {
      navigate('/children-information');
      return;
    }

    if (section === 'upload-files') {
      navigate('/upload-files');
      return;
    }


    if (section === 'security') {
      navigate('/security');
      return;
    }
    if (section === 'settings') {
      navigate('/settings');
      return;
    }
    if (section === 'logout') {
      try {
        await signOut();
        toast({
          title: language === 'bn' ? 'লগ আউট' : 'Logout',
          description: language === 'bn' ? 'আপনি সফলভাবে লগআউট হয়েছেন' : 'You have been successfully logged out.',
        });
        navigate('/login');
      } catch (err) {
        toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'লগআউট বিফল' : 'Failed to logout', variant: 'destructive' });
      }
      return;
    }

    toast({ title: language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon', description: language === 'bn' ? 'এই পেজটি শীঘ্রই উপলব্ধ হবে।' : 'This page will be available soon.' });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar language={language} onNavigate={handleNavigation} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <Breadcrumbs items={[{ label: language === 'bn' ? 'কার্যক্রম লগ' : 'Activity Logs' }]} />

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => handleNavigation('notifications')} className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </Button>
                <LanguageToggle onLanguageChange={() => { }} currentLanguage={language} />
                <ThemeToggle />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">{t.title}</h1>
                  <p className="text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>

              <div className="flex gap-4 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t.filter} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.all}</SelectItem>
                      <SelectItem value="create">{t.create}</SelectItem>
                      <SelectItem value="update">{t.update}</SelectItem>
                      <SelectItem value="delete">{t.delete}</SelectItem>
                      <SelectItem value="view">{t.view}</SelectItem>
                      <SelectItem value="login">{t.login}</SelectItem>
                      <SelectItem value="logout">{t.logout}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleDownloadLogs} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t.download}
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary hover:bg-primary">
                      <TableHead className="text-primary-foreground">{t.action}</TableHead>
                      <TableHead className="text-primary-foreground">{t.description}</TableHead>
                      <TableHead className="text-primary-foreground">{t.type}</TableHead>
                      <TableHead className="text-primary-foreground">{t.time}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {t.noLogs}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action_type)}>
                              {log.action_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.action_description}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {log.entity_type || "N/A"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(log.created_at)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Notifications;
