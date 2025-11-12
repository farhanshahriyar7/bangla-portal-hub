import { useState } from "react";
import { Plus, Trash2, Download, Eye, Edit, Users, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar22 } from "@/components/ui/calendar22";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { AppSidebar } from "@/components/AppSidebar";
import { CopyRights } from "@/components/CopyRights";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BreadcrumbList } from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client"; //backend integration
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; //backend integration


interface ChildInfo {
    id: string;
    fullName: string;
    birthDate: Date;
    gender: string;
    age: number;
    maritalStatus: string;
    specialStatus: string;
}

interface ChildrenInformationProps {
    language: 'bn' | 'en';
}

const ChildrenInformation = ({ language: initialLanguage }: ChildrenInformationProps) => {
    // const [children, setChildren] = useState<ChildInfo[]>([]); // removed for backend integration // local state to hold children data
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
    const [editingChild, setEditingChild] = useState<ChildInfo | null>(null);
    const [viewingChild, setViewingChild] = useState<ChildInfo | null>(null);
    const [deleteMode, setDeleteMode] = useState<'selected' | 'all' | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteAllLoading, setDeleteAllLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);


    // backend integration   
    const queryClient = useQueryClient();
    const { data: session } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await supabase.auth.getSession();
            return data.session;
        }
    });

    const { data: children = [], isLoading } = useQuery({
        queryKey: ['children-information'],
        queryFn: async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('children_information')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB rows (snake_case) to UI model (camelCase)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (data || []).map((r: Record<string, any>) => ({
                id: r.id,
                fullName: r.full_name,
                birthDate: r.birth_date ? new Date(r.birth_date) : undefined,
                gender: r.gender,
                age: r.age,
                maritalStatus: r.marital_status,
                specialStatus: r.special_status,
            })) as ChildInfo[];
        },
        enabled: !!session
    });


    const addMutation = useMutation({
        mutationFn: async (newChild: Omit<ChildInfo, 'id'>) => {
            // map camelCase to snake_case for DB
            const payload = {
                full_name: newChild.fullName,
                birth_date: newChild.birthDate ? format(newChild.birthDate, 'yyyy-MM-dd') : null,
                gender: newChild.gender,
                age: newChild.age,
                marital_status: newChild.maritalStatus,
                special_status: newChild.specialStatus,
                user_id: session?.user?.id,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('children_information')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['children-information'] });
            toast({ title: language === 'bn' ? "সফলভাবে যোগ করা হয়েছে" : "Successfully added" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...updates }: ChildInfo) => {
            // map camelCase to snake_case
            const payload: Record<string, unknown> = {
                full_name: updates.fullName,
                birth_date: updates.birthDate ? format(updates.birthDate, 'yyyy-MM-dd') : null,
                gender: updates.gender,
                age: updates.age,
                marital_status: updates.maritalStatus,
                special_status: updates.specialStatus,
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('children_information')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['children-information'] });
            toast({ title: language === 'bn' ? "সফলভাবে আপডেট করা হয়েছে" : "Successfully updated" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('children_information')
                .delete()
                .in('id', ids);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['children-information'] });
        }
    });


    // NOTE: Mutations should be invoked from handlers (handleSave, handleDelete)


    // Form state ..
    const [formData, setFormData] = useState({
        fullName: "",
        birthDate: undefined as Date | undefined,
        gender: "",
        age: "",
        maritalStatus: "",
        specialStatus: "",
    });

    const t = {
        // dashboard: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
        dashboard: language === 'bn' ? 'Dashboard' : 'Dashboard',
        title: language === 'bn' ? 'সন্তানদের তথ্যাবলি' : 'Children Information',
        subtext: language === 'bn' ? 'অনুগ্রহ করে আপনার তথ্য সঠিক এবং সম্পূর্ণরূপে আপডেট করুন।' : 'Please update your information accurately and completely.',
        addNew: language === 'bn' ? '+ নতুন তথ্য' : '+ Add New Information',
        delete: language === 'bn' ? 'মুছুন' : 'Delete',
    massDelete: language === 'bn' ? 'সব মুছুন' : 'Delete All',
        download: language === 'bn' ? 'ডাউনলোড' : 'Download',
        fullName: language === 'bn' ? 'পূর্ণ নাম' : 'Full Name',
        birthDate: language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth',
        gender: language === 'bn' ? 'ছেলে/মেয়ে' : 'Gender',
        age: language === 'bn' ? 'বয়স' : 'Age',
        maritalStatus: language === 'bn' ? 'বিবাহিত/অবিবাহিত' : 'Marital Status',
        specialStatus: language === 'bn' ? 'বিধবা/প্রতিবন্ধী সনদ' : 'Special Status',
        actions: language === 'bn' ? 'অ্যাকশন' : 'Actions',
        save: language === 'bn' ? 'সংরক্ষণ করুন' : 'Save',
        cancel: language === 'bn' ? 'বাতিল করুন' : 'Cancel',
        view: language === 'bn' ? 'দেখুন' : 'View',
        edit: language === 'bn' ? 'সম্পাদনা করুন' : 'Edit',
        male: language === 'bn' ? 'ছেলে' : 'Male',
        female: language === 'bn' ? 'মেয়ে' : 'Female',
        married: language === 'bn' ? 'বিবাহিত' : 'Married',
        unmarried: language === 'bn' ? 'অবিবাহিত' : 'Unmarried',
        widow: language === 'bn' ? 'বিধবা' : 'Widow',
        disabled: language === 'bn' ? 'প্রতিবন্ধী' : 'Disabled',
        notApplicable: language === 'bn' ? 'প্রযোজ্য নয়' : 'Not Applicable',
        selectDate: language === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Select Date',
        noData: language === 'bn' ? 'কোন তথ্য নেই' : 'No data available',
        addFirst: language === 'bn' ? 'প্রথম সন্তানের তথ্য যোগ করতে উপরের "+ নতুন তথ্য" বাটনে ক্লিক করুন।' : 'Click the "+ Add New Information" button above to add your first child\'s information.',
    };

    const handleNavigation = async (section: string) => {
        if (section === 'dashboard') { navigate('/'); return; }
        if (section === 'general-information') { navigate('/general-information'); return; }
        if (section === 'office-information') { navigate('/office-information'); return; }
        if (section === 'marital-status') { navigate('/marital-status'); return; }
        if (section === 'upload-files') { navigate('/upload-files'); return; }
        if (section === 'notifications') { navigate('/notifications'); return; }
        if (section === 'security') { navigate('/security'); return; }
        if (section === 'settings') { navigate('/settings'); return; }
        if (section === 'logout') {
            try {
                await signOut();
                toast({ title: language === 'bn' ? 'লগ আউট' : 'Logout', description: language === 'bn' ? 'আপনি সফলভাবে লগ আউট হয়েছেন।' : 'You have been successfully logged out.' });
                navigate('/login');
            } catch (err) {
                toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'লগ আউট করতে ব্যর্থ হয়েছে' : 'Failed to logout', variant: 'destructive' });
            }
            return;
        }

        toast({ title: language === 'bn' ? 'নির্মাণ চলছে' : 'Under Construction', description: language === 'bn' ? 'এই পেজটি শীঘ্রই উপলব্ধ হবে।' : 'This page will be available soon.' });
    };

    const calculateAge = (birthDate: Date) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleBirthDateChange = (date: Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            birthDate: date,
            age: date ? calculateAge(date).toString() : "",
        }));
    };

    const handleSave = () => {
        if (!formData.fullName || !formData.birthDate || !formData.gender || !formData.maritalStatus || !formData.specialStatus) {
            toast({
                title: language === 'bn' ? 'ত্রুটি' : 'Error',
                description: language === 'bn' ? 'সকল প্রয়োজনীয় ক্ষেত্র পূরণ করুন।' : 'Please fill all required fields.',
                variant: "destructive",
            });
            return;
        }

        const payload = {
            fullName: formData.fullName,
            birthDate: formData.birthDate,
            gender: formData.gender,
            age: parseInt(formData.age) || 0,
            maritalStatus: formData.maritalStatus,
            specialStatus: formData.specialStatus,
        };

        if (editingChild) {
            updateMutation.mutate({ id: editingChild.id, ...payload }, {
                onSuccess: () => {
                    resetForm();
                    setIsModalOpen(false);
                }
            });
        } else {
            addMutation.mutate(payload as Omit<ChildInfo, 'id'>, {
                onSuccess: () => {
                    resetForm();
                    setIsModalOpen(false);
                }
            });
        }
    };

    const resetForm = () => {
        setFormData({
            fullName: "",
            birthDate: undefined,
            gender: "",
            age: "",
            maritalStatus: "",
            specialStatus: "",
        });
        setEditingChild(null);
    };

    const handleEdit = (child: ChildInfo) => {
        setEditingChild(child);
        setFormData({
            fullName: child.fullName,
            birthDate: child.birthDate,
            gender: child.gender,
            age: child.age.toString(),
            maritalStatus: child.maritalStatus,
            specialStatus: child.specialStatus,
        });
        setIsModalOpen(true);
    };

    const handleView = (child: ChildInfo) => {
        setViewingChild(child);
    };

    const handleDelete = () => {
        if (selectedChildren.length === 0) {
            toast({
                title: language === 'bn' ? 'সতর্কতা' : 'Warning',
                description: language === 'bn' ? 'মুছে ফেলার জন্য অন্তত একটি আইটেম নির্বাচন করুন।' : 'Please select at least one item to delete.',
                variant: "destructive",
            });
            return;
        }

        const deletedItems = selectedChildren.length;

        // Keep the deleted records locally so we can support an "Undo" action if desired
        const tempDeletedRecords = children.filter(c => selectedChildren.includes(c.id));

        deleteMutation.mutate(selectedChildren, {
            onSuccess: () => {
                setSelectedChildren([]);
                toast({
                    title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted',
                    description: language === 'bn' ? `${deletedItems} টি আইটেম মুছে ফেলা হয়েছে` : `${deletedItems} item(s) deleted`,
                    action: (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Re-insert deleted items (best-effort undo)
                                Promise.all(tempDeletedRecords.map(r => addMutation.mutateAsync({
                                    fullName: r.fullName,
                                    birthDate: r.birthDate,
                                    gender: r.gender,
                                    age: r.age,
                                    maritalStatus: r.maritalStatus,
                                    specialStatus: r.specialStatus,
                                }))).then(() => {
                                    toast({ title: language === 'bn' ? 'পুনরুদ্ধার করা হয়েছে' : 'Restored', description: language === 'bn' ? 'আইটেম পুনরুদ্ধার করা হয়েছে' : 'Items restored' });
                                }).catch(() => {
                                    toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'পুনরুদ্ধার ব্যর্থ হয়েছে' : 'Failed to restore items', variant: 'destructive' });
                                });
                            }} 
                        >
                            {language === 'bn' ? 'পূর্বাবস্থা' : 'Undo'}
                        </Button>
                    ),
                });
            }
        });
    };

    // Open confirmation for deleting all rows
    const handleDeleteAll = () => {
        if (children.length === 0) {
            toast({
                title: language === 'bn' ? 'সতর্কতা' : 'Warning',
                description: language === 'bn' ? 'মুছে ফেলার জন্য কোন তথ্য নেই।' : 'No data to delete.',
                variant: "destructive",
            });
            return;
        }
        setDeleteMode('all');
        setDeleteConfirmOpen(true);
    };

    // XLSX download logic, similar to GeneralInformation.tsx
    const handleDownload = () => {
        // Helper function to detect if text contains Bangla characters
        const isBangla = (text) => /[\u0980-\u09FF]/.test(text);

        // Prepare export data
        const exportData = children.map((c) => ({
            [t.fullName]: c.fullName || '',
            [t.birthDate]: c.birthDate ? format(c.birthDate, 'dd/MM/yyyy') : '',
            [t.gender]: c.gender || '',
            [t.age]: c.age || '',
            [t.maritalStatus]: c.maritalStatus || '',
            [t.specialStatus]: c.specialStatus || '',
        }));

        // Add header row if no children (to avoid empty file)
        if (exportData.length === 0) {
            exportData.push({
                [t.fullName]: '',
                [t.birthDate]: '',
                [t.gender]: '',
                [t.age]: '',
                [t.maritalStatus]: '',
                [t.specialStatus]: '',
            });
        }

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Apply fonts to cells based on content and make the header row bold
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = worksheet[cellAddress];
                if (!cell) continue;
                const cellValue = String(cell.v ?? '');
                const fontName = isBangla(cellValue) ? 'SutonnyOMJ' : 'Times New Roman';
                cell.s = cell.s || {};
                cell.s.font = { name: fontName, sz: 12, ...(R === range.s.r ? { bold: true } : {}) };
            }
        }

        // Create workbook and download
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, language === 'bn' ? 'সন্তানদের তথ্য' : 'Children Information');
        XLSX.writeFile(workbook, `children_information_${new Date().toISOString().split('T')[0]}.xlsx`);

        toast({
            title: language === 'bn' ? 'ডাউনলোড সফল' : 'Download Successful',
            description: language === 'bn' ? 'ফাইলটি ডাউনলোড হয়েছে' : 'File has been downloaded',
        });
    };

    const toggleSelectChild = (id: string) => {
        setSelectedChildren(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedChildren.length === children.length) {
            setSelectedChildren([]);
        } else {
            setSelectedChildren(children.map(c => c.id));
        }
    };

    // Confirmed delete all handler
    const confirmDeleteAll = () => {
        setDeleteAllLoading(true);
        const allIds = children.map(c => c.id);
        if (allIds.length === 0) {
            setDeleteAllLoading(false);
            setDeleteConfirmOpen(false);
            return;
        }
        // Keep deleted records for undo
        const tempDeletedRecords = [...children];
        deleteMutation.mutate(allIds, {
            onSuccess: () => {
                setSelectedChildren([]);
                setDeleteConfirmOpen(false);
                setDeleteAllLoading(false);
                toast({
                    title: language === 'bn' ? 'সব মুছে ফেলা হয়েছে' : 'All Deleted',
                    description: language === 'bn' ? `${allIds.length} টি তথ্য মুছে ফেলা হয়েছে` : `${allIds.length} item(s) deleted`,
                    action: (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                Promise.all(tempDeletedRecords.map(r => addMutation.mutateAsync({
                                    fullName: r.fullName,
                                    birthDate: r.birthDate,
                                    gender: r.gender,
                                    age: r.age,
                                    maritalStatus: r.maritalStatus,
                                    specialStatus: r.specialStatus,
                                }))).then(() => {
                                    toast({ title: language === 'bn' ? 'পুনরুদ্ধার করা হয়েছে' : 'Restored', description: language === 'bn' ? 'সব তথ্য পুনরুদ্ধার করা হয়েছে' : 'All items restored' });
                                }).catch(() => {
                                    toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'পুনরুদ্ধার ব্যর্থ হয়েছে' : 'Failed to restore items', variant: 'destructive' });
                                });
                            }}
                        >
                            {language === 'bn' ? 'পূর্বাবস্থা' : 'Undo'}
                        </Button>
                    ),
                });
            },
            onError: () => {
                setDeleteAllLoading(false);
                setDeleteConfirmOpen(false);
                toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'সব তথ্য মুছে ফেলা যায়নি' : 'Failed to delete all items', variant: 'destructive' });
            }
        });
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

                            {/* <div className='flex items-center gap-1.5'>
                                <h2 className="text-lg font-semibold">{t.title}</h2>
                            </div> */}
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link to="/">
                                                {t.dashboard}</Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-gray-800">{t.title}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

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
                        <div className="max-w-7xl mx-auto space-y-6">
                            {/* Original content container */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-6 w-6 text-primary" />
                                        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{t.subtext}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        {t.addNew}
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete} className="gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        {t.delete}
                                    </Button>
                                    <Button
                                        onClick={handleDeleteAll}
                                        variant="destructive"
                                        className="bg-red-950 hover:bg-red-900 text-white"
                                        disabled={children.length === 0 || deleteAllLoading}
                                    >
                                        {t.massDelete}
                                    </Button>
                                    {/* <Button variant="outline" onClick={handleDownload} disabled className="gap-2">
                                        <Download className="h-4 w-4" />
                                        {t.download}
                                    </Button> */}
                                </div>
                            {/* Delete All Confirmation Dialog */}
                            <Dialog open={deleteConfirmOpen} onOpenChange={(open) => { if (!open) setDeleteConfirmOpen(false); }}>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{language === 'bn' ? 'সব তথ্য মুছে ফেলবেন?' : 'Delete All Information?'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <p className="text-lg font-medium">
                                            {language === 'bn'
                                                ? `আপনি কি নিশ্চিতভাবে ${children.length} টি তথ্য মুছে ফেলতে চান?`
                                                : `Are you sure you want to delete all ${children.length} items?`}
                                        </p>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleteAllLoading}>
                                            {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                                        </Button>
                                        <Button variant="destructive" onClick={confirmDeleteAll} disabled={deleteAllLoading}>
                                            {language === 'bn' ? 'সব মুছুন' : 'Delete All'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            </div>

                            <Card className="overflow-hidden">
                                {children.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">{t.noData}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">{t.addFirst}</p>
                                        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t.addNew}
                                        </Button>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-green-800 text-white hover:bg-green-800 border-b-[2px] border-green-900 dark:border-green-700 shadow-sm">
                                                <TableHead className="w-12 font-semibold text-left text-white text-xs">
                                                    <Checkbox
                                                        checked={selectedChildren.length === children.length && children.length > 0}
                                                        onCheckedChange={toggleSelectAll}
                                                        className="bg-white border-2 border-green-700 dark:border-green-600 hover:border-green-900 hover:dark:border-green-500"
                                                    />
                                                </TableHead>
                                                <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">{t.fullName}</TableHead>
                                                <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">{t.birthDate}</TableHead>
                                                <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">{t.gender}</TableHead>
                                                <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">{t.age}</TableHead>
                                                <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">{t.maritalStatus}</TableHead>
                                                <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-center">{t.specialStatus}</TableHead>
                                                <TableHead className="text-primary-foreground font-semibold text-xs border-r-[1.25px] border-green-700 dark:border-green-600 text-right">{t.actions}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {children.map((child) => (
                                                <TableRow key={child.id}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedChildren.includes(child.id)}
                                                            onCheckedChange={() => toggleSelectChild(child.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{child.fullName}</TableCell>
                                                    <TableCell>{format(child.birthDate, 'dd/MM/yyyy')}</TableCell>
                                                    <TableCell>{child.gender}</TableCell>
                                                    <TableCell>{child.age}</TableCell>
                                                    <TableCell>{child.maritalStatus}</TableCell>
                                                    <TableCell>{child.specialStatus}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => handleView(child)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(child)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </Card>
                            {/* Add/Edit Modal */}
                            <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsModalOpen(open); }}>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingChild ? (language === 'bn' ? 'তথ্য সম্পাদনা করুন' : 'Edit Information') : t.addNew}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="fullName">{t.fullName}</Label>
                                            <Input
                                                id="fullName"
                                                placeholder={language === 'bn' ? 'সন্তানের পূর্ণ নাম লিখুন' : 'Enter child\'s full name'}
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t.birthDate}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "justify-start text-left font-normal",
                                                            !formData.birthDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {formData.birthDate ? format(formData.birthDate, "PPP") : <span>{t.selectDate}</span>}

                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar22
                                                        value={formData.birthDate}
                                                        onChange={handleBirthDateChange}
                                                        id="birthDate"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t.gender}</Label>
                                            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={language === 'bn' ? 'লিঙ্গ নির্বাচন করুন' : 'Select gender'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={t.male}>{t.male}</SelectItem>
                                                    <SelectItem value={t.female}>{t.female}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="age">{t.age}</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                placeholder={language === 'bn' ? 'সন্তানের বয়স লিখুন' : 'Enter child\'s age'}
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t.maritalStatus}</Label>
                                            <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={language === 'bn' ? 'বৈবাহিক অবস্থা নির্বাচন করুন' : 'Select marital status'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={t.married}>{t.married}</SelectItem>
                                                    <SelectItem value={t.unmarried}>{t.unmarried}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t.specialStatus}</Label>
                                            <Select value={formData.specialStatus} onValueChange={(value) => setFormData({ ...formData, specialStatus: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={language === 'bn' ? 'বিশেষ অবস্থা নির্বাচন করুন' : 'Select special status'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={t.widow}>{t.widow}</SelectItem>
                                                    <SelectItem value={t.disabled}>{t.disabled}</SelectItem>
                                                    <SelectItem value={t.notApplicable}>{t.notApplicable}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => { resetForm(); setIsModalOpen(false); }}>
                                            {t.cancel}
                                        </Button>
                                        <Button onClick={handleSave}>{t.save}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* View Modal */}
                            <Dialog open={!!viewingChild} onOpenChange={(open) => { if (!open) setViewingChild(null); }}>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{language === 'bn' ? 'বিস্তারিত তথ্য' : 'Details'}</DialogTitle>
                                    </DialogHeader>
                                    {viewingChild && (
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-muted-foreground">{t.fullName}</Label>
                                                <p className="text-lg font-medium">{viewingChild.fullName}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">{t.birthDate}</Label>
                                                <p className="text-lg font-medium">{format(viewingChild.birthDate, 'dd/MM/yyyy')}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">{t.gender}</Label>
                                                <p className="text-lg font-medium">{viewingChild.gender}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">{t.age}</Label>
                                                <p className="text-lg font-medium">{viewingChild.age}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">{t.maritalStatus}</Label>
                                                <p className="text-lg font-medium">{viewingChild.maritalStatus}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">{t.specialStatus}</Label>
                                                <p className="text-lg font-medium">{viewingChild.specialStatus}</p>
                                            </div>
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <Button onClick={() => setViewingChild(null)}>{language === 'bn' ? 'বন্ধ করুন' : 'Close'}</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </main>

                    <footer className="border-t border-border bg-card/50 py-4 px-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            <CopyRights />
                        </p>
                    </footer>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default ChildrenInformation;
