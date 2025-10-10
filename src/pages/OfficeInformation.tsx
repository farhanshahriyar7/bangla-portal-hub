import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Plus, Menu, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { CopyRights } from "@/components/CopyRights";

interface OfficeInfoData {
  id: string;
  user_id?: string;
  ministry: string;
  directorate: string;
  identity_number: string;
  nid: string;
  tin: string;
  birth_place: string;
  village: string;
  upazila: string;
  district: string;
  status: "pending" | "active" | "rejected";
  created_at?: string;
  updated_at?: string;
}

interface OfficeInformationProps {
  language: 'bn' | 'en';
}

export default function OfficeInformation({ language: initialLanguage }: OfficeInformationProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OfficeInfoData | null>(null);
  const [formData, setFormData] = useState<Partial<OfficeInfoData>>({
    ministry: "",
    directorate: "",
    identity_number: "",
    nid: "",
    tin: "",
    birth_place: "",
    village: "",
    upazila: "",
    district: "",
  });
  const [data, setData] = useState<OfficeInfoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from database
  useEffect(() => {
    fetchOfficeInformation();
  }, []);

  const fetchOfficeInformation = async () => {
    try {
      setLoading(true);
      const { data: officeData, error } = await supabase
        .from('office_information')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (officeData) {
        setData(officeData as OfficeInfoData[]);
      }
    } catch (error) {
      console.error('Error fetching office information:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn'
          ? "তথ্য লোড করতে সমস্যা হয়েছে"
          : "Failed to load information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: language === 'bn' ? "ত্রুটি" : "Error",
          description: language === 'bn'
            ? "অনুগ্রহ করে লগইন করুন"
            : "Please login first",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('office_information')
        .insert({
          user_id: user.id,
          ministry: formData.ministry || "",
          directorate: formData.directorate || "",
          identity_number: formData.identity_number || "",
          nid: formData.nid || "",
          tin: formData.tin || "",
          birth_place: formData.birth_place || "",
          village: formData.village || "",
          upazila: formData.upazila || "",
          district: formData.district || "",
          status: "pending",
        });

      if (error) throw error;

      await fetchOfficeInformation();
      setIsDialogOpen(false);
      setFormData({});

      toast({
        title: language === 'bn' ? "সফলভাবে যোগ করা হয়েছে" : "Successfully Added",
        description: language === 'bn' ? "নতুন তথ্য সংরক্ষিত হয়েছে" : "New information has been saved",
      });
    } catch (error) {
      console.error('Error adding office information:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn'
          ? "তথ্য সংরক্ষণ করতে সমস্যা হয়েছে"
          : "Failed to save information",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('office_information')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchOfficeInformation();
      toast({
        title: language === 'bn' ? "মুছে ফেলা হয়েছে" : "Deleted",
        description: language === 'bn' ? "তথ্য মুছে ফেলা হয়েছে" : "Information has been deleted",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error deleting office information:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn'
          ? "তথ্য মুছতে সমস্যা হয়েছে"
          : "Failed to delete information",
        variant: "destructive",
      });
    }
  };

  const handleView = (item: OfficeInfoData) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleEdit = (item: OfficeInfoData) => {
    setSelectedItem(item);
    setFormData({
      ministry: item.ministry,
      directorate: item.directorate,
      identity_number: item.identity_number,
      nid: item.nid,
      tin: item.tin,
      birth_place: item.birth_place,
      village: item.village,
      upazila: item.upazila,
      district: item.district,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('office_information')
        .update({
          ministry: formData.ministry,
          directorate: formData.directorate,
          identity_number: formData.identity_number,
          nid: formData.nid,
          tin: formData.tin,
          birth_place: formData.birth_place,
          village: formData.village,
          upazila: formData.upazila,
          district: formData.district,
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      await fetchOfficeInformation();
      setEditDialogOpen(false);
      setFormData({});
      setSelectedItem(null);

      toast({
        title: language === 'bn' ? "সফলভাবে আপডেট করা হয়েছে" : "Successfully Updated",
        description: language === 'bn' ? "তথ্য আপডেট হয়েছে" : "Information has been updated",
      });
    } catch (error) {
      console.error('Error updating office information:', error);
      toast({
        title: language === 'bn' ? "ত্রুটি" : "Error",
        description: language === 'bn'
          ? "তথ্য আপডেট করতে সমস্যা হয়েছে"
          : "Failed to update information",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      active: { variant: "default", text: language === 'bn' ? "সক্রিয়" : "Active" },
      pending: { variant: "secondary", text: language === 'bn' ? "প্রক্রিয়াধীন" : "Pending" },
      rejected: { variant: "destructive", text: language === 'bn' ? "বাতিল" : "Rejected" },
      // completed: { variant: "outline", text: language === 'bn' ? "সম্পন্ন" : "Completed" },
    };

    const statusInfo = variants[status] || variants.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  const handleNavigation = (section: string) => {
    if (section === 'dashboard') {
      navigate('/');
      return;
    }

    if (section === "security") {
      navigate("/security");
      return;
    }

    if (section === 'settings') {
      navigate('/settings');
      return;
    }

    toast({
      title: language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon',
      description: language === 'bn'
        ? 'এই পেজটি শীঘ্রই উপলব্ধ হবে।'
        : 'This page will be available soon.',
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        <AppSidebar
          language={language}
          onNavigate={handleNavigation}
        />

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
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {language === 'bn' ? 'দাপ্তরিক তথ্যাবলি' : 'Office Information'}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {language === 'bn'
                      ? 'আপনার দাপ্তরিক বিবরণী এবং সরকারি তথ্য পরিচালনা করুন'
                      : 'Manage your official details and government information'}
                  </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      {language === 'bn' ? 'নতুন তথ্য' : 'New Information'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {language === 'bn' ? 'নতুন দাপ্তরিক তথ্য যোগ করুন' : 'Add New Office Information'}
                      </DialogTitle>
                      <DialogDescription>
                        {language === 'bn'
                          ? 'নিচের ফর্মটি পূরণ করুন। সকল তথ্য সঠিকভাবে প্রদান করুন।'
                          : 'Fill in the form below. Provide all information accurately.'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ministry">
                            {language === 'bn' ? 'মন্ত্রণালয়/বিভাগ' : 'Ministry/Division'}
                          </Label>
                          <Input
                            id="ministry"
                            value={formData.ministry}
                            onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="directorate">
                            {language === 'bn' ? 'অধিদপ্তর নাম' : 'Directorate Name'}
                          </Label>
                          <Input
                            id="directorate"
                            value={formData.directorate}
                            onChange={(e) => setFormData({ ...formData, directorate: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="identity_number">
                            {language === 'bn' ? 'পরিচিতি নম্বর (যদি থাকে)' : 'Identity Number (if any)'}
                          </Label>
                          <Input
                            id="identity_number"
                            value={formData.identity_number}
                            onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nid">
                            {language === 'bn' ? 'NID নম্বর' : 'NID Number'}
                          </Label>
                          <Input
                            id="nid"
                            value={formData.nid}
                            onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tin">
                            {language === 'bn' ? 'TIN নম্বর (যদি থাকে)' : 'TIN Number (if any)'}
                          </Label>
                          <Input
                            id="tin"
                            value={formData.tin}
                            onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birth_place">
                            {language === 'bn' ? 'জন্ম স্থান' : 'Birth Place'}
                          </Label>
                          <Input
                            id="birth_place"
                            value={formData.birth_place}
                            onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="village">
                            {language === 'bn' ? 'গ্রাম/ওয়ার্ড' : 'Village/Ward'}
                          </Label>
                          <Input
                            id="village"
                            value={formData.village}
                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="upazila">
                            {language === 'bn' ? 'উপজেলা/থানা' : 'Upazila/Thana'}
                          </Label>
                          <Input
                            id="upazila"
                            value={formData.upazila}
                            onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="district">
                            {language === 'bn' ? 'জেলা' : 'District'}
                          </Label>
                          <Input
                            id="district"
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </Button>
                        <Button type="submit">
                          {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Table */}
              <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-800 text-white hover:bg-green-950 border-b-[2px] border-green-900 dark:border-green-700 shadow-sm">
                        <TableHead className="font-semibold text-white py-2 px-3 text-sm border-r-[1.25px] border-green-700 dark:border-green-600">
                          {language === 'bn' ? 'মন্ত্রণালয়/বিভাগ' : 'Ministry/Division'}
                        </TableHead>
                        <TableHead className="font-semibold text-white py-2 px-3 text-sm border-r-[1.25px] border-green-700 dark:border-green-600">
                          {language === 'bn' ? 'অধিদপ্তর নাম' : 'Directorate Name'}
                        </TableHead>
                        <TableHead className="font-semibold text-white py-2 px-3 text-sm border-r-[1.25px] border-green-700 dark:border-green-600">
                          {language === 'bn' ? 'NID নম্বর' : 'NID Number'}
                        </TableHead>
                        <TableHead className="font-semibold text-white py-2 px-3 text-sm border-r-[1.25px] border-green-700 dark:border-green-600">
                          {language === 'bn' ? 'জেলা' : 'District'}
                        </TableHead>
                        <TableHead className="font-semibold text-white py-2 px-3 text-sm border-r-[1.25px] border-green-700 dark:border-green-600">
                          {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                        </TableHead>
                        <TableHead className="font-semibold text-white text-right py-2 px-3 text-sm">
                          {language === 'bn' ? 'কার্যক্রম' : 'Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                          </TableCell>
                        </TableRow>
                      ) : data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {language === 'bn' ? 'কোন তথ্য পাওয়া যায়নি' : 'No data found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((item) => (
                          <TableRow
                            key={item.id}
                            className="odd:bg-white even:bg-blue-50 hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="text-green-800 font-bold italic py-2 px-3 text-sm border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700">
                              {item.ministry}
                            </TableCell>
                            <TableCell className="py-2 px-3 text-sm border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700 text-foreground dark:text-foreground">
                              {item.directorate}
                            </TableCell>
                            <TableCell className="py-2 px-3 text-sm border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700 text-foreground dark:text-foreground">{item.nid}</TableCell>
                            <TableCell className="py-2 px-3 text-sm border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700 text-foreground dark:text-foreground">{item.district}</TableCell>
                            <TableCell className="py-2 px-3 text-sm border-b-[1px] border-r-[1.25px] border-gray-200 dark:border-gray-700">{getStatusBadge(item.status)}</TableCell>
                            <TableCell className="text-right py-2 px-3 border-b-[1px] border-gray-200 dark:border-gray-700">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleView(item)}
                                  className="h-8 w-8 text-green-950 dark:text-green-200 hover:text-primary font-bold hover:bg-primary/10"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(item)}
                                  className="h-8 w-8 text-green-600 dark:text-green-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(item.id)}
                                  className="h-8 w-8 text-destructive font-bold hover:text-destructive hover:bg-destructive/10 dark:text-destructive/80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'bn' ? 'দাপ্তরিক তথ্য সম্পাদনা' : 'Edit Office Information'}
            </DialogTitle>
            <DialogDescription>
              {language === 'bn'
                ? 'তথ্য আপডেট করুন। সকল তথ্য সঠিকভাবে প্রদান করুন।'
                : 'Update the information. Provide all information accurately.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ministry">
                  {language === 'bn' ? 'মন্ত্রণালয়/বিভাগ' : 'Ministry/Division'}
                </Label>
                <Input
                  id="edit-ministry"
                  value={formData.ministry}
                  onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-directorate">
                  {language === 'bn' ? 'অধিদপ্তর নাম' : 'Directorate Name'}
                </Label>
                <Input
                  id="edit-directorate"
                  value={formData.directorate}
                  onChange={(e) => setFormData({ ...formData, directorate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-identityNumber">
                  {language === 'bn' ? 'পরিচিতি নম্বর (যদি থাকে)' : 'Identity Number (if any)'}
                </Label>
                <Input
                  id="edit-identityNumber"
                  value={formData.identity_number}
                  onChange={(e) => setFormData({ ...formData, identity_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nid">
                  {language === 'bn' ? 'NID নম্বর' : 'NID Number'}
                </Label>
                <Input
                  id="edit-nid"
                  value={formData.nid}
                  onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tin">
                  {language === 'bn' ? 'TIN নম্বর (যদি থাকে)' : 'TIN Number (if any)'}
                </Label>
                <Input
                  id="edit-tin"
                  value={formData.tin}
                  onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-birthPlace">
                  {language === 'bn' ? 'জন্ম স্থান' : 'Birth Place'}
                </Label>
                <Input
                  id="edit-birthPlace"
                  value={formData.birth_place}
                  onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-village">
                  {language === 'bn' ? 'গ্রাম/ওয়ার্ড' : 'Village/Ward'}
                </Label>
                <Input
                  id="edit-village"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-upazila">
                  {language === 'bn' ? 'উপজেলা/থানা' : 'Upazila/Thana'}
                </Label>
                <Input
                  id="edit-upazila"
                  value={formData.upazila}
                  onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-district">
                  {language === 'bn' ? 'জেলা' : 'District'}
                </Label>
                <Input
                  id="edit-district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit">
                {language === 'bn' ? 'আপডেট করুন' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'bn' ? 'দাপ্তরিক তথ্য বিস্তারিত' : 'Office Information Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'মন্ত্রণালয়/বিভাগ' : 'Ministry/Division'}
                </p>
                <p className="text-base font-medium">{selectedItem.ministry}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'অধিদপ্তর নাম' : 'Directorate Name'}
                </p>
                <p className="text-base font-medium">{selectedItem.directorate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'পরিচিতি নম্বর' : 'Identity Number'}
                </p>
                <p className="text-base font-medium">{selectedItem.identity_number || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'NID নম্বর' : 'NID Number'}
                </p>
                <p className="text-base font-medium">{selectedItem.nid}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'TIN নম্বর' : 'TIN Number'}
                </p>
                <p className="text-base font-medium">{selectedItem.tin || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'জন্ম স্থান' : 'Birth Place'}
                </p>
                <p className="text-base font-medium">{selectedItem.birth_place}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'গ্রাম/ওয়ার্ড' : 'Village/Ward'}
                </p>
                <p className="text-base font-medium">{selectedItem.village}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'উপজেলা/থানা' : 'Upazila/Thana'}
                </p>
                <p className="text-base font-medium">{selectedItem.upazila}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'জেলা' : 'District'}
                </p>
                <p className="text-base font-medium">{selectedItem.district}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                </p>
                {getStatusBadge(selectedItem.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
