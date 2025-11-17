import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Bell, CheckCheck, LogOut, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Translation object
const translations = {
  en: {
    title: "Notifications",
    filterBy: "Filter by",
    allNotifications: "All Notifications",
    unreadOnly: "Unread Only",
    readOnly: "Read Only",
    markAllRead: "Mark All as Read",
    logout: "Logout",
    noNotifications: "No notifications found",
    unread: "Unread",
    read: "Read",
  },
  bn: {
    title: "বিজ্ঞপ্তি",
    filterBy: "ফিল্টার করুন",
    allNotifications: "সমস্ত বিজ্ঞপ্তি",
    unreadOnly: "শুধুমাত্র অপঠিত",
    readOnly: "শুধুমাত্র পঠিত",
    markAllRead: "সব পঠিত হিসেবে চিহ্নিত করুন",
    logout: "লগআউট",
    noNotifications: "কোনো বিজ্ঞপ্তি পাওয়া যায়নি",
    unread: "অপঠিত",
    read: "পঠিত",
  },
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'bn' | 'en'>('en');
  const t = translations[language];
  
  // Mock notifications data (will be replaced with real backend data later)
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "Welcome to the Portal",
      message: "Your account has been successfully created. Please complete your profile information.",
      type: "success",
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Profile Verification Required",
      message: "Please upload your ID proof and passport photo to complete verification.",
      type: "warning",
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "3",
      title: "Document Uploaded Successfully",
      message: "Your passport photo has been uploaded and is under review.",
      type: "info",
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "4",
      title: "System Maintenance Scheduled",
      message: "The system will be under maintenance on Sunday, 2 AM - 4 AM.",
      type: "info",
      is_read: true,
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "5",
      title: "Profile Verification Approved",
      message: "Congratulations! Your profile has been verified successfully.",
      type: "success",
      is_read: false,
      created_at: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filterType, setFilterType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filterType === "unread") return !notif.is_read;
    if (filterType === "read") return notif.is_read;
    return true;
  });

  // Paginate
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'bn' ? 'এইমাত্র' : 'Just now';
    if (diffMins < 60) return language === 'bn' ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'bn' ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
    if (diffDays < 7) return language === 'bn' ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
    
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "success": return "default";
      case "warning": return "secondary";
      case "error": return "destructive";
      case "info": return "outline";
      default: return "default";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const handleLogout = async () => {
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-card">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <Bell className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle 
                  currentLanguage={language}
                  onLanguageChange={setLanguage}
                />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title={t.logout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            <Card className="p-6">
              {/* Filters and Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t.filterBy}:</span>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allNotifications}</SelectItem>
                      <SelectItem value="unread">{t.unreadOnly}</SelectItem>
                      <SelectItem value="read">{t.readOnly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  <CheckCheck className="mr-2 h-4 w-4" />
                  {t.markAllRead}
                </Button>
              </div>

              {/* Notifications List */}
              <div className="space-y-3">
                {paginatedNotifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>{t.noNotifications}</p>
                  </div>
                ) : (
                  paginatedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                        notification.is_read 
                          ? 'bg-background hover:bg-muted/50' 
                          : 'bg-accent/5 hover:bg-accent/10 border-accent'
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getBadgeVariant(notification.type)}>
                              {notification.type}
                            </Badge>
                            {!notification.is_read && (
                              <Badge variant="default" className="text-xs">
                                {t.unread}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
