import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Plus, Menu, Loader2, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import type { Database } from '@/lib/database.types';
import type { PostgrestError } from '@supabase/supabase-js';

interface MaritalStatusProps {
    language: 'bn' | 'en';
}

// Type aliases
type MaritalInformationRow = Database['public']['Tables']['marital_information']['Row'];
type SpouseInformationRow = Database['public']['Tables']['spouse_information']['Row'];

const translations = {
    bn: {
        title: "বৈবাহিক অবস্থা",
        dashboard: "Dashboard",
        maritalStatus: "বৈবাহিক অবস্থা",
        maritalStatusLabel: "বৈবাহিক অবস্থা",
        maritalStatusPlaceholder: "বৈবাহিক অবস্থা নির্বাচন করুন",
        married: "বিবাহিত",
        unmarried: "অবিবাহিত",
        widow: "বিধবা",
        divorced: "তালাকপ্রাপ্ত",
        widower: "বিপত্নীক",
        spouseInformation: "স্বামী/স্ত্রীর তথ্য",
        spouseName: "স্বামী/স্ত্রীর নাম",
        spouseNamePlaceholder: "স্বামী/স্ত্রীর পূর্ণ নাম লিখুন",
        occupation: "স্বামী/স্ত্রীর পেশা",
        occupationPlaceholder: "পেশা নির্বাচন করুন",
        govtEmployee: "সরকারি কর্মচারী",
        privateEmployee: "বেসরকারি কর্মচারী",
        business: "ব্যবসা",
        housewife: "গৃহিণী",
        other: "অন্যান্য",
        nid: "জাতীয় পরিচয় নম্বর",
        nidPlaceholder: "১০-১৭ সংখ্যার এনআইডি",
        tin: "টিআইএন",
        tinPlaceholder: "টিআইএন নম্বর লিখুন",
        district: "নিজ জেলা",
        districtPlaceholder: "জেলা নির্বাচন করুন",
        employeeId: "কর্মচারী নম্বর",
        employeeIdPlaceholder: "কর্মচারী নম্বর লিখুন",
        designation: "বর্তমান পদবি",
        designationPlaceholder: "পদবি লিখুন",
        officeAddress: "অফিসের ঠিকানা",
        officeAddressPlaceholder: "সম্পূর্ণ অফিসের ঠিকানা",
        officePhone: "অফিস ফোন নম্বর",
        officePhonePlaceholder: "+8801XXXXXXXXX বা 01XXXXXXXXX",
        addSpouse: "আরেকটি স্বামী/স্ত্রীর তথ্য যোগ করুন",
        removeSpouse: "মুছে ফেলুন",
        businessName: "ব্যবসার নাম",
        businessNamePlaceholder: "ব্যবসার নাম লিখুন",
        businessType: "ব্যবসার ধরণ",
        businessTypePlaceholder: "ব্যবসার ধরণ লিখুন",
        businessAddress: "ব্যবসার ঠিকানা",
        businessAddressPlaceholder: "ব্যবসার পূর্ণ ঠিকানা লিখুন",
        businessRegNumber: "ব্যবসা / রেজিস্ট্রেশন নম্বর",
        businessRegNumberPlaceholder: "রেজিস্ট্রেশন নম্বর লিখুন",
        businessPhone: "ব্যবসার ফোন নম্বর",
        businessPhonePlaceholder: "+8801XXXXXXXXX বা 01XXXXXXXXX",
        save: "সংরক্ষণ করুন",
        success: "সফলভাবে সংরক্ষিত হয়েছে",
        successDesc: "বৈবাহিক তথ্য সফলভাবে সংরক্ষিত হয়েছে",
        maritalStatusRequired: "আপনাকে অন্তত একটি স্ট্যাটাস যোগ করতে হবে। প্রত্যাশিত: 'বিবাহিত' | 'অবিবাহিত' | 'বিধবা' | 'তালাকপ্রাপ্ত' | 'বিপত্নীক'",
    },
    en: {
        title: "Marital Status",
        dashboard: "Dashboard",
        maritalStatus: "Marital Status",
        maritalStatusLabel: "Marital Status",
        maritalStatusPlaceholder: "Select marital status",
        married: "Married",
        unmarried: "Unmarried",
        widow: "Widow",
        divorced: "Divorced",
        widower: "Widower",
        spouseInformation: "Spouse Information",
        spouseName: "Spouse Name",
        spouseNamePlaceholder: "Enter spouse full name",
        occupation: "Spouse Occupation",
        occupationPlaceholder: "Select occupation",
        govtEmployee: "Government Employee",
        privateEmployee: "Private Employee",
        business: "Business",
        housewife: "Housewife",
        other: "Other",
        businessName: "Business Name",
        businessNamePlaceholder: "Enter business name",
        businessType: "Business Type",
        businessTypePlaceholder: "Enter business type",
        businessAddress: "Business Address",
        businessAddressPlaceholder: "Enter full business address",
        businessRegNumber: "Business / Registration No.",
        businessRegNumberPlaceholder: "Enter registration number",
        businessPhone: "Business Phone Number",
        businessPhonePlaceholder: "+8801XXXXXXXXX or 01XXXXXXXXX",
        nid: "National ID Number",
        nidPlaceholder: "10-17 digit NID",
        tin: "TIN",
        tinPlaceholder: "Enter TIN number",
        district: "Home District",
        districtPlaceholder: "Select district",
        employeeId: "Employee ID",
        employeeIdPlaceholder: "Enter employee ID",
        designation: "Current Designation",
        designationPlaceholder: "Enter designation",
        officeAddress: "Office Address",
        officeAddressPlaceholder: "Complete office address",
        officePhone: "Office Phone Number",
        officePhonePlaceholder: "+8801XXXXXXXXX or 01XXXXXXXXX",
        addSpouse: "Add Another Spouse",
        removeSpouse: "Remove",
        save: "Save",
        success: "Successfully Saved",
        successDesc: "Marital information has been saved successfully",
        maritalStatusRequired: "You have to add the status atleast. Expected 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower', received ''",
    },
};

