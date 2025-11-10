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

interface MaritalInformationWithSpouse extends MaritalInformationRow {
    spouse_information?: SpouseInformationRow[];
}

// Form error type
type FormError = PostgrestError | Error;

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
    tin: z.string().optional(),
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
        if (!data.employeeId?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Employee ID is required for employees",
                path: ["employeeId"],
            });
        }
        if (!data.designation?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Designation is required for employees",
                path: ["designation"],
            });
        }
        if (!data.officeAddress?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Office address is required for employees",
                path: ["officeAddress"],
            });
        }
        if (!data.officePhone?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Office phone is required for employees",
                path: ["officePhone"],
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
        required_error: "Marital status is required",
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
        mode: "onBlur",
    });

    // Form states
    const [isEditing, setIsEditing] = useState(false);

    const clearForm = () => {
        if (confirm(language === 'bn' ? 'আপনি কি ফরমটি পরিষ্কার করতে চান?' : 'Do you want to clear the form?')) {
            form.reset({ maritalStatus: undefined, spouses: [] });
            setIsEditing(false);
        }
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

            form.reset({
                maritalStatus: maritalData.marital_status,
                spouses: mappedSpouses,
            });
            setIsEditing(true);
        }
    }, [maritalData, form]);
    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async (formData: FormValues) => {
            if (!user) throw new Error('No user logged in');

            // Upsert marital information
            const { data: maritalInfo, error: maritalError } = await supabase
                .from('marital_information')
                .upsert({
                    user_id: user.id,
                    marital_status: formData.maritalStatus,
                })
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
            form.reset({ maritalStatus: undefined, spouses: [] });
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
        control: form.control,
        name: "spouses",
    });

    const maritalStatus = form.watch("maritalStatus");
    const showSpouseFields = maritalStatus === "married" || maritalStatus === "divorced";

    // Form submission handler is defined in the backend integration section below

    const handleMaritalStatusChange = (value: string) => {
        form.setValue("maritalStatus", value as 'married' | 'unmarried' | 'widow' | 'divorced' | 'widower');

        // If switching to married/divorced and no spouse exists, add one
        if ((value === "married" || value === "divorced") && fields.length === 0) {
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
            form.setValue("spouses", []);
        }
    };


    // backend integration (use react-query for loading/saving)
    const [isSubmitting, setIsSubmitting] = useState(false);

    // onSubmit delegates saving to the existing react-query mutation `saveMutation`
    const onSubmit = async (data: FormValues) => {
        if (!user) return;
        setIsSubmitting(true);
        try {
            await saveMutation.mutateAsync(data);
            setIsEditing(true);
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
                            <CardDescription>
                                {language === 'bn'
                                    ? 'আপনার বৈবাহিক তথ্য এবং স্বামী/স্ত্রীর বিবরণ প্রদান করুন'
                                    : 'Provide your marital information and spouse details'}
                            </CardDescription>
                        </CardHeader>
                        <div className="max-w-7xl mx-auto">
                            <Card>
                                <CardContent>
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(onSubmit, (errors) => {
                                                const firstErrorPath = Object.keys(errors)[0];
                                                if (firstErrorPath) {
                                                    try {
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        form.setFocus(firstErrorPath as any);
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
                                                        <h3 className="text-lg font-semibold">{t.spouseInformation}</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => append({
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
                                                            })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            {t.addSpouse}
                                                        </Button>
                                                    </div>

                                                    {fields.map((field, index) => {
                                                        const occupation = form.watch(`spouses.${index}.occupation`);
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
                                                                        className="absolute top-2 right-2"
                                                                        onClick={() => remove(index)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
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
                                                                                    <Input placeholder={t.spouseNamePlaceholder} {...field} />
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
                                                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                                                                    <Input placeholder={t.nidPlaceholder} {...field} />
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
                                                                                    <Input placeholder={t.tinPlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.employeeIdPlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.designationPlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.officeAddressPlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.officePhonePlaceholder} {...field} />
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
                                                                                                <Input placeholder={t.employeeIdPlaceholder} {...field} />
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
                                                                                                <Input placeholder={t.designationPlaceholder} {...field} />
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
                                                                                                <Input placeholder={t.officeAddressPlaceholder} {...field} />
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
                                                                                                <Input placeholder={t.officePhonePlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.businessNamePlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.businessTypePlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.businessAddressPlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.businessRegNumberPlaceholder} {...field} />
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
                                                                                            <Input placeholder={t.businessPhonePlaceholder} {...field} />
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
                                                >
                                                    {language === 'bn' ? 'ফরম পরিষ্কার করুন' : 'Clear Form'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="lg"
                                                    onClick={() => {
                                                        if (!user) {
                                                            toast({ title: language === 'bn' ? 'ত্রুটি' : 'Error', description: language === 'bn' ? 'প্রবেশাধিকার নেই' : 'No user logged in', variant: 'destructive' });
                                                            return;
                                                        }

                                                        if (!maritalData?.id) {
                                                            // nothing to delete
                                                            if (!confirm(language === 'bn' ? 'আপনি নিশ্চিতভাবে কোন তথ্য নেই, ফর্ম রিসেট করতে চান?' : 'No saved marital record found. Clear the form?')) return;
                                                            form.reset({ maritalStatus: undefined, spouses: [] });
                                                            return;
                                                        }

                                                        const message = language === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই তথ্যগুলো মুছে ফেলতে চান?' : 'Are you sure you want to permanently delete this marital information?';
                                                        if (!confirm(message)) return;

                                                        deleteMutation.mutate();
                                                    }}
                                                    disabled={deleteMutation.status === 'pending'}
                                                >
                                                    {deleteMutation.status === 'pending' ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        language === 'bn' ? 'মুছুন' : 'Delete'
                                                    )}
                                                </Button>

                                                <Button type="submit" size="lg" disabled={isSubmitting || saveMutation.status === 'pending'}>
                                                    {isSubmitting || saveMutation.status === 'pending' ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        t.save
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
        </SidebarProvider>
    );
};

export default MaritalStatus;
