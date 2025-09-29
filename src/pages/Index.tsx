import { useState } from "react";
import { User, FileText, Settings, Shield, Calendar, Upload, Download, Bell, Menu } from "lucide-react";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { DashboardCard } from "@/components/DashboardCard";
import { QuickStats } from "@/components/QuickStats";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";

const Index = () => {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [currentSection, setCurrentSection] = useState('dashboard');
  const { toast } = useToast();

  const handleCardAction = (action: string) => {
    toast({
      title: language === 'bn' ? 'কার্যক্রম শুরু হয়েছে' : 'Action Started',
      description: language === 'bn' 
        ? `${action} প্রক্রিয়া শুরু হয়েছে। অনুগ্রহ করে অপেক্ষা করুন।`
        : `${action} process has been initiated. Please wait.`,
    });
  };

  const handleNavigation = (section: string) => {
    setCurrentSection(section);
    if (section === 'logout') {
      toast({
        title: language === 'bn' ? 'লগ আউট' : 'Logout',
        description: language === 'bn' 
          ? 'আপনি সফলভাবে লগ আউট হয়েছেন।'
          : 'You have been successfully logged out.',
      });
      return;
    }
    
    toast({
      title: language === 'bn' ? 'পেজ পরিবর্তন' : 'Page Changed',
      description: language === 'bn' 
        ? `${getSectionTitle(section)} পেজে নেভিগেট করা হয়েছে।`
        : `Navigated to ${getSectionTitle(section)} page.`,
    });
  };

  const getSectionTitle = (section: string) => {
    const titles: Record<string, { bn: string; en: string }> = {
      dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
      personal: { bn: 'ব্যক্তিগত তথ্য', en: 'Personal Info' },
      professional: { bn: 'পেশাগত তথ্য', en: 'Professional Data' },
      documents: { bn: 'নথিপত্র', en: 'Documents' },
      leave: { bn: 'ছুটির আবেদন', en: 'Leave Application' },
      upload: { bn: 'আপলোড', en: 'Upload' },
      download: { bn: 'ডাউনলোড', en: 'Download' },
      notifications: { bn: 'নোটিফিকেশন', en: 'Notifications' },
      security: { bn: 'নিরাপত্তা', en: 'Security' },
      settings: { bn: 'সেটিংস', en: 'Settings' }
    };
    return titles[section]?.[language] || section;
  };

  const dashboardCards = [
    {
      title: language === 'bn' ? 'ব্যক্তিগত তথ্য আপডেট' : 'Update Personal Information',
      description: language === 'bn' 
        ? 'আপনার ব্যক্তিগত তথ্য পর্যালোচনা এবং আপডেট করুন'
        : 'Review and update your personal information',
      icon: User,
      status: 'completed' as const,
      actionText: language === 'bn' ? 'দেখুন ও সম্পাদনা করুন' : 'View & Edit',
      priority: false
    },
    {
      title: language === 'bn' ? 'পেশাগত তথ্য ফর্ম' : 'Professional Data Form',
      description: language === 'bn' 
        ? 'চাকরির বিবরণ, দক্ষতা এবং অভিজ্ঞতার তথ্য যোগ করুন'
        : 'Add job details, skills, and experience information',
      icon: FileText,
      status: 'in-progress' as const,
      actionText: language === 'bn' ? 'চালিয়ে যান' : 'Continue',
      priority: true
    },
    {
      title: language === 'bn' ? 'নিরাপত্তা সেটিংস' : 'Security Settings',
      description: language === 'bn' 
        ? 'পাসওয়ার্ড পরিবর্তন এবং নিরাপত্তা সেটিংস পরিচালনা করুন'
        : 'Change password and manage security settings',
      icon: Shield,
      actionText: language === 'bn' ? 'সেটিংস খুলুন' : 'Open Settings',
      priority: false
    },
    {
      title: language === 'bn' ? 'ছুটির আবেদন' : 'Leave Application',
      description: language === 'bn' 
        ? 'নতুন ছুটির আবেদন জমা দিন বা বিদ্যমান আবেদন দেখুন'
        : 'Submit new leave application or view existing ones',
      icon: Calendar,
      status: 'pending' as const,
      actionText: language === 'bn' ? 'আবেদন করুন' : 'Apply',
      priority: false
    },
    {
      title: language === 'bn' ? 'নথি আপলোড' : 'Document Upload',
      description: language === 'bn' 
        ? 'প্রয়োজনীয় নথিপত্র আপলোড এবং পরিচালনা করুন'
        : 'Upload and manage required documents',
      icon: Upload,
      actionText: language === 'bn' ? 'নথি আপলোড করুন' : 'Upload Documents',
      priority: false
    },
    {
      title: language === 'bn' ? 'রিপোর্ট ডাউনলোড' : 'Download Reports',
      description: language === 'bn' 
        ? 'আপনার কর্মচারী রিপোর্ট এবং সার্টিফিকেট ডাউনলোড করুন'
        : 'Download your employee reports and certificates',
      icon: Download,
      actionText: language === 'bn' ? 'রিপোর্ট দেখুন' : 'View Reports',
      priority: false
    }
  ];

  const renderMainContent = () => {
    if (currentSection !== 'dashboard') {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              {getSectionTitle(currentSection)}
            </h2>
            <p className="text-muted-foreground">
              {language === 'bn' 
                ? 'এই পেজটি শীঘ্রই আসছে। দয়া করে অপেক্ষা করুন।'
                : 'This page is coming soon. Please stay tuned.'
              }
            </p>
            <Button 
              onClick={() => setCurrentSection('dashboard')}
              variant="outline"
            >
              {language === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <WelcomeHeader language={language} />

        {/* Quick Stats */}
        <QuickStats language={language} />

        {/* Dashboard Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            {language === 'bn' ? 'দ্রুত অ্যাক্সেস' : 'Quick Access'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card, index) => (
              <DashboardCard
                key={index}
                title={card.title}
                description={card.description}
                icon={card.icon}
                status={card.status}
                actionText={card.actionText}
                onAction={() => handleCardAction(card.title)}
                priority={card.priority}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        {/* Sidebar */}
        <AppSidebar 
          language={language} 
          onNavigate={handleNavigation}
        />

        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              
              <div className="flex-1" />
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNavigation('notifications')}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
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
            {renderMainContent()}
          </main>

          {/* Footer */}
          <footer className="border-t border-border bg-card/50 py-4 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'bn' 
                ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ'
                : 'Government of the People\'s Republic of Bangladesh | ICT Division'
              }
            </p>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