const bangladeshDistricts = [
    "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh",
    "Comilla", "Narayanganj", "Gazipur", "Tangail", "Jamalpur", "Bogra", "Pabna", "Dinajpur",
    "Cox's Bazar", "Faridpur", "Jessore", "Kushtia", "Narsingdi", "Kishoreganj", "Netrokona",
    "Sherpur", "Gopalganj", "Madaripur", "Shariatpur", "Rajbari", "Manikganj", "Munshiganj",
    "Bagerhat", "Chuadanga", "Jhenaidah", "Magura", "Meherpur", "Narail", "Satkhira",
    "Bandarban", "Brahmanbaria", "Chandpur", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali",
    "Rangamati", "Habiganj", "Moulvibazar", "Sunamganj", "Barguna", "Bhola", "Jhalokati",
    "Patuakhali", "Pirojpur", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Sirajganj",
    "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"
];

const spouseSchema = z.object({
    name: z.string().min(1, "Spouse name is required"),
    occupation: z.enum(["govtEmployee", "privateEmployee", "business", "housewife", "other"], {
        required_error: "Occupation is required",
    }),
    nid: z.string({ required_error: "NID is required" })
        .refine((val) => /^\d{10,17}$/.test(val), "NID must be 10-17 digits"),
    tin: z.string().min(1, "TIN is required"),
    district: z.string({ required_error: "District is required" }),
    // Employee-specific fields
    employeeId: z.string().optional(),
    designation: z.string().optional(),
    officeAddress: z.string().optional(),
    officePhone: z.string()
        .optional()
        .refine(
            (val) => !val || /^(\+8801|01)\d{9}$/.test(val),
            "Phone must be +8801XXXXXXXXX or 01XXXXXXXXX format"
        ),
    // Business-specific fields
    businessName: z.string().optional(),
    businessType: z.string().optional(),
    businessAddress: z.string().optional(),
    businessPhone: z.string()
        .optional()
        .refine(
            (val) => !val || /^(\+8801|01)\d{9}$/.test(val),
            "Phone must be +8801XXXXXXXXX or 01XXXXXXXXX format"
        ),
    businessRegNumber: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.occupation === "govtEmployee" || data.occupation === "privateEmployee") {
        // Accept employees if they provide either full employee details OR a valid TIN + district
        const hasEmployeeDetails = !!(data.employeeId?.trim() && data.designation?.trim() && data.officeAddress?.trim() && data.officePhone?.trim());
        const hasTinAndDistrict = !!(data.tin && data.tin.trim() && data.district && data.district.trim());

        if (!hasEmployeeDetails && !hasTinAndDistrict) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please provide this details carefully",
                path: ["employeeId"],
            });
        }
    }

    if (data.occupation === "business") {
        if (!data.businessName?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Business name is required",
                path: ["businessName"],
            });
        }
        if (!data.businessType?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Business type is required",
                path: ["businessType"],
            });
        }
        if (!data.businessAddress?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Business address is required",
                path: ["businessAddress"],
            });
        }
        if (!data.businessPhone?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Business phone is required",
                path: ["businessPhone"],
            });
        }
        if (!data.businessRegNumber?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Business registration number is required",
                path: ["businessRegNumber"],
            });
        }
    }
});

