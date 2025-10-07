import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Menu, Bell } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { CopyRights } from "@/components/CopyRights";

interface SettingsProps {
  language: 'bn' | 'en';
}

export default function Settings({ language: initialLanguage }: SettingsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    nid_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    district: "",
    postal_code: "",
    employee_id: "",
    grade: "",
    designation: "",
    current_position: "",
    department: "",
    office_name: "",
    joining_date: "",
  });

  const handleNavigation = (section: string) => {
    if (section === 'dashboard') {
      navigate('/');
      return;
    }

    if (section === "security") {
      navigate("/security");
      return;
    }

    if (section === 'office-information') {
      navigate('/office-information');
      return;
    }

    toast({
      title: language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon',
      description: language === 'bn' ? 'এই পেজটি শীঘ্রই উপলব্ধ হবে।' : 'This page will be available soon.',
    });
  };

  useEffect(() => {
    if (user) {
      setEmailVerified(user.email_confirmed_at !== null);
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          nid_number: data.nid_number || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          district: data.district || "",
          postal_code: data.postal_code || "",
          employee_id: data.employee_id || "",
          grade: data.grade || "",
          designation: data.designation || "",
          current_position: data.current_position || "",
          department: data.department || "",
          office_name: data.office_name || "",
          joining_date: data.joining_date || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "প্রোফাইল লোড করতে ব্যর্থ" : "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "প্রোফাইল আপডেট করতে ব্যর্থ" : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setSending(true);
      if (!user?.email) {
        throw new Error('No email available');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' ? "যাচাইকরণ ইমেইল পাঠানো হয়েছে" : "Verification email sent",
      });
    } catch (error) {
      console.error('Error sending verification:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' ? "যাচাইকরণ ইমেইল পাঠাতে ব্যর্থ" : "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading && !formData.full_name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        <AppSidebar
          language={language}
          onNavigate={handleNavigation}
        />

        <SidebarInset className="flex-1">
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

          <main className="flex-1 p-6">
            <div className="container mx-auto py-6 px-4 max-w-4xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">
                  {language === 'bn' ? 'সেটিংস' : 'Settings'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'bn' ? 'আপনার প্রোফাইল তথ্য দেখুন এবং সম্পাদনা করুন' : 'View and edit your profile information'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'bn' ? 'ইমেইল যাচাইকরণ' : 'Email Verification'}</CardTitle>
                    <CardDescription>
                      {language === 'bn' ? 'আপনার ইমেইল ঠিকানা যাচাই করুন' : 'Verify your email address'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {emailVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium">{user?.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {emailVerified
                              ? (language === 'bn' ? 'যাচাইকৃত' : 'Verified')
                              : (language === 'bn' ? 'অপ্রত্যয়িত' : 'Unverified')}
                          </p>
                        </div>
                      </div>
                      {!emailVerified && (
                        <Button
                          type="button"
                          onClick={handleSendVerification}
                          disabled={sending}
                        >
                          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Email'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</Label>
                        <Input
                          value={formData.full_name}
                          onChange={(e) => handleChange('full_name', e.target.value)}
                          placeholder={language === 'bn' ? 'পূর্ণ নাম লিখুন' : 'Enter full name'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'ইমেইল' : 'Email'}</Label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder={language === 'bn' ? 'ইমেইল লিখুন' : 'Enter email'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'ফোন' : 'Phone'}</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder={language === 'bn' ? 'ফোন নম্বর লিখুন' : 'Enter phone number'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}</Label>
                        <Input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'লিঙ্গ' : 'Gender'}</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'bn' ? 'নির্বাচন করুন' : 'Select'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</SelectItem>
                            <SelectItem value="female">{language === 'bn' ? 'মহিলা' : 'Female'}</SelectItem>
                            {/* <SelectItem value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'জাতীয় পরিচয়পত্র নম্বর' : 'NID Number'}</Label>
                        <Input
                          value={formData.nid_number}
                          onChange={(e) => handleChange('nid_number', e.target.value)}
                          placeholder={language === 'bn' ? 'এনআইডি নম্বর লিখুন' : 'Enter NID number'}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'bn' ? 'ঠিকানা তথ্য' : 'Address Information'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label>{language === 'bn' ? 'ঠিকানা লাইন ১' : 'Address Line 1'}</Label>
                        <Input
                          value={formData.address_line1}
                          onChange={(e) => handleChange('address_line1', e.target.value)}
                          placeholder={language === 'bn' ? 'ঠিকানা লিখুন' : 'Enter address'}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{language === 'bn' ? 'ঠিকানা লাইন ২' : 'Address Line 2'}</Label>
                        <Input
                          value={formData.address_line2}
                          onChange={(e) => handleChange('address_line2', e.target.value)}
                          placeholder={language === 'bn' ? 'ঠিকানা লিখুন (ঐচ্ছিক)' : 'Enter address (optional)'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'শহর' : 'City'}</Label>
                        <Input
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          placeholder={language === 'bn' ? 'শহর লিখুন' : 'Enter city'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'জেলা' : 'District'}</Label>
                        <Input
                          value={formData.district}
                          onChange={(e) => handleChange('district', e.target.value)}
                          placeholder={language === 'bn' ? 'জেলা লিখুন' : 'Enter district'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'পোস্টাল কোড' : 'Postal Code'}</Label>
                        <Input
                          value={formData.postal_code}
                          onChange={(e) => handleChange('postal_code', e.target.value)}
                          placeholder={language === 'bn' ? 'পোস্টাল কোড লিখুন' : 'Enter postal code'}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'bn' ? 'পেশাগত তথ্য' : 'Professional Information'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'কর্মচারী আইডি' : 'Employee ID'}</Label>
                        <Input
                          value={formData.employee_id}
                          onChange={(e) => handleChange('employee_id', e.target.value)}
                          placeholder={language === 'bn' ? 'কর্মচারী আইডি লিখুন' : 'Enter employee ID'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'গ্রেড' : 'Grade'}</Label>
                        {/* <Input
                          value={formData.grade}
                          onChange={(e) => handleChange('grade', e.target.value)}
                          placeholder={language === 'bn' ? 'গ্রেড লিখুন' : 'Enter grade'}
                        /> */}
                        <Select value={formData.grade} onValueChange={(value) => handleChange('grade', value)}>
                          <SelectTrigger id="grade">
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Grade-9">Grade-9</SelectItem>
                            <SelectItem value="Grade-10">Grade-10</SelectItem>
                            <SelectItem value="Grade-13">Grade-13</SelectItem>
                            <SelectItem value="Grade-14">Grade-14</SelectItem>
                            <SelectItem value="Grade-15">Grade-15</SelectItem>
                            <SelectItem value="Grade-16">Grade-16</SelectItem>
                            <SelectItem value="Grade-17">Grade-17</SelectItem>
                            <SelectItem value="Grade-20">Grade-20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'পদবী' : 'Designation'}</Label>
                        <Input
                          value={formData.designation}
                          onChange={(e) => handleChange('designation', e.target.value)}
                          placeholder={language === 'bn' ? 'পদবী লিখুন' : 'Enter designation'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'বর্তমান পদ' : 'Current Position'}</Label>
                        <Input
                          value={formData.current_position}
                          onChange={(e) => handleChange('current_position', e.target.value)}
                          placeholder={language === 'bn' ? 'বর্তমান পদ লিখুন' : 'Enter current position'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'বিভাগ' : 'Department'}</Label>
                        <Input
                          value={formData.department}
                          onChange={(e) => handleChange('department', e.target.value)}
                          placeholder={language === 'bn' ? 'বিভাগ লিখুন' : 'Enter department'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'অফিসের নাম' : 'Office Name'}</Label>
                        <Input
                          value={formData.office_name}
                          onChange={(e) => handleChange('office_name', e.target.value)}
                          placeholder={language === 'bn' ? 'অফিসের নাম লিখুন' : 'Enter office name'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{language === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}</Label>
                        <Input
                          type="date"
                          value={formData.joining_date}
                          onChange={(e) => handleChange('joining_date', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={fetchProfile}
                    disabled={loading}
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </main>

          <footer className="border-t border-border bg-card/50 py-4 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              <CopyRights />
              {/* {language === 'bn' 
                ? 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ'
                : 'Government of the People\'s Republic of Bangladesh | ICT Division'
              } */}
            </p>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
