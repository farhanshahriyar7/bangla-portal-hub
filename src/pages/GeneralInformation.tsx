import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CopyRights } from '@/components/CopyRights';
import { Menu, Bell, Edit } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

interface GeneralInformationProps {
  language?: 'bn' | 'en';
}

interface ProfileRow {
  id: string;
  full_name?: string | null;
  date_of_birth?: string | null;
  designation?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  district?: string | null;
  joining_date?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface GeneralInfoRow {
  id?: string;
  user_id: string;
  father_name?: string | null;
  mother_name?: string | null;
  office_address?: string | null;
  blood_group?: string | null;
  current_position_joining_date?: string | null;
  workplace_address?: string | null;
  workplace_phone?: string | null;
  current_address?: string | null;
  confirmation_order_number?: string | null;
  confirmation_order_date?: string | null;
  mobile_phone?: string | null;
  // special illness information (replaces correction_date)
  special_illness_info?: string | null;
  special_case?: boolean | null;
}

export default function GeneralInformation({ language: initialLanguage = 'bn' }: GeneralInformationProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  // profile (auto-filled) state and edit toggle
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileDraft, setProfileDraft] = useState<Partial<ProfileRow>>({});
  const [editProfileFields, setEditProfileFields] = useState(false);

  // general information state (user-supplied)
  const [general, setGeneral] = useState<Partial<GeneralInfoRow>>({});
  const [specialCase, setSpecialCase] = useState(false);

  // Fetch profile + general information for the logged-in user
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === 'bn' ? 'ত্রুটি' : 'Error',
          description: language === 'bn' ? 'অনুগ্রহ করে লগইন করুন' : 'Please login first',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      // Fetch profile row
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(
          'id, full_name, date_of_birth, designation, address_line1, address_line2, district, joining_date, phone, email'
        )
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (profiles) {
        setProfile(profiles as ProfileRow);
        setProfileDraft(profiles as ProfileRow);
      } else {
        setProfile(null);
        setProfileDraft({});
      }

