import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Download, Trash2, Edit, Eye, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

interface EducationalRecord {
    id: string;
    degreeTitle: string;
    institutionName: string;
    boardUniversity: string;
    subject: string;
    passingYear: number;
    resultDivision: string;
}

interface EducationalQualificationProps {
    language: 'bn' | 'en';
}

const EducationalQualification = ({ language: initialLanguage }: EducationalQualificationProps) => {
    const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<EducationalRecord | null>(null);
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const queryClient = useQueryClient();
    const { signOut, user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        degreeTitle: "",
        institutionName: "",
        boardUniversity: "",
        subject: "",
        passingYear: new Date().getFullYear(),
        resultDivision: "",
    });

    const translations = {
        bn: {
            title: "শিক্ষা সংক্রান্ত তথ্যাবলি",
            subtitle: "দয়া করে আপনার শিক্ষাগত তথ্য সঠিকভাবে এবং সম্পূর্ণভাবে আপডেট করুন।",
            addNew: "+ নতুন তথ্য",
            delete: "মুছুন",
            massDelete: "সব মুছুন",
            download: "ডাউনলোড",
            no: "ক্রমিক",
            degreeTitle: "ডিগ্রির নাম",
            institution: "শিক্ষা প্রতিষ্ঠানের নাম",
            boardUniversity: "বোর্ড / বিশ্ববিদ্যালয়",
            passingYear: "পাসের সন",
            result: "ফলাফল / বিভাগ",
            subject: "বিষয়",
            actions: "অ্যাকশন",
            modalTitle: "শিক্ষাগত যোগ্যতা যোগ করুন",
            modalEditTitle: "শিক্ষাগত যোগ্যতা সম্পাদনা করুন",
            save: "সংরক্ষণ করুন",
            cancel: "বাতিল করুন",
            deleteSuccess: "রেকর্ড মুছে ফেলা হয়েছে",
            undo: "পূর্বাবস্থায় ফিরুন",
            saveSuccess: "রেকর্ড সংরক্ষণ করা হয়েছে",
            selectToDelete: "মুছে ফেলার জন্য রেকর্ড নির্বাচন করুন",
            noRecords: "কোন রেকর্ড পাওয়া যায়নি",
        },
        en: {
            title: "Educational Information",
            subtitle: "Please update your educational information accurately and completely.",
            addNew: "+ Add New Information",
            delete: "Delete",
            massDelete: "Mass Delete",
            download: "Download",
            no: "No",
            degreeTitle: "Degree Title",
            institution: "Institution Name",
            boardUniversity: "Board / University",
            passingYear: "Passing Year",
            result: "Result / Division",
            subject: "Subject",
            actions: "Actions",
            modalTitle: "Add Educational Qualification",
            modalEditTitle: "Edit Educational Qualification",
            save: "Save",
            cancel: "Cancel",
            deleteSuccess: "Record deleted",
            undo: "Undo",
            saveSuccess: "Record saved",
            selectToDelete: "Select records to delete",
            noRecords: "No records found",
        },
    };

    const t = translations[language];

    const handleNavigate = (section: string) => {
        navigate(section);
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const handleOpenModal = (record?: EducationalRecord) => {
        if (record) {
            setEditingRecord(record);
            setFormData({
                degreeTitle: record.degreeTitle,
                institutionName: record.institutionName,
                boardUniversity: record.boardUniversity,
                subject: record.subject || "",
                passingYear: record.passingYear,
                resultDivision: record.resultDivision,
            });
        } else {
            setEditingRecord(null);
            setFormData({
                degreeTitle: "",
                institutionName: "",
                boardUniversity: "",
                subject: "",
                passingYear: new Date().getFullYear(),
                resultDivision: "",
            });
        }
        setIsModalOpen(true);
    };

    // React Query: fetch educational qualifications for current user
    const { data: recordsData = [], isLoading } = useQuery({
        queryKey: ['educational-qualifications', (user as unknown as { id?: string })?.id],
        queryFn: async () => {
            // If there's no logged-in user, return empty list.
            if (!(user && (user as unknown as { id?: string }).id)) return [] as EducationalRecord[];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('educational_qualifications')
                .select('*')
                .eq('user_id', (user as unknown as { id?: string }).id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            const rows = (data || []) as any[];
            // Map DB snake_case -> UI camelCase model
            return rows.map(r => ({
                id: r.id,
                degreeTitle: r.degree_title ?? r.degreeTitle ?? '',
                institutionName: r.institution_name ?? r.institutionName ?? '',
                boardUniversity: r.board_university ?? r.boardUniversity ?? '',
                subject: r.subject ?? '',
                passingYear: r.passing_year ?? r.passingYear ?? 0,
                resultDivision: r.result_division ?? r.resultDivision ?? '',
            })) as EducationalRecord[];
        }
    });

    const addMutation = useMutation({
        mutationFn: async (payload: Record<string, unknown>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('educational_qualifications')
                .insert([payload])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['educational-qualifications'] });
            toast({ title: t.saveSuccess });
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: { id: string } & Record<string, unknown>) => {
            const { id, ...rest } = payload as { id: string } & Record<string, unknown>;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any)
                .from('educational_qualifications')
                .update(rest)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['educational-qualifications'] });
            toast({ title: t.saveSuccess });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('educational_qualifications')
                .delete()
                .in('id', ids);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['educational-qualifications'] });
            toast({ title: t.deleteSuccess });
        }
    });

    const handleSave = () => {
        const payload = {
            degree_title: formData.degreeTitle,
            institution_name: formData.institutionName,
            board_university: formData.boardUniversity,
            subject: formData.subject,
            passing_year: formData.passingYear,
            result_division: formData.resultDivision,
            user_id: undefined as string | undefined,
        };
        if (editingRecord) {
            // map to DB fields for update
            updateMutation.mutate({
                id: editingRecord.id,
                degree_title: formData.degreeTitle,
                institution_name: formData.institutionName,
                board_university: formData.boardUniversity,
                subject: formData.subject,
                passing_year: formData.passingYear,
                result_division: formData.resultDivision,
                user_id: (user as unknown as { id?: string })?.id,
            });
        } else {
            // include user id if available from auth
            payload.user_id = (user && (user as unknown as { id?: string }).id) ? (user as unknown as { id?: string }).id : undefined;
            addMutation.mutate(payload);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        const recordToDelete = (recordsData || []).find(r => r.id === id);
        deleteMutation.mutate([id]);

        // show undo option: re-insert the deleted record if user clicks undo
        const { dismiss } = toast({
            title: t.deleteSuccess,
            action: (
                <Button variant="outline" size="sm" onClick={() => {
                    if (recordToDelete) {
                        // re-insert
                        addMutation.mutate({
                            degree_title: recordToDelete.degreeTitle,
                            institution_name: recordToDelete.institutionName,
                            board_university: recordToDelete.boardUniversity,
                            subject: recordToDelete.subject,
                            passing_year: recordToDelete.passingYear,
                            result_division: recordToDelete.resultDivision,
                            user_id: (user as unknown as { id?: string })?.id,
                        });
                    }
                    if (typeof dismiss === 'function') dismiss();
                }}>
                    {t.undo}
                </Button>
            ),
            duration: 15000,
        });
    };

    const handleMassDelete = () => {
        if (selectedRecords.length === 0) {
            toast({ title: t.selectToDelete, duration: 3000 });
            return;
        }
        const toDelete = [...selectedRecords];
        deleteMutation.mutate(toDelete);
        setSelectedRecords([]);

        const recordsToDelete = (recordsData || []).filter(r => toDelete.includes(r.id));
        const { dismiss } = toast({
            title: t.deleteSuccess,
            action: (
                <Button variant="outline" size="sm" onClick={() => {
                    // re-insert deleted records
                    recordsToDelete.forEach(r => {
                        addMutation.mutate({
                            degree_title: r.degreeTitle,
                            institution_name: r.institutionName,
                            board_university: r.boardUniversity,
                            subject: r.subject,
                            passing_year: r.passingYear,
                            result_division: r.resultDivision,
                            user_id: (user as unknown as { id?: string })?.id,
                        });
                    });
                    if (typeof dismiss === 'function') dismiss();
                }}>
                    {t.undo}
                </Button>
            ),
            duration: 15000,
        });
    };

    const handleDownload = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            (recordsData || []).map((record, index) => ({
                [t.no]: index + 1,
                [t.degreeTitle]: record.degreeTitle,
                [t.institution]: record.institutionName,
                [t.boardUniversity]: record.boardUniversity,
                [t.subject]: record.subject,
                [t.passingYear]: record.passingYear,
                [t.result]: record.resultDivision,
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Educational Records");
        XLSX.writeFile(workbook, "educational_qualifications.xlsx");
    };

    const toggleSelectRecord = (id: string) => {
        setSelectedRecords(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedRecords.length === (recordsData || []).length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords((recordsData || []).map(r => r.id));
        }
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
                <AppSidebar language={language} onNavigate={handleNavigate} />
                <SidebarInset className="flex-1">
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                        <SidebarTrigger />
                        <div className="flex-1" />
                        <Button
                            variant="outline"
                            size="sm"
                            // onClick={() => handleNavigation('notifications')}
                            className="relative"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                        </Button>
                        <LanguageToggle currentLanguage={language} onLanguageChange={setLanguage} />
                        <ThemeToggle />
                    </header>

                    <main className="flex-1 p-6">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="h-6 w-6 text-primary" />
                                    <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{t.subtitle}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t.addNew}
                                </Button>
                                <Button variant="destructive" onClick={handleMassDelete}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {t.massDelete}
                                </Button>
                                <Button variant="secondary" onClick={handleDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    {t.download}
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedRecords.length === (recordsData || []).length && (recordsData || []).length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>{t.degreeTitle}</TableHead>
                                        <TableHead>{t.institution}</TableHead>
                                        <TableHead>{t.boardUniversity}</TableHead>
                                        <TableHead>{t.subject}</TableHead>
                                        <TableHead>{t.passingYear}</TableHead>
                                        <TableHead>{t.result}</TableHead>
                                        <TableHead className="text-right">{t.actions}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(recordsData || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                {t.noRecords}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        (recordsData || []).map((record, index) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedRecords.includes(record.id)}
                                                        onCheckedChange={() => toggleSelectRecord(record.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>{record.degreeTitle}</TableCell>
                                                <TableCell>{record.institutionName}</TableCell>
                                                <TableCell>{record.boardUniversity}</TableCell>
                                                <TableCell>{record.subject}</TableCell>
                                                <TableCell>{record.passingYear}</TableCell>
                                                <TableCell>{record.resultDivision}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenModal(record)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(record.id)}
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
                    </main>
                </SidebarInset>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingRecord ? t.modalEditTitle : t.modalTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="degreeTitle">{t.degreeTitle}</Label>
                            <Input
                                id="degreeTitle"
                                value={formData.degreeTitle}
                                onChange={(e) => setFormData({ ...formData, degreeTitle: e.target.value })}
                                placeholder={t.degreeTitle}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="institutionName">{t.institution}</Label>
                            <Input
                                id="institutionName"
                                value={formData.institutionName}
                                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                placeholder={t.institution}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="boardUniversity">{t.boardUniversity}</Label>
                            <Input
                                id="boardUniversity"
                                value={formData.boardUniversity}
                                onChange={(e) => setFormData({ ...formData, boardUniversity: e.target.value })}
                                placeholder={t.boardUniversity}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="subject">{t.subject}</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder={t.subject}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="passingYear">{t.passingYear}</Label>
                            <Input
                                id="passingYear"
                                type="number"
                                value={formData.passingYear}
                                onChange={(e) => setFormData({ ...formData, passingYear: parseInt(e.target.value) })}
                                placeholder={t.passingYear}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="resultDivision">{t.result}</Label>
                            <Input
                                id="resultDivision"
                                value={formData.resultDivision}
                                onChange={(e) => setFormData({ ...formData, resultDivision: e.target.value })}
                                placeholder={t.result}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            {t.cancel}
                        </Button>
                        <Button onClick={handleSave}>{t.save}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
};

export default EducationalQualification;
