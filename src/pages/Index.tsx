import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, User, Building2, FileText, Calendar } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { QuickStats } from "@/components/QuickStats";
import { DashboardCard } from "@/components/DashboardCard";
import { CopyRights } from "@/components/CopyRights";

const Index = () => {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [currentSection, setCurrentSection] = useState("dashboard");
  const { toast } = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Title translation helper
  const getSectionTitle = (section: string) => {
    const titles: Record<string, { bn: string; en: string }> = {
      dashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
      "office-information": { bn: "দাপ্তরিক তথ্য", en: "Office Information" },
      "general-information": { bn: "সাধারণ তথ্য", en: "General Information" },
      'children-information': { bn: "সন্তানদের তথ্যাবলি", en: "Children Information" },
      'upload-files': { bn: "আপলোড", en: "Upload Files" },
      documents: { bn: "নথিপত্র", en: "Documents" },
      leave: { bn: "ছুটির আবেদন", en: "Leave Application" },
      settings: { bn: "সেটিংস", en: "Settings" },
      notifications: { bn: "নোটিফিকেশন", en: "Notifications" },
      security: { bn: "সিকিউরিটি", en: "Security" },
    };
    return titles[section]?.[language] || section;
  };

  // Breadcrumb helper function
  const getBreadcrumbs = () => {
    const home = { label: language === "bn" ? "হোম" : "Home", section: "dashboard" };

    if (currentSection === "dashboard") {
      return [home];
    }
    return [
      home,
      { label: getSectionTitle(currentSection), section: currentSection },
    ];
  }

  // Navigation + placeholder handling
  const handleNavigation = async (section: string) => {
    setCurrentSection(section);

    // Handle known pages
    if (section === "office-information") {
      navigate("/office-information");
      return;
    }

    // General Information page
    if (section === "general-information") {
      navigate("/general-information");
      return;
    }

    // Children Information page
    if (section === "children-information") {
      navigate("/children-information");
      return;
    }

    // Marital Status page
    if (section === 'marital-status') {
      navigate('/marital-status');
      return;
    }

    // Educational Qualification 
    if (section === 'educational-qualification') {
      navigate('/educational-qualification');
      return;
    }

    // Upload Files page
    if (section === 'upload-files') {
      navigate('/upload-files');
      return;
    }

    // Notifications page
    if (section === "notifications") {
      navigate("/notifications");
      return;
    }

    if (section === "security") {
      navigate("/security");
      return;
    }

    if (section === "settings") {
      navigate("/settings");
      return;
    }

    if (section === "logout") {
      await signOut();
      toast({
        title: language === "bn" ? "লগ আউট" : "Logout",
        description:
          language === "bn"
            ? "আপনি সফলভাবে লগ আউট হয়েছেন।"
            : "You have been successfully logged out.",
      });
      navigate("/login");
      return;
    }

    // Placeholder pages (not yet built)
    toast({
      title:
        language === "bn"
          ? `${getSectionTitle(section)} পেজটি এখনো তৈরি হয়নি`
          : `${getSectionTitle(section)} page coming soon`,
      description:
        language === "bn"
          ? "এই ফিচারটি শীঘ্রই যুক্ত হবে।"
          : "This feature will be available soon.",
    });
  };

  // Cards
  const dashboardCards = [
    {
      title: language === "bn" ? "ব্যক্তিগত তথ্য" : "Personal Information",
      description:
        language === "bn"
          ? "আপনার ব্যক্তিগত তথ্য দেখুন এবং আপডেট করুন"
          : "View and update your personal information",
      icon: User,
      actionText: language === "bn" ? "দেখুন" : "View",
      onAction: () => handleNavigation("settings"),
      status: "completed" as const,
    },
    {
      title: language === "bn" ? "দাপ্তরিক তথ্যাবলি" : "Office Information",
      description:
        language === "bn"
          ? "আপনার দাপ্তরিক তথ্য পরিচালনা করুন"
          : "Manage your office information",
      icon: Building2,
      actionText: language === "bn" ? "পরিচালনা করুন" : "Manage",
      onAction: () => handleNavigation("office-information"),
      status: "in-progress" as const,
    },
    {
      title: language === "bn" ? "নথিপত্র" : "Documents",
      description:
        language === "bn"
          ? "আপনার নথিপত্র দেখুন এবং আপলোড করুন"
          : "View and upload your documents",
      icon: FileText,
      actionText: language === "bn" ? "দেখুন" : "View",
      onAction: () => handleNavigation("documents"),
      status: "pending" as const,
      priority: true,
    },
    {
      title: language === "bn" ? "ছুটির আবেদন" : "Leave Application",
      description:
        language === "bn"
          ? "নতুন ছুটির আবেদন জমা দিন"
          : "Submit a new leave application",
      icon: Calendar,
      actionText: language === "bn" ? "আবেদন করুন" : "Apply",
      onAction: () => handleNavigation("leave"),
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-green-200 dark:bg-background flex flex-col">
        <div className="flex flex-1">
          {/* Sidebar */}
          <AppSidebar language={language} onNavigate={handleNavigation} />

          {/* Main Content */}
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                  <Menu className="h-4 w-4" />
                </SidebarTrigger>

                {/* Breadcrumbs funtionalities */}
                <Breadcrumb>
                  <BreadcrumbList>
                    {getBreadcrumbs().map((crumb, index) => (
                      <div key={crumb.section} className="flex items-center gap-1.5">
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                          {index === getBreadcrumbs().length - 1 ? (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              onClick={() => handleNavigation(crumb.section)}
                              className="cursor-pointer"
                            >
                              {crumb.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </div>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>

                <div className="flex-1" />

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigation("notifications")}
                    className="relative"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                  </Button>
                  <LanguageToggle
                    onLanguageChange={setLanguage}
                    currentLanguage={language}
                  />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6">
              {currentSection === "dashboard" ? (
                <>
                  <WelcomeHeader language={language} />
                  <div className="container mx-auto px-4 py-6 space-y-6">
                    <QuickStats language={language} />

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {dashboardCards.map((card, i) => (
                        <DashboardCard key={i} {...card} />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">
                      {getSectionTitle(currentSection)}
                    </h2>
                    <p className="text-muted-foreground">
                      {language === "bn"
                        ? "এই পেজটি শীঘ্রই আসছে। দয়া করে অপেক্ষা করুন।"
                        : "This page is coming soon. Please stay tuned."}
                    </p>
                    <Button
                      onClick={() => setCurrentSection("dashboard")}
                      variant="outline"
                    >
                      {language === "bn"
                        ? "ড্যাশবোর্ডে ফিরুন"
                        : "Back to Dashboard"}
                    </Button>
                  </div>
                </div>
              )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card/50 py-4 px-6 text-center">
              <p className="text-sm text-muted-foreground">
                <CopyRights />
                {/* {language === "bn"
                  ? "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ"
                  : "Government of the People's Republic of Bangladesh | ICT Division"} */}
              </p>
            </footer>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
