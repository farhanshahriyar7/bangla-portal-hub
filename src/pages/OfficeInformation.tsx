import { useState } from "react";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
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

interface OfficeInfoData {
  id: string;
  ministry: string;
  directorate: string;
  identityNumber: string;
  nid: string;
  tin: string;
  birthPlace: string;
  village: string;
  upazila: string;
  district: string;
  status: "active" | "pending" | "completed";
}

interface OfficeInformationProps {
  language: 'bn' | 'en';
}

export default function OfficeInformation({ language }: OfficeInformationProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<OfficeInfoData | null>(null);
  const [formData, setFormData] = useState<Partial<OfficeInfoData>>({
    ministry: "",
    directorate: "",
    identityNumber: "",
    nid: "",
    tin: "",
    birthPlace: "",
    village: "",
    upazila: "",
    district: "",
  });

  const [data, setData] = useState<OfficeInfoData[]>([
    {
      id: "1",
      ministry: "জনপ্রশাসন মন্ত্রণালয়",
      directorate: "স্বাস্থ্য অধিদপ্তর",
      identityNumber: "123456789",
      nid: "1234567890123",
      tin: "987654321012",
      birthPlace: "ঢাকা",
      village: "মোহাম্মদপুর",
      upazila: "ঢাকা সদর",
      district: "ঢাকা",
      status: "active",
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEntry: OfficeInfoData = {
      id: Date.now().toString(),
      ministry: formData.ministry || "",
      directorate: formData.directorate || "",
      identityNumber: formData.identityNumber || "",
      nid: formData.nid || "",
      tin: formData.tin || "",
      birthPlace: formData.birthPlace || "",
      village: formData.village || "",
      upazila: formData.upazila || "",
      district: formData.district || "",
      status: "pending",
    };

    setData([...data, newEntry]);
    setIsDialogOpen(false);
    setFormData({});
    
    toast({
      title: language === 'bn' ? "সফলভাবে যোগ করা হয়েছে" : "Successfully Added",
      description: language === 'bn' ? "নতুন তথ্য সংরক্ষিত হয়েছে" : "New information has been saved",
    });
  };

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    toast({
      title: language === 'bn' ? "মুছে ফেলা হয়েছে" : "Deleted",
      description: language === 'bn' ? "তথ্য মুছে ফেলা হয়েছে" : "Information has been deleted",
      variant: "destructive",
    });
  };

  const handleView = (item: OfficeInfoData) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      active: { variant: "default", text: language === 'bn' ? "সক্রিয়" : "Active" },
      pending: { variant: "secondary", text: language === 'bn' ? "প্রক্রিয়াধীন" : "Pending" },
      completed: { variant: "outline", text: language === 'bn' ? "সম্পন্ন" : "Completed" },
    };
    
    const statusInfo = variants[status] || variants.active;
    return <Badge variant={statusInfo.variant}>{statusInfo.text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
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
                {language === 'bn' ? 'নতুন তথ্য যোগ করুন' : 'Add New Information'}
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
                    <Label htmlFor="identityNumber">
                      {language === 'bn' ? 'পরিচিতি নম্বর (যদি থাকে)' : 'Identity Number (if any)'}
                    </Label>
                    <Input
                      id="identityNumber"
                      value={formData.identityNumber}
                      onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
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
                    <Label htmlFor="birthPlace">
                      {language === 'bn' ? 'জন্ম স্থান' : 'Birth Place'}
                    </Label>
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
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
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">
                    {language === 'bn' ? 'মন্ত্রণালয়/বিভাগ' : 'Ministry/Division'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'bn' ? 'অধিদপ্তর নাম' : 'Directorate Name'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'bn' ? 'NID নম্বর' : 'NID Number'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'bn' ? 'জেলা' : 'District'}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {language === 'bn' ? 'স্ট্যাটাস' : 'Status'}
                  </TableHead>
                  <TableHead className="font-semibold text-right">
                    {language === 'bn' ? 'কার্যক্রম' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {language === 'bn' ? 'কোন তথ্য পাওয়া যায়নি' : 'No data found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{item.ministry}</TableCell>
                      <TableCell>{item.directorate}</TableCell>
                      <TableCell>{item.nid}</TableCell>
                      <TableCell>{item.district}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(item)}
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <p className="text-base font-medium">{selectedItem.identityNumber || 'N/A'}</p>
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
                <p className="text-base font-medium">{selectedItem.birthPlace}</p>
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
    </div>
  );
}