const formSchema = z.object({
    maritalStatus: z.enum(["married", "unmarried", "widow", "divorced", "widower"], {
        required_error: "You have to add the status atleast. Expected 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower', received ''",
        invalid_type_error: "You have to add the status atleast. Expected 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower', received ''",
    }),
    spouses: z.array(spouseSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const MaritalStatus = ({ language: initialLanguage }: { language: 'bn' | 'en' }) => {
    const [language, setLanguage] = useState<'bn' | 'en'>(initialLanguage);
    const t = translations[language];
    const { toast } = useToast();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            maritalStatus: undefined,
            spouses: [],
        },
        mode: "onChange",
    });

    // destructure form helpers we use so components re-render on formState changes
    const { control, handleSubmit, watch, setValue, reset, setFocus, formState } = form;

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    // Indicates a saved/submitted record exists (either loaded or just saved)
    const [isSubmitted, setIsSubmitted] = useState(false);
    const maxSpouses = 4;

    // Dialog states for confirmation modals
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const clearForm = () => {
        // open modal instead of native confirm or toast confirm
        setClearDialogOpen(true);
    };

    type MaritalInformationWithSpouse = MaritalInformationRow & { spouse_information?: SpouseInformationRow[] };
    // Fetch marital status data
    const { data: maritalData, isLoading: queryLoading } = useQuery<MaritalInformationWithSpouse>({
        queryKey: ['marital-status', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('marital_information')
                .select(`
                            *,
                            spouse_information (*)
                        `)
                .eq('user_id', user.id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('No data found');

            return data;
        },
        enabled: !!user,
    });

    // Update form when data changes
    useEffect(() => {
        if (maritalData) {
            // Map snake_case DB fields to camelCase UI fields
            const mappedSpouses = (maritalData.spouse_information || []).map(spouse => ({
                name: spouse.name,
                occupation: (spouse.occupation || "other") as "govtEmployee" | "privateEmployee" | "business" | "housewife" | "other",
                nid: spouse.nid,
                tin: spouse.tin,
                district: spouse.district,
                employeeId: spouse.employee_id,
                designation: spouse.designation,
                officeAddress: spouse.office_address,
                officePhone: spouse.office_phone,
                businessName: spouse.business_name,
                businessType: spouse.business_type,
                businessAddress: spouse.business_address,
                businessPhone: spouse.business_phone,
                businessRegNumber: spouse.business_reg_number,
            }));

            reset({
                maritalStatus: maritalData.marital_status,
                spouses: mappedSpouses,
            });
            // mark as a saved/submitted record
            setIsEditing(false);
            setIsSubmitted(true);
        }
    }, [maritalData, reset]);
    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (formData: FormValues) => {
            if (!user) throw new Error('No user logged in');

            // Upsert marital information (use onConflict on user_id so existing record is updated)
            const { data: maritalInfo, error: maritalError } = await supabase
                .from('marital_information')
                .upsert({
                    user_id: user.id,
                    marital_status: formData.maritalStatus,
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (maritalError) throw maritalError;

            // Delete existing spouse info
            const { error: deleteError } = await supabase
                .from('spouse_information')
                .delete()
                .eq('marital_info_id', maritalInfo.id);

            if (deleteError) throw deleteError;

            // Insert new spouse info if applicable
            if (formData.spouses && formData.spouses.length > 0) {
                // Map camelCase UI fields to snake_case DB fields
                const spouseData = formData.spouses.map(spouse => ({
                    marital_info_id: maritalInfo.id,
                    user_id: user.id,
                    name: spouse.name,
                    occupation: spouse.occupation,
                    nid: spouse.nid,
                    tin: spouse.tin,
                    district: spouse.district,
                    employee_id: spouse.employeeId,
                    designation: spouse.designation,
                    office_address: spouse.officeAddress,
                    office_phone: spouse.officePhone,
                    business_name: spouse.businessName,
                    business_type: spouse.businessType,
                    business_address: spouse.businessAddress,
                    business_phone: spouse.businessPhone,
                    business_reg_number: spouse.businessRegNumber,
                })) satisfies Database['public']['Tables']['spouse_information']['Insert'][];

                const { error: spouseError } = await supabase
                    .from('spouse_information')
                    .insert(spouseData);

                if (spouseError) throw spouseError;
            }

            return maritalInfo;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marital-status'] });
            // mark as saved so buttons and UI update
            setIsSubmitted(true);
            setIsEditing(false);
            toast({
                title: t.success,
                description: t.successDesc,
            });
        },
        onError: (error: Error) => {
            toast({
                title: language === 'bn' ? 'ত্রুটি' : 'Error',
                description: language === 'bn'
                    ? 'বৈবাহিক তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে'
                    : error.message || 'Failed to save marital information',
                variant: "destructive",
            });
        },
    });

    // Delete mutation - removes spouse records then marital record for the current user
    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('No user logged in');

            // fetch marital info id for the user
            const { data: maritalInfo, error: fetchError } = await supabase
                .from('marital_information')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (fetchError) throw fetchError;
            if (!maritalInfo || !('id' in maritalInfo)) return null;

            const id = (maritalInfo as { id: string }).id;

            // delete spouse records
            const { error: delSpError } = await supabase
                .from('spouse_information')
                .delete()
                .eq('marital_info_id', id);

            if (delSpError) throw delSpError;

            // delete marital info
            const { error: delMError } = await supabase
                .from('marital_information')
                .delete()
                .eq('id', id);

            if (delMError) throw delMError;

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marital-status'] });
            reset({ maritalStatus: undefined, spouses: [] });
            setIsSubmitted(false);
            setIsEditing(false);
            toast({
                title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted',
                description: language === 'bn' ? 'বৈবাহিক তথ্য সফলভাবে মুছে ফেলা হয়েছে' : 'Marital information deleted successfully',
            });
        },
        onError: (error: Error) => {
            toast({
                title: language === 'bn' ? 'ত্রুটি' : 'Error',
                description: language === 'bn' ? 'মুছতে ব্যর্থ' : (error.message || 'Failed to delete marital information'),
                variant: 'destructive',
            });
        }
    });

    const handleNavigate = (section: string) => {
        if (section === 'logout') {
            navigate('/login');
        } else if (section === 'dashboard') {
            navigate('/');
        } else {
            navigate(`/${section}`);
        }
    };

    const handleLanguageChange = (newLanguage: 'bn' | 'en') => {
        setLanguage(newLanguage);
    };

    const { fields, append, remove } = useFieldArray({
        control,
        name: "spouses",
    });

    const maritalStatus = watch("maritalStatus");
    const showSpouseFields = maritalStatus === "married" || maritalStatus === "divorced";

    // Form submission handler is defined in the backend integration section below

    const handleMaritalStatusChange = (value: string) => {
        setValue("maritalStatus", value as 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower');

        // If switching to married/divorced and no spouse exists, add one
        if ((value === "married" || value === "divorced") && fields.length === 0) {
            // ensure we don't exceed max
            if (fields.length >= maxSpouses) {
                toast({ title: language === 'bn' ? 'সর্বোচ্চ ৪টি ফর্ম অনুমোদিত' : 'Maximum 4 spouse forms allowed', variant: 'destructive' });
                return;
            }
            append({
                name: "",
                occupation: "other",
                nid: "",
                tin: "",
                district: "",
                employeeId: "",
                designation: "",
                officeAddress: "",
                officePhone: "",
                businessName: "",
                businessType: "",
                businessAddress: "",
                businessPhone: "",
                businessRegNumber: "",
            });
        }

        // If switching away from married/divorced, clear spouses
        if (value !== "married" && value !== "divorced") {
            setValue("spouses", []);
        }
    };


    // backend integration (use react-query for loading/saving)
    const [isSubmitting, setIsSubmitting] = useState(false);

    // derived UI flags
    const spouses = (watch('spouses') || []);
    const spousesCount = spouses.length;

    // compute counts per occupation for quick UI display
    const occupationCounts: Record<string, number> = { govtEmployee: 0, privateEmployee: 0, business: 0, housewife: 0, other: 0 };
    spouses.forEach((s: Partial<{ occupation?: string }>) => {
        const occ = (s?.occupation as string) || 'other';
        if (occ in occupationCounts) {
            (occupationCounts as Record<string, number>)[occ] += 1;
        } else {
            occupationCounts.other += 1;
        }
    });

    type SpouseFormItem = { name?: string | null; tin?: string | null; district?: string | null };

    // manual required-check: when spouse fields are visible we require name, tin and district for each spouse
    const spouseFieldsFilled = !showSpouseFields || (spousesCount > 0 && spouses.every((s: SpouseFormItem) => ((s?.name || '')?.toString().trim().length ?? 0) > 0 && ((s?.tin || '')?.toString().trim().length ?? 0) > 0 && ((s?.district || '')?.toString().trim().length ?? 0) > 0));

    const canSubmit = !isSubmitting && (!isSubmitted || isEditing) && spousesCount <= maxSpouses && spouseFieldsFilled && !!watch('maritalStatus');
    const clearDisabled = isSubmitted || (!formState.isDirty && !isEditing);
    const deleteDisabled = deleteMutation.status === 'pending' || !(maritalData?.id || isSubmitted);
    const addDisabled = (isSubmitted && !isEditing) || spousesCount >= maxSpouses;

    // onSubmit delegates saving to the existing react-query mutation `saveMutation`
    const onSubmit = async (data: FormValues) => {
        if (!user) return;

        // enforce max spouses before calling server
        if (data.spouses && data.spouses.length > maxSpouses) {
            toast({ title: language === 'bn' ? 'সর্বোচ্চ ৪টি ফর্ম জমা দিতে পারবেন' : 'Cannot submit more than 4 spouse forms', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await saveMutation.mutateAsync(data);
            // mark submitted state handled in onSuccess of mutation; but ensure local state as well
            setIsSubmitted(true);
            setIsEditing(false);
        } catch (err) {
            // error handled in mutation onError, but log here as well
            console.error('Error saving marital data:', err);
        } finally {
            setIsSubmitting(false);
        }
    };
    // end backend integration

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar language={language} onNavigate={handleNavigate} />
                <div className="flex-1 flex flex-col">
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                        <div className="flex items-center">
                            <SidebarTrigger className="p-2 h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                                <Menu className="h-5 w-5" />
                            </SidebarTrigger>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/">{t.dashboard}</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{t.maritalStatus}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        <LanguageToggle onLanguageChange={handleLanguageChange} currentLanguage={language} />
                        <ThemeToggle />
                    </header>

                    <main className="flex-1 p-6 overflow-auto">
                        <CardHeader>
                            <CardTitle>{t.title}</CardTitle>
                            <CardDescription className="text-red-700 font-extrabold text-base">
                                {language === 'bn'
                                    ? '*আপনার বৈবাহিক তথ্য এবং স্বামী/স্ত্রীর বিবরণ প্রদান করুন । সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ না করা পর্যন্ত আপনি ফর্মটি সংরক্ষণ করতে পারবেন না। সঠিক তথ্য প্রদান করুন। সর্বোচ্চ ৪টি স্বামী/স্ত্রীর তথ্য প্রদান করা যাবে।'
                                    : '*Provide your marital information and spouse details. You cant save the form unless all required fields are filled. Please provide accurate information. A maximum of 4 spouse entries are allowed.'}
                            </CardDescription>
                        </CardHeader>
                        <div className="max-w-7xl mx-auto">
                            <Card>
                                <CardContent>
                                    <Form {...form}>
                                        <form
                                            onSubmit={handleSubmit(onSubmit, (errors) => {
                                                const firstErrorPath = Object.keys(errors)[0];
                                                if (firstErrorPath) {
                                                    try {
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        setFocus(firstErrorPath as any);
                                                        const el = document.querySelector(`[name="${firstErrorPath}"]`) as HTMLElement | null;
                                                        if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    } catch (e) {
                                                        // ignore
                                                    }
                                                }
                                            })}
                                            className="space-y-6"
                                        >
                                            <FormField
                                                control={form.control}
                                                name="maritalStatus"
                                                render={({ field }) => (
                                                    <FormItem className="mt-5">
                                                        <FormLabel>{t.maritalStatusLabel} *</FormLabel>
                                                        <Select
                                                            onValueChange={(val) => {
                                                                field.onChange(val);
                                                                handleMaritalStatusChange(val);
                                                            }}
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={t.maritalStatusPlaceholder} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="married">{t.married}</SelectItem>
                                                                <SelectItem value="unmarried">{t.unmarried}</SelectItem>
                                                                <SelectItem value="widow">{t.widow}</SelectItem>
                                                                <SelectItem value="divorced">{t.divorced}</SelectItem>
                                                                <SelectItem value="widower">{t.widower}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {showSpouseFields && (
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <h3 className="text-lg font-semibold">{t.spouseInformation}</h3>
                                                            <div className="text-sm text-muted-foreground hidden sm:block">
                                                                <div className="flex gap-5">
                                                                    {/* when 0 to 1 the color will be green then 2 the color will be light green then 3 the color will be light red then 4 the color will be dark red */}
                                                                    <span className={`font-bold ${spousesCount === 0 ? 'text-green-700' : spousesCount === 1 ? 'text-green-600' : spousesCount === 2 ? 'text-yellow-600' : spousesCount === 3 ? 'text-red-600' : 'text-red-900'}`}>
                                                                        {language === 'bn' ? `সংখ্যা: ${spousesCount}/${maxSpouses}` : `Spouses: ${spousesCount}/${maxSpouses}`}
                                                                    </span>
                                                                    <div className="flex gap-2 mt-1 flex-wrap">
                                                                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{t.govtEmployee}: {occupationCounts.govtEmployee}</span>
                                                                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{t.privateEmployee}: {occupationCounts.privateEmployee}</span>
                                                                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{t.business}: {occupationCounts.business}</span>
                                                                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{t.housewife}: {occupationCounts.housewife}</span>
                                                                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{t.other}: {occupationCounts.other}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={addDisabled}
                                                            onClick={() => {
                                                                if (addDisabled) {
                                                                    toast({ title: language === 'bn' ? 'সর্বোচ্চ ৪টি ফর্ম অনুমোদিত' : 'Maximum 4 spouse forms allowed', variant: 'destructive' });
                                                                    return;
                                                                }

                                                                append({
                                                                    name: "",
                                                                    occupation: "other",
                                                                    nid: "",
                                                                    tin: "",
                                                                    district: "",
                                                                    employeeId: "",
                                                                    designation: "",
                                                                    officeAddress: "",
                                                                    officePhone: "",
                                                                    businessName: "",
                                                                    businessType: "",
                                                                    businessAddress: "",
                                                                    businessPhone: "",
                                                                    businessRegNumber: "",
                                                                });
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            {t.addSpouse}
                                                        </Button>
                                                    </div>

                                                    {fields.map((field, index) => {
                                                        const occupation = watch(`spouses.${index}.occupation`);
                                                        const isGovtEmployee = occupation === "govtEmployee";
                                                        const isPrivateEmployee = occupation === "privateEmployee";
                                                        const isBusiness = occupation === "business";

                                                        return (
                                                            <Card key={field.id} className="p-4 relative">
                                                                {fields.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute top-2 right-5 hover:bg-red-100"
                                                                        disabled={isSubmitted && !isEditing}
                                                                        onClick={() => remove(index)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-700 " />
                                                                    </Button>
                                                                )}

                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`spouses.${index}.name`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="md:col-span-2">
                                                                                <FormLabel>{t.spouseName} *</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.spouseNamePlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`spouses.${index}.occupation`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.occupation}</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitted && !isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.occupationPlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="govtEmployee">{t.govtEmployee}</SelectItem>
                                                                                        <SelectItem value="privateEmployee">{t.privateEmployee}</SelectItem>
                                                                                        <SelectItem value="business">{t.business}</SelectItem>
                                                                                        <SelectItem value="housewife">{t.housewife}</SelectItem>
                                                                                        <SelectItem value="other">{t.other}</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`spouses.${index}.district`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.district}</FormLabel>
                                                                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitted && !isEditing}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger>
                                                                                            <SelectValue placeholder={t.districtPlaceholder} />
                                                                                        </SelectTrigger>
                                                                                    </FormControl>
                                                                                    <SelectContent>
                                                                                        {bangladeshDistricts.map((district) => (
                                                                                            <SelectItem key={district} value={district}>
                                                                                                {district}
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`spouses.${index}.nid`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.nid}</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.nidPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`spouses.${index}.tin`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel>{t.tin}</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder={t.tinPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    {isGovtEmployee && (
                                                                        <>
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.employeeId`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>{t.employeeId}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.employeeIdPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.designation`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>{t.designation}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.designationPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.officeAddress`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="md:col-span-2">
                                                                                        <FormLabel>{t.officeAddress}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.officeAddressPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.officePhone`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>{t.officePhone}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.officePhonePlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </>
                                                                    )}

                                                                    {
                                                                        isPrivateEmployee && (
                                                                            <>
                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={`spouses.${index}.employeeId`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormLabel>{t.employeeId}</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input placeholder={t.employeeIdPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                            </FormControl>
                                                                                            <FormMessage />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />

                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={`spouses.${index}.designation`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormLabel>{t.designation}</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input placeholder={t.designationPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                            </FormControl>
                                                                                            <FormMessage />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />

                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={`spouses.${index}.officeAddress`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem className="md:col-span-2">
                                                                                            <FormLabel>{t.officeAddress}</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input placeholder={t.officeAddressPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                            </FormControl>
                                                                                            <FormMessage />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />

                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={`spouses.${index}.officePhone`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormLabel>{t.officePhone}</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input placeholder={t.officePhonePlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                            </FormControl>
                                                                                            <FormMessage />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />
                                                                            </>
                                                                        )
                                                                    }

                                                                    {isBusiness && (
                                                                        <>
                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.businessName`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="md:col-span-2">
                                                                                        <FormLabel>{t.businessName}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.businessNamePlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.businessType`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>{t.businessType}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.businessTypePlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.businessAddress`}
                                                                                render={({ field }) => (
                                                                                    <FormItem className="md:col-span-2">
                                                                                        <FormLabel>{t.businessAddress}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.businessAddressPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.businessRegNumber`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>{t.businessRegNumber}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.businessRegNumberPlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />

                                                                            <FormField
                                                                                control={form.control}
                                                                                name={`spouses.${index}.businessPhone`}
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormLabel>{t.businessPhone}</FormLabel>
                                                                                        <FormControl>
                                                                                            <Input placeholder={t.businessPhonePlaceholder} {...field} disabled={isSubmitted && !isEditing} />
                                                                                        </FormControl>
                                                                                        <FormMessage />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="flex justify-end items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="bg-black text-white hover:bg-gray-800"
                                                    size="lg"
                                                    onClick={() => clearForm()}
                                                    disabled={clearDisabled}
                                                >
                                                    {language === 'bn' ? 'ফরম পরিষ্কার করুন' : 'Clear Form'}
                                                </Button>
                                                {isSubmitted && !isEditing && (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="lg"
                                                        onClick={() => {
                                                            // enable editing of the saved submission
                                                            setIsEditing(true);
                                                            setIsSubmitted(false);
                                                        }}
                                                    >
                                                        {language === 'bn' ? 'সম্পাদনা' : 'Edit'}
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="lg"
                                                    onClick={() => {
                                                        if (!user) {
                                                            toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'প্রবেশাধিকার নেই' : 'No user logged in', variant: 'destructive' });
                                                            return;
                                                        }

                                                        // If there is no saved marital record, offer to clear the form via the clear modal
                                                        if (!maritalData?.id) {
                                                            setClearDialogOpen(true);
                                                            return;
                                                        }

                                                        // otherwise open delete confirmation modal
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    disabled={deleteDisabled}
                                                >
                                                    {deleteMutation.status === 'pending' ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        language === 'bn' ? 'মুছুন' : 'Delete'
                                                    )}
                                                </Button>

                                                <Button type="submit" size="lg" disabled={!canSubmit || saveMutation.status === 'pending'}>
                                                    {isSubmitting || saveMutation.status === 'pending' ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        isEditing ? (language === 'bn' ? 'আপডেট' : 'Update') : t.save
                                                    )}
                                                </Button>

                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>

            {/* Confirmation Dialogs */}
            <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}</DialogTitle>
                        <DialogDescription>
                            {language === 'bn' ? 'আপনি কি ফরমটি পরিষ্কার করতে চান?' : 'Do you want to clear the form?'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                            {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </Button>
                        <Button className="bg-black text-white" onClick={() => {
                            reset({ maritalStatus: undefined, spouses: [] });
                            setIsEditing(false);
                            setIsSubmitted(false);
                            setClearDialogOpen(false);
                            toast({ title: language === 'bn' ? 'ফরম পরিষ্কার করা হয়েছে' : 'Form cleared' });
                        }}>
                            {language === 'bn' ? 'হ্যাঁ' : 'Yes'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}</DialogTitle>
                        <DialogDescription>
                            {maritalData?.id
                                ? (language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই তথ্যগুলো মুছে ফেলতে চান?' : 'Are you sure you want to permanently delete this marital information?')
                                : (language === 'bn' ? 'কোনো সংরক্ষিত রেকর্ড নেই. ফরম রিসেট করতে চান?' : 'No saved marital record found. Clear the form?')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </Button>
                        <Button className={maritalData?.id ? "bg-destructive text-white" : "bg-black text-white"} onClick={() => {
                            setDeleteDialogOpen(false);
                            if (!maritalData?.id) {
                                reset({ maritalStatus: undefined, spouses: [] });
                                setIsEditing(false);
                                setIsSubmitted(false);
                                toast({ title: language === 'bn' ? 'ফরম রিসেট করা হয়েছে' : 'Form cleared' });
                                return;
                            }

                            // perform delete
                            deleteMutation.mutate();
                        }}>
                            {language === 'bn' ? 'হ্যাঁ' : 'Yes'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </SidebarProvider>
    );
};

export default MaritalStatus;
