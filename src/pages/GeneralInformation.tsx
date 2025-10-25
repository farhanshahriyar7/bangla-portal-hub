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
import { Menu, Bell, Edit, Download, Eye, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  // List view state
  const [generalInfoList, setGeneralInfoList] = useState<GeneralInfoRow[]>([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<GeneralInfoRow | null>(null);
  const [formData, setFormData] = useState<Partial<GeneralInfoRow>>({});
  // Selection state for table rows
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

      // Fetch general_information records for user
      const { data: genDataList, error: genError } = await supabase
        .from('general_information')
        .select('*')
        .eq('user_id', user.id);

      if (genError) throw genError;
      if (genDataList && genDataList.length > 0) {
        setGeneralInfoList(genDataList as GeneralInfoRow[]);
        // Set the first record as the current general info
        setGeneral(genDataList[0] as GeneralInfoRow);
        setSpecialCase(Boolean((genDataList[0] as GeneralInfoRow).special_case));
      } else {
        setGeneralInfoList([]);
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
    { key: 'joining_date', labelBn: 'সরকারী চাকরিতে যোগদানের তারিখ', labelEn: 'Joining Date', type: 'date' },
    { key: 'phone', labelBn: 'ফোন', labelEn: 'Phone' },
    { key: 'email', labelBn: 'ই-মেইল', labelEn: 'Email' },
  ];

  // Missing general fields to collect
  // Reordered and extended per user request
  const missingGeneralFields: Array<{ key: keyof GeneralInfoRow; labelBn: string; labelEn: string; type?: string }> = [
    { key: 'father_name', labelBn: 'পিতার নাম', labelEn: "Father's Name" },
    { key: 'mother_name', labelBn: 'মাতার নাম', labelEn: "Mother's Name" },
    { key: 'blood_group', labelBn: 'রক্তের গ্রুপ', labelEn: 'Blood Group' },
    { key: 'current_address', labelBn: 'আপনার বর্তমান ঠিকানা', labelEn: 'Your Current Address' },
    // { key: 'office_address', labelBn: 'অফিসের ঠিকানা', labelEn: 'Office Address' },
    { key: 'current_position_joining_date', labelBn: 'বর্তমান পদে যোগদানের তারিখ', labelEn: 'Current Position Joining Date', type: 'date' },
    { key: 'workplace_address', labelBn: 'কর্মস্থলের ঠিকানা', labelEn: 'Workplace Address' },
    { key: 'workplace_phone', labelBn: 'কর্মস্থলের ফোন নম্বর', labelEn: 'Workplace Phone' },
    { key: 'confirmation_order_number', labelBn: 'চাকরি স্থায়ীকরণের সরকারি আদেশ নং', labelEn: 'Confirmation Order No.' },
    { key: 'confirmation_order_date', labelBn: 'চাকরি স্থায়ীকরণের সরকারি আদেশ তারিখ', labelEn: 'Confirmation Order Date', type: 'date' },
    { key: 'mobile_phone', labelBn: 'মোবাইল ফোন', labelEn: 'Mobile Phone' },
  ];

  // Blood group options used in both Add and Edit forms
  const bloodGroupOptions = [
    { value: 'A+ve', label: 'A+ve (A positive)' },
    { value: 'A-ve', label: 'A−ve (A negative)' },
    { value: 'B+ve', label: 'B+ve (B positive)' },
    { value: 'B-ve', label: 'B−ve (B negative)' },
    { value: 'AB+ve', label: 'AB+ve (AB positive)' },
    { value: 'AB-ve', label: 'AB−ve (AB negative)' },
    { value: 'O+ve', label: 'O+ve (O positive)' },
    { value: 'O-ve', label: 'O−ve (O negative)' },
  ];

  const handleProfileDraftChange = (key: keyof ProfileRow, value: string | null | undefined) => {
    setProfileDraft((p) => ({ ...p, [key]: value }));

  };

  const handleGeneralChange = (key: keyof GeneralInfoRow, value: string | null | undefined) => {
    setGeneral((g) => ({ ...g, [key]: value }));
  };

  const handleFormChange = (key: keyof GeneralInfoRow, value: string | null | undefined) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    // Prepare form for creating a new general_information record.
    // Clear the current `general` object so inputs start empty and we will
    // perform an INSERT on save rather than updating an existing row.
    setGeneral({});
    setSpecialCase(false);
    setIsCreatingNew(true);
    setIsFormOpen(true);
  };

  const openViewModal = (record: GeneralInfoRow) => {
    setCurrentRecord(record);
    setIsViewOpen(true);
  };

  const openEditModal = (record: GeneralInfoRow) => {
    setCurrentRecord(record);
    setFormData(record);
    setSpecialCase(Boolean(record.special_case));
    setIsEditOpen(true);
  };

  // Toggle a single row selection
  const toggleRowSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Toggle select all / clear all
  const toggleSelectAll = () => {
    if (selectedIds.length === generalInfoList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(generalInfoList.map((r) => r.id!).filter(Boolean));
    }
  };
  // Delete confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'selected' | 'all' | null>(null);

  // Open confirmation for deleting selected rows
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast({ title: language === 'bn' ? 'নির্বাচন নেই' : 'No selection', description: language === 'bn' ? 'অনুগ্রহ করে প্রথমে একটি বা একাধিক সারি নির্বাচন করুন' : 'Please select one or more rows first', variant: 'destructive' });
      return;
    }
    setDeleteMode('selected');
    setDeleteConfirmOpen(true);
  };

  // Open confirmation for deleting all rows
  const handleDeleteAll = () => {
    setDeleteMode('all');
    setDeleteConfirmOpen(true);
  };

  // Perform deletion after user confirms in-modal
  const performDeleteConfirmed = async () => {
    if (!deleteMode) return;
    try {
      setLoading(true);
      if (deleteMode === 'selected') {
        const { error } = await supabase.from('general_information').delete().in('id', selectedIds);
        if (error) throw error;
        toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'নির্বাচিত তথ্য মুছে ফেলা হয়েছে' : 'Selected items deleted' });
        setSelectedIds([]);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthenticated');
        const { error } = await supabase.from('general_information').delete().eq('user_id', user.id);
        if (error) throw error;
        toast({ title: language === 'bn' ? 'সফল' : 'Success', description: language === 'bn' ? 'সব তথ্য মুছে ফেলা হয়েছে' : 'All records deleted' });
        setSelectedIds([]);
      }
      await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'মুছতে ব্যর্থ হয়েছে' : 'Failed to delete', variant: 'destructive' });
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setDeleteMode(null);
    }
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
  // Whether the Add form is creating a new record (true) or editing current (false)
  const [isCreatingNew, setIsCreatingNew] = useState(false);

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

      if (isCreatingNew) {
        const { error: insertErr } = await supabase
          .from('general_information')
          .insert(genInsert as Database['public']['Tables']['general_information']['Insert']);
        if (insertErr) throw insertErr;
      } else {
        const { data: existingGen, error: selectErr } = await supabase
          .from('general_information')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (selectErr) throw selectErr;

        if (existingGen && (existingGen as { id: string }).id) {
          const { error: updateErr } = await supabase
            .from('general_information')
            .update(genInsert as Database['public']['Tables']['general_information']['Update'])
            .eq('id', (existingGen as { id: string }).id);
          if (updateErr) throw updateErr;
        } else {
          const { error: insertErr } = await supabase
            .from('general_information')
            .insert(genInsert as Database['public']['Tables']['general_information']['Insert']);
          if (insertErr) throw insertErr;
        }
      }

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
  const handleDownloadXLSX = () => {
    const exportData = generalInfoList.map((record) => ({
      [language === 'bn' ? 'পূর্ণ নাম' : 'Full Name']: profile?.full_name || '',
      [language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth']: profile?.date_of_birth || '', // added date of birth
      [language === 'bn' ? 'পিতার নাম' : "Father's Name"]: record.father_name || '',
      [language === 'bn' ? 'মাতার নাম' : "Mother's Name"]: record.mother_name || '',
      [language === 'bn' ? 'স্থায়ী ঠিকানা' : 'Permanent Address']: profile?.address_line1 || '', // added address_line1
      [language === 'bn' ? 'বর্তমান ঠিকানা' : 'Current Address']: record.current_address || '',
      [language === 'bn' ? 'নিজ জেলা' : 'District']: profile?.district || '', // added district
      [language === 'bn' ? 'সরকারী চাকরিতে যোগদানের তারিখ' : 'Joining Date']: profile?.joining_date || '', // added joining date
      [language === 'bn' ? 'বর্তমান পদে যোগদানের তারিখ' : 'Current Position Joining Date']: record.current_position_joining_date || '',
      [language === 'bn' ? 'বর্তমান পদবী' : 'Designation']: profile?.designation || '', // added designation
      [language === 'bn' ? 'কর্মস্থলের ঠিকানা' : 'Workplace Address']: record.workplace_address || '',
      [language === 'bn' ? 'কর্মস্থলের ফোন' : 'Workplace Phone']: record.workplace_phone || '',
      [language === 'bn' ? 'অফিসের ঠিকানা' : 'Office Address']: record.office_address || '',
      [language === 'bn' ? 'চাকরি স্থায়ীকরণের সরকারী আদেশ নং' : 'Confirmation Order No.']: record.confirmation_order_number || '',
      [language === 'bn' ? 'চাকরি স্থায়ীকরণের সরকারী আদেশ তারিখ' : 'Confirmation Order Date']: record.confirmation_order_date || '',
      [language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group']: record.blood_group || '',
      [language === 'bn' ? 'ফোন' : 'Phone']: profile?.phone || '', // added phone
      [language === 'bn' ? 'মোবাইল ফোন' : 'Mobile Phone']: record.mobile_phone || '',
      [language === 'bn' ? 'ই-মেইল' : 'Email']: profile?.email || '', // added email
      [language === 'bn' ? 'বিশেষ ক্ষেত্রে' : 'Special Case']: record.special_case ? (language === 'bn' ? 'হ্যাঁ' : 'Yes') : (language === 'bn' ? 'না' : 'No'),
      [language === 'bn' ? 'বিশেষ রোগের তথ্য' : 'Special Illness Info']: record.special_illness_info || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, language === 'bn' ? 'সাধারণ তথ্য' : 'General Information');
    XLSX.writeFile(workbook, `general_information_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: language === 'bn' ? 'ডাউনলোড সফল' : 'Download Successful',
      description: language === 'bn' ? 'ফাইলটি ডাউনলোড হয়েছে' : 'File has been downloaded',
    });
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

    if (section === 'notifications') {
      navigate('/notifications');
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
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{language === 'bn' ? 'সাধারণ তথ্যাবলি' : 'General Information'}</h1>
                  <p className="text-muted-foreground mt-1">{language === 'bn' ? 'অনুগ্রহ করে আপনার তথ্য যাচাই ও সম্পূর্ণ করুন' : 'Please verify and complete your information'}</p>
                </div>
                <div className="flex gap-2">
                  {/* form btn */}
                  <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    {language === 'bn' ? 'নতুন তথ্য' : 'New Information'}
                  </Button>

                  {/* Delete selected */}
                  <Button onClick={handleDeleteSelected} variant="destructive" className="hidden sm:inline-flex" disabled={selectedIds.length === 0}>
                    {language === 'bn' ? 'মুছুন' : 'Delete'}
                  </Button>

                  {/* Delete all */}
                  <Button onClick={handleDeleteAll} variant="destructive" className="hidden sm:inline-flex bg-red-950 hover:bg-red-900 text-white">
                    {language === 'bn' ? 'সব মুছুন' : 'Delete All'}
                  </Button>

                  {/* download btn */}
                  <Button onClick={handleDownloadXLSX} variant="outline" className="bg-white hover:bg-black underline text-black hover:text-white">
                    <Download className="mr-2 h-4 w-4" />
                    {language === 'bn' ? 'ডাউনলোড' : 'Download'}
                  </Button>
                </div>
              </div>

              {/* Table View */}
              <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-800 text-white hover:bg-green-800 border-b-[2px] border-green-900 dark:border-green-700 shadow-sm">
                      <TableHead className="font-semibold text-left text-white text-xs">
                        <Checkbox
                          checked={selectedIds.length > 0 && selectedIds.length === generalInfoList.length}
                          onCheckedChange={toggleSelectAll}
                          id="select-all"
                          className='bg-white border-2 border-green-700 dark:border-green-600 hover:border-green-900 hover:dark:border-green-500'
                        />
                      </TableHead>
                      <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">
                        {language === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                      </TableHead>
                      <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">
                        {language === 'bn' ? 'পিতার নাম' : "Father's Name"}
                      </TableHead>
                      <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">
                        {language === 'bn' ? 'মাতার নাম' : "Mother's Name"}
                      </TableHead>
                      <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">
                        {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                      </TableHead>
                      <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">
                        {language === 'bn' ? 'জেলা' : 'District'}
                      </TableHead>
                      <TableHead className="text-primary-foreground font-semibold text-center text-xs border-r-[1.25px] border-green-700 dark:border-green-600">
                        {language === 'bn' ? 'কার্যক্রম' : 'Actions'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-2 text-muted-foreground">
                          {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                        </TableCell>
                      </TableRow>
                    ) : generalInfoList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-2 text-muted-foreground">
                          {language === 'bn' ? 'কোন তথ্য পাওয়া যায়নি' : 'No records found'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      generalInfoList.map((record) => (
                        <TableRow key={record.id} className="hover:bg-muted/50">
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedIds.includes(record.id!)}
                              onCheckedChange={() => toggleRowSelection(record.id!)}
                              id={`select-${record.id}`}
                            />
                          </TableCell>
                          <TableCell className="py-0.5 px-2 text-xs text-left border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700">{profile?.full_name || '-'}</TableCell>
                          <TableCell className='py-0.5 px-2 text-xs text-left border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700'>{record.father_name || '-'}</TableCell>
                          <TableCell className='py-0.5 px-2 text-xs text-left border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700'>{record.mother_name || '-'}</TableCell>
                          <TableCell className='py-0.5 px-2 text-xs text-left border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700'>{record.blood_group || '-'}</TableCell>
                          <TableCell className='py-0.5 px-2 text-xs text-left border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700'>{profile?.district || '-'}</TableCell>
                          <TableCell className='py-0.5 px-2 text-xs text-left border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700'>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewModal(record)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(record)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Form submit comes as modal */}
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>

                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{language === 'bn' ? 'নতুন সাধারণ তথ্য যোগ করুন' : 'Add General Information'}</DialogTitle>
                    <DialogDescription>{language === 'bn' ? 'নিচের ফর্মটি পূরণ করুন। সকল তথ্য সঠিকভাবে প্রদান করুন।' : 'Fill the form below. Provide all information accurately.'}</DialogDescription>
                  </DialogHeader>


                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <section>
                      <div className='mb-4'>
                        {/* <div className='flex items-center justify-between mb-4'> */}
                        <h3 className="font-semibold text-destructive">{language === 'bn' ? 'স্বয়ংক্রিয়ভাবে লোডিত প্রোফাইল' : 'Auto-filled profile'}</h3>
                        {/* <div className="flex items-center gap-2"> */}
                        <div className="gap-2">
                          <p className="text-sm text-muted-foreground">{language === 'bn' ? '* আপনার প্রোফাইল তথ্য এখানে প্রদর্শিত হচ্ছে। প্রয়োজনে প্রোফাইলে যান এবং সেখান থেকে এটি পরিবর্তন করুন। ' : '* Your profile information is displayed here. If necessary go to profile and change it from there.'}</p>
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
                              {f.key === 'blood_group' ? (
                                <select
                                  id={`gen-${String(f.key)}`}
                                  className="w-full rounded-md border input px-3 py-2"
                                  value={String(val ?? '')}
                                  onChange={(e) => handleGeneralChange(f.key, e.target.value)}
                                >
                                  <option value="">{language === 'bn' ? 'অনুগ্রহ করে নির্বাচন করুন' : 'Please select'}</option>
                                  {bloodGroupOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  id={`gen-${String(f.key)}`}
                                  type={f.type === 'date' ? 'date' : 'text'}
                                  value={String(val ?? '')}
                                  onChange={(e) => handleGeneralChange(f.key, e.target.value)}
                                  placeholder={language === 'bn' ? 'অনুগ্রহ করে লিখুন' : 'Please enter'}
                                />
                              )}
                            </div>
                          );
                        })}
                        <div className="col-span-1 md:col-span-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox checked={specialCase} onCheckedChange={(v) => setSpecialCase(Boolean(v))} id="special-case" />
                            <Label htmlFor="special-case">{language === 'bn' ? 'বিশেষ ক্ষেত্রে প্রযোজ্য' : 'Special Case purpose'}</Label>
                          </div>

                          {specialCase && (
                            <div className="mt-2">
                              <Label htmlFor="special_illness_info">{language === 'bn' ? 'বিশেষ কোন রোগে ভুগিলে তার তথ্য' : 'Special illness information'}</Label>
                              <Input id="special_illness_info" type="text" placeholder={language === 'bn' ? 'আপনার দৈহিক অবস্থা' : 'Your condition details'}
                                value={String((general as Partial<GeneralInfoRow>).special_illness_info ?? '')} onChange={(e) => handleGeneralChange('special_illness_info', e.target.value)} />
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

      {/* Confirmation dialog for deletions (selected / all) */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}</DialogTitle>
            <DialogDescription>
              {deleteMode === 'selected'
                ? (language === 'bn' ? 'আপনি নির্বাচিত আইটেম(গুলি) স্থায়ভাবে মুছে ফেলতে যাচ্ছেন। এটি পূর্বাবস্থায় ফেরত আনবে না।' : 'You are about to permanently delete the selected items. This cannot be undone.')
                : (language === 'bn' ? 'আপনি সকল তথ্য স্থায়ভাবে মুছে ফেলতে যাচ্ছেন। এটি পূর্বাবস্থায় ফেরত আনবে না।' : 'You are about to permanently delete ALL records. This cannot be undone.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirmOpen(false); setDeleteMode(null); }}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
            <Button className="bg-destructive hover:bg-red-950 text-white" onClick={performDeleteConfirmed}>{language === 'bn' ? 'মুছুন' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'সাধারণ তথ্য বিবরণ' : 'General Information Details'}</DialogTitle>
          </DialogHeader>
          {currentRecord && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'পিতার নাম' : "Father's Name"}</Label>
                <p className="font-medium">{currentRecord.father_name || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'মাতার নাম' : "Mother's Name"}</Label>
                <p className="font-medium">{currentRecord.mother_name || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}</Label>
                <p className="font-medium">{currentRecord.blood_group || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'বর্তমান ঠিকানা' : 'Current Address'}</Label>
                <p className="font-medium">{currentRecord.current_address || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'অফিসের ঠিকানা' : 'Office Address'}</Label>
                <p className="font-medium">{currentRecord.office_address || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'বর্তমান পদে যোগদানের তারিখ' : 'Current Position Joining Date'}</Label>
                <p className="font-medium">{currentRecord.current_position_joining_date || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'কর্মস্থলের ঠিকানা' : 'Workplace Address'}</Label>
                <p className="font-medium">{currentRecord.workplace_address || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'কর্মস্থলের ফোন' : 'Workplace Phone'}</Label>
                <p className="font-medium">{currentRecord.workplace_phone || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'স্থায়ীকরণ আদেশ নং' : 'Confirmation Order No.'}</Label>
                <p className="font-medium">{currentRecord.confirmation_order_number || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'স্থায়ীকরণ আদেশ তারিখ' : 'Confirmation Order Date'}</Label>
                <p className="font-medium">{currentRecord.confirmation_order_date || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'মোবাইল ফোন' : 'Mobile Phone'}</Label>
                <p className="font-medium">{currentRecord.mobile_phone || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{language === 'bn' ? 'বিশেষ ক্ষেত্রে' : 'Special Case'}</Label>
                <p className="font-medium">{currentRecord.special_case ? (language === 'bn' ? 'হ্যাঁ' : 'Yes') : (language === 'bn' ? 'না' : 'No')}</p>
              </div>
              {currentRecord.special_case && currentRecord.special_illness_info && (
                <div className="col-span-2">
                  <Label className="text-muted-foreground">{language === 'bn' ? 'বিশেষ রোগের তথ্য' : 'Special Illness Info'}</Label>
                  <p className="font-medium">{currentRecord.special_illness_info}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'সাধারণ তথ্য সম্পাদনা' : 'Edit General Information'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!currentRecord) return;

            try {
              setLoading(true);
              const { error } = await supabase
                .from('general_information')
                .update({
                  ...formData,
                  special_case: specialCase,
                })
                .eq('id', currentRecord.id);

              if (error) throw error;

              toast({
                title: language === 'bn' ? 'সফল' : 'Success',
                description: language === 'bn' ? 'তথ্য আপডেট করা হয়েছে' : 'Information updated successfully',
              });

              setIsEditOpen(false);
              fetchData();
            } catch (error) {
              console.error('Update error:', error);
              toast({
                title: language === 'bn' ? 'ত্রুটি' : 'Error',
                description: language === 'bn' ? 'আপডেট করতে ব্যর্থ' : 'Failed to update',
                variant: 'destructive',
              });
            } finally {
              setLoading(false);
            }
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingGeneralFields.map((f) => {
                const editVal = (formData as Partial<GeneralInfoRow>)[f.key];
                return (
                  <div className="space-y-2" key={String(f.key)}>
                    <Label htmlFor={`edit-${String(f.key)}`}>{language === 'bn' ? f.labelBn : f.labelEn}</Label>
                    {f.key === 'blood_group' ? (
                      <select
                        id={`edit-${String(f.key)}`}
                        className="w-full rounded-md border input px-3 py-2"
                        value={String(editVal ?? '')}
                        onChange={(e) => handleFormChange(f.key, e.target.value)}
                      >
                        <option value="" className='text-base'>{language === 'bn' ? 'আপনার রক্তের গ্রুপ নির্বাচন করুন' : 'Please select'}</option>
                        {bloodGroupOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={`edit-${String(f.key)}`}
                        type={f.type === 'date' ? 'date' : 'text'}
                        value={String(editVal ?? '')}
                        onChange={(e) => handleFormChange(f.key, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={specialCase} onCheckedChange={(v) => setSpecialCase(Boolean(v))} id="edit-special-case" />
                  <Label htmlFor="edit-special-case">{language === 'bn' ? 'বিশেষ ক্ষেত্রে প্রযোজ্য' : 'Special Case'}</Label>
                </div>
                {specialCase && (
                  <div className="mt-2">
                    <Label htmlFor="edit-special_illness_info">{language === 'bn' ? 'বিশেষ কোন রোগে ভুগিলে তার তথ্য' : 'Special illness information'}</Label>
                    <Input
                      id="edit-special_illness_info"
                      type="text"
                      value={String((formData as Partial<GeneralInfoRow>).special_illness_info ?? '')}
                      onChange={(e) => handleFormChange('special_illness_info', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>{language === 'bn' ? 'বাতিল' : 'Cancel'}</Button>
              <Button type="submit">{language === 'bn' ? 'আপডেট করুন' : 'Update'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
