import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu, Mail, CheckCircle } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  nid_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  district: string;
  postal_code: string;
  employee_id: string;
  grade: string;
  designation: string;
  current_position: string;
  department: string;
  office_name: string;
  joining_date: string;
  is_verified: boolean;
}

const Index = () => {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfileData(data as ProfileData);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          nid_number: data.nid_number || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          district: data.district || '',
          postal_code: data.postal_code || '',
          employee_id: data.employee_id || '',
          grade: data.grade || '',
          designation: data.designation || '',
          current_position: data.current_position || '',
          department: data.department || '',
          office_name: data.office_name || '',
          joining_date: data.joining_date || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' 
          ? "প্রোফাইল লোড করতে সমস্যা হয়েছে" 
          : "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: language === 'bn' ? "সফল" : "Success",
        description: language === 'bn' 
          ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে" 
          : "Profile updated successfully",
      });
      
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' 
          ? "প্রোফাইল আপডেট করতে সমস্যা হয়েছে" 
          : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    if (!user?.email) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: language === 'bn' ? "ইমেইল পাঠানো হয়েছে" : "Email Sent",
        description: language === 'bn' 
          ? "যাচাইকরণ ইমেইল পাঠানো হয়েছে। দয়া করে আপনার ইনবক্স চেক করুন" 
          : "Verification email sent. Please check your inbox",
      });
    } catch (error) {
      console.error('Error sending verification:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn' 
          ? "যাচাইকরণ ইমেইল পাঠাতে সমস্যা হয়েছে" 
          : "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = async (section: string) => {
    if (section === 'office-information') {
      navigate('/office-information');
      return;
    }
    
    if (section === 'logout') {
      await signOut();
      toast({
        title: language === 'bn' ? 'লগ আউট' : 'Logout',
        description: language === 'bn' 
          ? 'আপনি সফলভাবে লগ আউট হয়েছেন।'
          : 'You have been successfully logged out.',
      });
      navigate('/login');
      return;
    }
  };

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

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
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {language === 'bn' ? 'প্রোফাইল তথ্য' : 'Profile Information'}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {language === 'bn' 
                    ? 'আপনার ব্যক্তিগত এবং পেশাগত তথ্য পর্যালোচনা এবং আপডেট করুন'
                    : 'Review and update your personal and professional information'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Verification */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'bn' ? 'ইমেইল যাচাইকরণ' : 'Email Verification'}
                    </CardTitle>
                    <CardDescription>
                      {language === 'bn' 
                        ? 'আপনার ইমেইল ঠিকানা যাচাই করুন'
                        : 'Verify your email address'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {profileData?.is_verified ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">
                                {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                              </p>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="font-medium">
                                {language === 'bn' ? 'যাচাই করা হয়নি' : 'Not Verified'}
                              </p>
                              <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                          </>
                        )}
                      </div>
                      {!profileData?.is_verified && (
                        <Button 
                          type="button" 
                          onClick={handleSendVerification}
                          disabled={loading}
                        >
                          {language === 'bn' ? 'যাচাইকরণ পাঠান' : 'Send Verification'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">
                          {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                        </Label>
                        <Input
                          id="full_name"
                          value={formData.full_name || ''}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Your full name'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {language === 'bn' ? 'ইমেইল' : 'Email'}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার ইমেইল' : 'Your email'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {language === 'bn' ? 'ফোন' : 'Phone'}
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার ফোন নম্বর' : 'Your phone number'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">
                          {language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                        </Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth || ''}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">
                          {language === 'bn' ? 'লিঙ্গ' : 'Gender'}
                        </Label>
                        <Select
                          value={formData.gender || ''}
                          onValueChange={(value) => handleInputChange('gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'bn' ? 'লিঙ্গ নির্বাচন করুন' : 'Select gender'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</SelectItem>
                            <SelectItem value="female">{language === 'bn' ? 'মহিলা' : 'Female'}</SelectItem>
                            <SelectItem value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nid_number">
                          {language === 'bn' ? 'জাতীয় পরিচয়পত্র নম্বর' : 'NID Number'}
                        </Label>
                        <Input
                          id="nid_number"
                          value={formData.nid_number || ''}
                          onChange={(e) => handleInputChange('nid_number', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার এনআইডি নম্বর' : 'Your NID number'}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'bn' ? 'ঠিকানা' : 'Address'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address_line1">
                          {language === 'bn' ? 'ঠিকানা লাইন ১' : 'Address Line 1'}
                        </Label>
                        <Input
                          id="address_line1"
                          value={formData.address_line1 || ''}
                          onChange={(e) => handleInputChange('address_line1', e.target.value)}
                          placeholder={language === 'bn' ? 'রাস্তা, বাড়ি নম্বর' : 'Street, house number'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address_line2">
                          {language === 'bn' ? 'ঠিকানা লাইন ২' : 'Address Line 2'}
                        </Label>
                        <Input
                          id="address_line2"
                          value={formData.address_line2 || ''}
                          onChange={(e) => handleInputChange('address_line2', e.target.value)}
                          placeholder={language === 'bn' ? 'এলাকা' : 'Area'}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">
                            {language === 'bn' ? 'শহর' : 'City'}
                          </Label>
                          <Input
                            id="city"
                            value={formData.city || ''}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder={language === 'bn' ? 'শহর' : 'City'}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="district">
                            {language === 'bn' ? 'জেলা' : 'District'}
                          </Label>
                          <Input
                            id="district"
                            value={formData.district || ''}
                            onChange={(e) => handleInputChange('district', e.target.value)}
                            placeholder={language === 'bn' ? 'জেলা' : 'District'}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="postal_code">
                            {language === 'bn' ? 'পোস্টাল কোড' : 'Postal Code'}
                          </Label>
                          <Input
                            id="postal_code"
                            value={formData.postal_code || ''}
                            onChange={(e) => handleInputChange('postal_code', e.target.value)}
                            placeholder={language === 'bn' ? 'পোস্টাল কোড' : 'Postal code'}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'bn' ? 'পেশাগত তথ্য' : 'Professional Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employee_id">
                          {language === 'bn' ? 'কর্মচারী আইডি' : 'Employee ID'}
                        </Label>
                        <Input
                          id="employee_id"
                          value={formData.employee_id || ''}
                          onChange={(e) => handleInputChange('employee_id', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার কর্মচারী আইডি' : 'Your employee ID'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grade">
                          {language === 'bn' ? 'গ্রেড' : 'Grade'}
                        </Label>
                        <Input
                          id="grade"
                          value={formData.grade || ''}
                          onChange={(e) => handleInputChange('grade', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার গ্রেড' : 'Your grade'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="designation">
                          {language === 'bn' ? 'পদবি' : 'Designation'}
                        </Label>
                        <Input
                          id="designation"
                          value={formData.designation || ''}
                          onChange={(e) => handleInputChange('designation', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার পদবি' : 'Your designation'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="current_position">
                          {language === 'bn' ? 'বর্তমান পদ' : 'Current Position'}
                        </Label>
                        <Input
                          id="current_position"
                          value={formData.current_position || ''}
                          onChange={(e) => handleInputChange('current_position', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার বর্তমান পদ' : 'Your current position'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">
                          {language === 'bn' ? 'বিভাগ' : 'Department'}
                        </Label>
                        <Input
                          id="department"
                          value={formData.department || ''}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার বিভাগ' : 'Your department'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="office_name">
                          {language === 'bn' ? 'অফিসের নাম' : 'Office Name'}
                        </Label>
                        <Input
                          id="office_name"
                          value={formData.office_name || ''}
                          onChange={(e) => handleInputChange('office_name', e.target.value)}
                          placeholder={language === 'bn' ? 'আপনার অফিসের নাম' : 'Your office name'}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="joining_date">
                          {language === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}
                        </Label>
                        <Input
                          id="joining_date"
                          type="date"
                          value={formData.joining_date || ''}
                          onChange={(e) => handleInputChange('joining_date', e.target.value)}
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
                    onClick={() => fetchProfile()}
                    disabled={loading}
                  >
                    {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading 
                      ? (language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') 
                      : (language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')
                    }
                  </Button>
                </div>
              </form>
            </div>
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