      // Fetch general_information row for user (if exists)
      const { data: genData, error: genError } = await supabase
        .from('general_information')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (genError) throw genError;
      if (genData) {
        setGeneral(genData as GeneralInfoRow);
        setSpecialCase(Boolean((genData as GeneralInfoRow).special_case));
      } else {
        setGeneral({ user_id: user.id });
        setSpecialCase(false);
      }
    } catch (error) {
      console.error('Error fetching profile/general:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'তথ্য লোড করতে ব্যর্থ হয়েছে' : 'Failed to load information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fields to present as auto-filled
  const autoFields: Array<{ key: keyof ProfileRow; labelBn: string; labelEn: string; type?: string }> = [
    { key: 'full_name', labelBn: 'নাম', labelEn: 'Full Name' },
    { key: 'date_of_birth', labelBn: 'জন্ম তারিখ', labelEn: 'Date of Birth', type: 'date' },
    { key: 'designation', labelBn: 'বর্তমান পদবী', labelEn: 'Designation' },
    { key: 'address_line1', labelBn: 'স্থায়ী ঠিকানা', labelEn: 'Permanent Address' },
    { key: 'district', labelBn: 'নিজ জেলা', labelEn: 'District' },
    { key: 'joining_date', labelBn: 'চাকরিতে যোগদানের তারিখ', labelEn: 'Joining Date', type: 'date' },
    { key: 'phone', labelBn: 'ফোন', labelEn: 'Phone' },
    { key: 'email', labelBn: 'ই-মেইল', labelEn: 'Email' },
  ];

  // Missing general fields to collect
  // Reordered and extended per user request
  const missingGeneralFields: Array<{ key: keyof GeneralInfoRow; labelBn: string; labelEn: string; type?: string }> = [
    { key: 'father_name', labelBn: 'পিতার নাম', labelEn: "Father's Name" },
    { key: 'mother_name', labelBn: 'মাতার নাম', labelEn: "Mother's Name" },
    { key: 'office_address', labelBn: 'অফিসের ঠিকানা', labelEn: 'Office Address' },
    { key: 'blood_group', labelBn: 'রক্তের গ্রুপ', labelEn: 'Blood Group' },
    { key: 'current_position_joining_date', labelBn: 'বর্তমান পদে যোগদানের তারিখ', labelEn: 'Current Position Joining Date', type: 'date' },
    { key: 'workplace_address', labelBn: 'কর্মস্থলের ঠিকানা', labelEn: 'Workplace Address' },
    { key: 'workplace_phone', labelBn: 'কর্মস্থলের ফোন নম্বর', labelEn: 'Workplace Phone' },
    { key: 'current_address', labelBn: 'বর্তমান ঠিকানা', labelEn: 'Current Address' },
    { key: 'confirmation_order_number', labelBn: 'চাকরি স্থায়ীকরণের সরকারি আদেশ নং', labelEn: 'Confirmation Order No.' },
    { key: 'confirmation_order_date', labelBn: 'চাকরি স্থায়ীকরণের সরকারি আদেশ তারিখ', labelEn: 'Confirmation Order Date', type: 'date' },
    { key: 'mobile_phone', labelBn: 'মোবাইল ফোন', labelEn: 'Mobile Phone' },
  ];

  const handleProfileDraftChange = (key: keyof ProfileRow, value: string | null | undefined) => {
    setProfileDraft((p) => ({ ...p, [key]: value }));
  };

  const handleGeneralChange = (key: keyof GeneralInfoRow, value: string | null | undefined) => {
    setGeneral((g) => ({ ...g, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // If profile edits are enabled, open confirmation dialog first
    if (editProfileFields) {
      setConfirmOpen(true);
      // store the submit event? not needed — we'll proceed from confirm handler
      return;
    }

    // otherwise do the normal save (only general_information)
    await performSave({ updateProfile: false });
  };

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Centralized save routine: optionally update profiles as well
  const performSave = async ({ updateProfile }: { updateProfile: boolean }) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === 'bn' ? 'ত্রুটি' : 'Error',
          description: language === 'bn' ? 'অনুগ্রহ করে লগইন করুন' : 'Please login first',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      const genPayload: Partial<GeneralInfoRow> = {
        ...general,
        user_id: user.id,
        special_case: specialCase || false,
      };

      const genInsert = genPayload as Database['public']['Tables']['general_information']['Insert'];
      const { error: upsertErr } = await supabase
        .from('general_information')
        .upsert(genInsert, { onConflict: 'user_id' });

      if (upsertErr) throw upsertErr;

      if (updateProfile) {
        const updatePayload: Partial<ProfileRow> = {};
        autoFields.forEach((f) => {
          const val = (profileDraft as Partial<ProfileRow>)[f.key];
          if (val !== undefined) (updatePayload as unknown as Record<string, unknown>)[f.key] = val || null;
        });

        const hasChanges = Object.keys(updatePayload).length > 0;
        if (hasChanges) {
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', user.id);
          if (profileUpdateError) throw profileUpdateError;
        }
      }

      toast({
        title: language === 'bn' ? 'সংরক্ষণ সম্পন্ন' : 'Save completed',
        description: language === 'bn' ? 'তথ্য সফলভাবে সংরক্ষিত হয়েছে' : 'Information saved successfully',
      });

      await fetchData();
      setEditProfileFields(false);
      // close the form modal after successful save
      setIsFormOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to save information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const missingFieldsList = missingGeneralFields.filter((f) => {
    const val = (general as Partial<GeneralInfoRow>)[f.key];
    return !val || String(val).trim() === '';
  });

  // Navigation handler similar to OfficeInformation
  const handleNavigation = async (section: string) => {
    if (section === 'dashboard') {
      navigate('/');
      return;
    }

    if (section === 'office-information') {
      navigate('/office-information');
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
      <div className="min-h-screen w-full bg-background flex">
        <AppSidebar language={language} onNavigate={handleNavigation} />

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => handleNavigation('notifications')} className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </Button>
                <LanguageToggle onLanguageChange={setLanguage} currentLanguage={language} />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{language === 'bn' ? 'সাধারণ তথ্যাবলি' : 'General Information'}</h1>
                  <p className="text-muted-foreground mt-1">{language === 'bn' ? 'অনুগ্রহ করে আপনার তথ্য যাচাই ও সম্পূর্ণ করুন' : 'Please verify and complete your information'}</p>
                </div>
              </div>

              {/* Form as modal (matches sample) */}
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <div className="flex items-center gap-2 justify-end">
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      + {language === 'bn' ? 'নতুন তথ্য' : 'New Information'}
                    </Button>
                  </DialogTrigger>
                </div>

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{language === 'bn' ? 'নতুন সাধারণ তথ্য যোগ করুন' : 'Add General Information'}</DialogTitle>
                    <DialogDescription>{language === 'bn' ? 'নিচের ফর্মটি পূরণ করুন। সকল তথ্য সঠিকভাবে প্রদান করুন।' : 'Fill the form below. Provide all information accurately.'}</DialogDescription>
                  </DialogHeader>


                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <section>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className="font-semibold mb-3">{language === 'bn' ? 'স্বয়ংক্রিয়ভাবে লোডিত প্রোফাইল' : 'Auto-filled profile'}</h3>
                        <div className="flex items-center gap-2">
                          {/* <Button variant={editProfileFields ? 'default' : 'outline'} onClick={() => setEditProfileFields((s) => !s)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {language === 'bn' ? (editProfileFields ? 'প্রোফাইল সম্পাদনা চলছে' : 'প্রোফাইল সম্পাদনা') : (editProfileFields ? 'Editing Profile' : 'Edit Profile')}
                          </Button> */}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {autoFields.map((f) => {
                          const raw = (profileDraft as Partial<ProfileRow>)[f.key];
                          const value = raw ?? '';
                          const inputType = f.type === 'date' ? 'date' : 'text';
                          return (
                            <div className="space-y-2" key={String(f.key)}>
                              <Label htmlFor={`auto-${String(f.key)}`}>{language === 'bn' ? f.labelBn : f.labelEn}</Label>
                              <Input
                                id={`auto-${String(f.key)}`}
                                type={inputType}
                                value={String(value)}
                                onChange={(e) => handleProfileDraftChange(f.key, e.target.value)}
                                readOnly={!editProfileFields}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-3">{language === 'bn' ? 'অতিরিক্ত সাধারণ তথ্য' : 'Additional General Information'}</h3>
                      {missingFieldsList.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">{language === 'bn' ? 'অনুগ্রহ করে নিচের অনুপস্থিত ক্ষেত্রগুলো পূরণ করুন' : 'Please fill the missing fields below'}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {missingGeneralFields.map((f) => {
                          const val = (general as Partial<GeneralInfoRow>)[f.key];
                          return (
                            <div className="space-y-2" key={String(f.key)}>
                              <Label htmlFor={`gen-${String(f.key)}`}>{language === 'bn' ? f.labelBn : f.labelEn}</Label>
                              <Input
                                id={`gen-${String(f.key)}`}
                                type={f.type === 'date' ? 'date' : 'text'}
                                value={String(val ?? '')}
                                onChange={(e) => handleGeneralChange(f.key, e.target.value)}
                                placeholder={language === 'bn' ? 'অনুগ্রহ করে লিখুন' : 'Please enter'}
                              />
                            </div>
                          );
                        })}
                        <div className="col-span-1 md:col-span-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox checked={specialCase} onCheckedChange={(v) => setSpecialCase(Boolean(v))} id="special-case" />
                            <Label htmlFor="special-case">{language === 'bn' ? 'বিশেষ ক্ষেত্রে' : 'Special Case'}</Label>
                          </div>

                          {specialCase && (
                            <div className="mt-2">
                              <Label htmlFor="special_illness_info">{language === 'bn' ? 'বিশেষ কোন রোগে ভুগিলে তার তথ্য' : 'Special illness information'}</Label>
                              <Input id="special_illness_info" type="text" value={String((general as Partial<GeneralInfoRow>).special_illness_info ?? '')} onChange={(e) => handleGeneralChange('special_illness_info', e.target.value)} />
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); fetchData(); }}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
                      <Button type="submit" className="bg-primary text-primary-foreground">{language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </main>

          <footer className="border-t border-border bg-card/50 py-4 px-6 text-center">
            <p className="text-sm text-muted-foreground"><CopyRights /></p>
          </footer>
        </SidebarInset>
      </div>
      {/* Confirmation dialog for profile updates */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}</DialogTitle>
            <DialogDescription>
              {language === 'bn'
                ? 'আপনি প্রোফাইল তথ্য পরিবর্তন করতে যাচ্ছেন। এটি আপনার প্রধান প্রোফাইল টেবিলে স্থায়ীভাবে পরিবর্তন করবে।'
                : 'You are about to update your profile information. This will permanently change your main profile.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              // Cancel profile update, but still save general info
              setConfirmOpen(false);
              performSave({ updateProfile: false });
            }}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
            <Button className="bg-destructive hover:bg-red-950 text-white" onClick={() => performSave({ updateProfile: true })}>{language === 'bn' ? 'হ্যাঁ, আপডেট করুন' : 'Yes, update'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

