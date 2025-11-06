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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
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
    const [children, setChildren] = useState<ChildInfo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
    const [editingChild, setEditingChild] = useState<ChildInfo | null>(null);
    const [viewingChild, setViewingChild] = useState<ChildInfo | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);

    // Form state
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
        massDelete: language === 'bn' ? 'মাস মুছুন' : 'Mass Delete',
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

        toast({ title: language === 'bn' ? 'শীঘ্রই আসছে' : 'Coming Soon', description: language === 'bn' ? 'এই পেজটি শীঘ্রই উপলব্ধ হবে।' : 'This page will be available soon.' });
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

        const childData: ChildInfo = {
            id: editingChild?.id || Date.now().toString(),
            fullName: formData.fullName,
            birthDate: formData.birthDate,
            gender: formData.gender,
            age: parseInt(formData.age) || 0,
            maritalStatus: formData.maritalStatus,
            specialStatus: formData.specialStatus,
        };

        if (editingChild) {
            setChildren(children.map(c => c.id === editingChild.id ? childData : c));
            toast({
                title: language === 'bn' ? 'সফল' : 'Success',
                description: language === 'bn' ? 'তথ্য আপডেট করা হয়েছে।' : 'Information updated successfully.',
            });
        } else {
            setChildren([...children, childData]);
            toast({
                title: language === 'bn' ? 'সফল' : 'Success',
                description: language === 'bn' ? 'নতুন তথ্য যোগ করা হয়েছে।' : 'New information added successfully.',
            });
        }

        resetForm();
        setIsModalOpen(false);
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
        const tempDeleted = [...selectedChildren];

        setChildren(children.filter(c => !selectedChildren.includes(c.id)));
        setSelectedChildren([]);

        toast({
            title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted',
            description: language === 'bn' ? `${deletedItems} টি আইটেম মুছে ফেলা হয়েছে` : `${deletedItems} item(s) deleted`,
            action: (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        // Restore deleted items
                        const restoredChildren = children.filter(c => tempDeleted.includes(c.id));
                        setChildren([...children, ...restoredChildren]);
                        toast({
                            title: language === 'bn' ? 'পুনরুদ্ধার করা হয়েছে' : 'Restored',
                            description: language === 'bn' ? 'আইটেম পুনরুদ্ধার করা হয়েছে' : 'Items restored',
                        });
                    }}
                >
                    {language === 'bn' ? 'পূর্বাবস্থা' : 'Undo'}
                </Button>
            ),
        });
    };

    const handleDownload = () => {
        const csvContent = [
            [t.fullName, t.birthDate, t.gender, t.age, t.maritalStatus, t.specialStatus].join(','),
            ...children.map(c => [
                c.fullName,
                format(c.birthDate, 'dd/MM/yyyy'),
                c.gender,
                c.age,
                c.maritalStatus,
                c.specialStatus,
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'children-information.csv';
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
            title: language === 'bn' ? 'সফল' : 'Success',
            description: language === 'bn' ? 'ফাইল ডাউনলোড করা হয়েছে।' : 'File downloaded successfully.',
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
                                    <Button variant="outline" onClick={handleDownload} className="gap-2">
                                        <Download className="h-4 w-4" />
                                        {t.download}
                                    </Button>
                                </div>
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
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectedChildren.length === children.length && children.length > 0}
                                                        onCheckedChange={toggleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead>{t.fullName}</TableHead>
                                                <TableHead>{t.birthDate}</TableHead>
                                                <TableHead>{t.gender}</TableHead>
                                                <TableHead>{t.age}</TableHead>
                                                <TableHead>{t.maritalStatus}</TableHead>
                                                <TableHead>{t.specialStatus}</TableHead>
                                                <TableHead className="text-right">{t.actions}</TableHead>
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
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.birthDate}
                                                        onSelect={handleBirthDateChange}
                                                        initialFocus
                                                        className="pointer-events-auto"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t.gender}</Label>
                                            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
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
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>{t.maritalStatus}</Label>
                                            <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
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
                                                    <SelectValue />
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
