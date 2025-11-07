import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import React from "react";

interface MaritalStatusProps {
    language: 'bn' | 'en';
}

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
    occupation: z.string().optional(),
    nid: z.string().optional().refine((val) => {
        if (!val) return true;
        return /^\d{10,17}$/.test(val);
    }, "NID must be 10-17 digits"),
    tin: z.string().optional(),
    district: z.string().optional(),
    employeeId: z.string().optional(),
    designation: z.string().optional(),
    officeAddress: z.string().optional(),
    officePhone: z.string().optional().refine((val) => {
        if (!val) return true;
        return /^(\+8801|01)\d{9}$/.test(val);
    }, "Phone must be +8801XXXXXXXXX or 01XXXXXXXXX format"),
});

const formSchema = z.object({
    maritalStatus: z.enum(["married", "unmarried", "widow", "divorced", "widower"], {
        required_error: "Marital status is required",
    }),
    spouses: z.array(spouseSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const MaritalStatus = ({ language: initialLanguage }: MaritalStatusProps) => {
    const [language, setLanguage] = React.useState<'bn' | 'en'>(initialLanguage);
    const t = translations[language];
    const { toast } = useToast();
    const navigate = useNavigate();

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

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            maritalStatus: undefined,
            spouses: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "spouses",
    });

    const maritalStatus = form.watch("maritalStatus");
    const showSpouseFields = maritalStatus === "married" || maritalStatus === "divorced";

    const onSubmit = (data: FormValues) => {
        console.log("Form data:", data);
        toast({
            title: t.success,
            description: t.successDesc,
        });
    };

    const handleMaritalStatusChange = (value: string) => {
        form.setValue("maritalStatus", value as any);

        // If switching to married/divorced and no spouse exists, add one
        if ((value === "married" || value === "divorced") && fields.length === 0) {
            append({
                name: "",
                occupation: "",
                nid: "",
                tin: "",
                district: "",
                employeeId: "",
                designation: "",
                officeAddress: "",
                officePhone: "",
            });
        }

        // If switching away from married/divorced, clear spouses
        if (value !== "married" && value !== "divorced") {
            form.setValue("spouses", []);
        }
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar language={language} onNavigate={handleNavigate} />
                <div className="flex-1 flex flex-col">
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
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
                        <ThemeToggle />
                        <LanguageToggle onLanguageChange={handleLanguageChange} currentLanguage={language} />
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
                        <div className="max-w-4xl mx-auto">
                            <Card>
                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="maritalStatus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t.maritalStatusLabel} *</FormLabel>
                                                        <Select
                                                            onValueChange={handleMaritalStatusChange}
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
                                                                occupation: "",
                                                                nid: "",
                                                                tin: "",
                                                                district: "",
                                                                employeeId: "",
                                                                designation: "",
                                                                officeAddress: "",
                                                                officePhone: "",
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
                                                                </div>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            <div className="flex justify-end">
                                                <Button type="submit" size="lg">
                                                    {t.save}
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
