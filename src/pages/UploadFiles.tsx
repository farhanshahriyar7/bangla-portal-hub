import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import { Menu, Upload, FileText, Image, FileArchive, Trash2, Download, Bell, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CopyRights } from "@/components/CopyRights";

interface UploadFilesProps {
  language?: 'bn' | 'en';
}

const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

interface UploadProgress {
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  // optional preview url for images
  previewUrl?: string;
  // keep original file when available
  file?: File;
  // track upload progress
  uploadProgress?: UploadProgress;
}

export default function UploadFiles({ language: initialLanguage = 'en' }: UploadFilesProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState(initialLanguage);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const itemsPerPage = 5;
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  const t = {
    dashboard: language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    title: language === 'bn' ? 'ফাইল আপলোড' : 'Upload Files',
    subtitle: language === 'bn' ? 'আপনার নথি এবং ফাইল আপলোড করুন' : 'Upload your documents and files',
    uploadArea: language === 'bn' ? 'এখানে ফাইল ড্রাগ করুন অথবা ক্লিক করুন' : 'Drag and drop files here or click to browse',
    browseFiles: language === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Browse Files',
    uploadedFiles: language === 'bn' ? 'আপলোড করা ফাইল' : 'Uploaded Files',
    noFiles: language === 'bn' ? 'এখনো কোন ফাইল আপলোড করা হয়নি' : 'No files uploaded yet',
    fileName: language === 'bn' ? 'ফাইলের নাম' : 'File Name',
    fileSize: language === 'bn' ? 'আকার' : 'Size',
    uploadedAt: language === 'bn' ? 'আপলোডের সময়' : 'Uploaded At',
    actions: language === 'bn' ? 'কার্যক্রম' : 'Actions',
    delete: language === 'bn' ? 'মুছুন' : 'Delete',
    download: language === 'bn' ? 'ডাউনলোড' : 'Download',
    maxSize: language === 'bn' ? 'সর্বোচ্চ ফাইল সাইজ: 10MB' : 'Maximum file size: 10MB',
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: language === 'bn' 
          ? 'শুধুমাত্র PDF, JPG, JPEG এবং PNG ফাইল আপলোড করা যাবে'
          : 'Only PDF, JPG, JPEG and PNG files are allowed'
      };
    }
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: language === 'bn'
          ? 'ফাইলের সাইজ ১০ মেগাবাইটের বেশি হতে পারবে না'
          : 'File size cannot exceed 10MB'
      };
    }
    return { valid: true };
  };

  const simulateFileUpload = async (file: File, onProgress: (progress: number) => void): Promise<void> => {
    const totalSize = file.size;
    let uploadedSize = 0;
    const chunkSize = totalSize / 10; // Simulate 10 chunks
    
    while (uploadedSize < totalSize) {
      await new Promise(resolve => setTimeout(resolve, 200)); // 200ms per chunk
      uploadedSize = Math.min(uploadedSize + chunkSize, totalSize);
      const progress = (uploadedSize / totalSize) * 100;
      onProgress(progress);
    }
  };

  const handleFiles = async (files: FileList) => {
    // Validate files first
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show errors if any
    if (errors.length > 0) {
      toast({
        title: language === 'bn' ? 'ত্রুটি!' : 'Error!',
        description: errors.join('\n'),
        variant: "destructive",
      });
      if (validFiles.length === 0) return; // Stop if no valid files
    }

    setUploading(true);
    setOverallProgress(0);

    setUploading(true);
    setOverallProgress(0);

    try {
      // Initialize files with 0% progress
      const newFiles: UploadedFile[] = validFiles.map((file, index) => {
        const previewUrl = (file.type.startsWith('image/') || file.type === 'application/pdf') 
          ? URL.createObjectURL(file) 
          : undefined;
        if (previewUrl) previewUrlsRef.current.add(previewUrl);
        return {
          id: `file-${Date.now()}-${index}`,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          uploadedAt: new Date().toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US'),
          previewUrl,
          file,
          uploadProgress: {
            progress: 0,
            status: 'pending'
          }
        };
      });

      // Add files to state immediately to show progress
      setUploadedFiles((prev) => [...newFiles, ...prev]);

      // Process uploads one by one
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        
        // Update file progress
        await simulateFileUpload(file.file!, (progress) => {
          setUploadedFiles((prev) => {
            const updatedFiles = [...prev];
            const fileIndex = updatedFiles.findIndex(f => f.id === file.id);
            if (fileIndex !== -1) {
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                uploadProgress: {
                  progress: Math.round(progress),
                  status: progress === 100 ? 'completed' : 'uploading'
                }
              };
            }
            return updatedFiles;
          });

          // Update overall progress
          const totalProgress = ((i + (progress / 100)) / newFiles.length) * 100;
          setOverallProgress(Math.round(totalProgress));
        });
      }

      toast({
        title: language === 'bn' ? 'সফল!' : 'Success!',
        description: language === 'bn' 
          ? `${validFiles.length}টি ফাইল আপলোড করা হয়েছে` 
          : `${validFiles.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি!' : 'Error!',
        description: language === 'bn' 
          ? 'ফাইল আপলোড করতে সমস্যা হয়েছে' 
          : 'There was an error uploading the files',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setOverallProgress(0);
    }
  };

  // Prevent the browser from navigating / opening files when files are dropped
  useEffect(() => {
    const onWindowDragOver = (e: DragEvent) => e.preventDefault();
    const onWindowDrop = (e: DragEvent) => e.preventDefault();

    window.addEventListener('dragover', onWindowDragOver);
    window.addEventListener('drop', onWindowDrop);

    return () => {
      window.removeEventListener('dragover', onWindowDragOver);
      window.removeEventListener('drop', onWindowDrop);
    };
  }, []);

  // Note: preview URLs are revoked on delete; a full unmount cleanup was intentionally omitted
  // to avoid revoking URLs that may still be in use. If needed, we can implement a robust
  // unmount revocation strategy that snapshots refs safely.

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDelete = (id: string) => {
    setUploadedFiles((prev) => {
      const toDelete = prev.find((f) => f.id === id);
      if (toDelete?.previewUrl) {
        URL.revokeObjectURL(toDelete.previewUrl);
        previewUrlsRef.current.delete(toDelete.previewUrl);
      }
      const updated = prev.filter(file => file.id !== id);
      // adjust current page if necessary
      const maxPage = Math.max(1, Math.ceil(updated.length / itemsPerPage));
      if (currentPage > maxPage) setCurrentPage(maxPage);
      return updated;
    });
    toast({
      title: language === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted',
      description: language === 'bn' ? 'ফাইলটি মুছে ফেলা হয়েছে' : 'File has been deleted',
      variant: "destructive",
    });
  };

  const openPreview = (file: UploadedFile) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleDownload = async (file: UploadedFile) => {
    if (!file.file) {
      toast({
        title: language === 'bn' ? 'ত্রুটি!' : 'Error!',
        description: language === 'bn' ? 'ফাইল ডাউনলোড করা যাচ্ছে না' : 'File cannot be downloaded',
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloadingFile(file.id);

      // Simulate some processing time for the animation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a temporary URL for the file
      const url = URL.createObjectURL(file.file);
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: language === 'bn' ? 'ডাউনলোড শুরু হয়েছে!' : 'Download Started!',
        description: language === 'bn' ? 'ফাইল ডাউনলোড হচ্ছে' : 'File is being downloaded',
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-5 w-5" />;
    if (type.includes('zip') || type.includes('archive')) return <FileArchive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar language={language} onNavigate={(section) => {
          if (section === 'logout') {
            navigate('/login');
          } else if (section === 'dashboard') {
            navigate('/');
          } else {
            navigate(`/${section}`);
          }
        }} />

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>

               <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/">{t.dashboard}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{t.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex-1" />

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/notifications')}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </Button>
                <LanguageToggle
                  onLanguageChange={(newLang) => {
                    setLanguage(newLang);
                  }}
                  currentLanguage={language}
                />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
            {/* Header with Breadcrumb */}
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-4 w-4" />
              </SidebarTrigger>

            </div>

            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>{t.title}</CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-2">{t.uploadArea}</p>
                      <p className="text-sm text-muted-foreground">{t.maxSize}</p>
                    </div>
                    <Label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>{t.browseFiles}</span>
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files List */}
            <Card>
              <CardHeader>
                <CardTitle>{t.uploadedFiles}</CardTitle>
                <CardDescription>
                  {uploadedFiles.length === 0 ? t.noFiles : `${uploadedFiles.length} file(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploading && (
                  <div className="mb-4">
                    <Progress value={overallProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === 'bn' 
                        ? `আপলোড হচ্ছে... ${overallProgress}%`
                        : `Uploading... ${overallProgress}%`}
                    </p>
                  </div>
                )}
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t.noFiles}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Paginate: show latest files first (uploadedFiles already prepends) */}
                    {uploadedFiles
                      .slice()
                      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                      .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="text-primary">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>{file.uploadedAt}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {file.uploadProgress && file.uploadProgress.status !== 'completed' && (
                            <div className="w-[100px]">
                              <Progress value={file.uploadProgress.progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {file.uploadProgress.progress}%
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title={t.download}
                              onClick={() => handleDownload(file)}
                              disabled={downloadingFile === file.id || (file.uploadProgress && file.uploadProgress.status !== 'completed')}
                            >
                              {downloadingFile === file.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            {/* Preview eye icon placed to the left of download (as requested) */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title={language === 'bn' ? 'পূর্বরূপ' : 'Preview'}
                              onClick={() => openPreview(file)}
                              disabled={file.uploadProgress && file.uploadProgress.status !== 'completed'}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(file.id)}
                              title={t.delete}
                              disabled={file.uploadProgress && file.uploadProgress.status === 'uploading'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Pagination controls */}
                    {uploadedFiles.length > itemsPerPage && (
                      <div className="flex justify-center mt-2">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
                            </PaginationItem>
                            {/* Simple numbered pages */}
                            {Array.from({ length: Math.ceil(uploadedFiles.length / itemsPerPage) }).map((_, i) => (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={currentPage === i + 1}
                                  onClick={() => setCurrentPage(i + 1)}
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            <PaginationItem>
                              <PaginationNext onClick={() => setCurrentPage((p) => Math.min(Math.ceil(uploadedFiles.length / itemsPerPage), p + 1))} />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={(open) => { if (!open) setPreviewFile(null); setPreviewOpen(open); }}>
              {previewFile && (
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{previewFile.name}</DialogTitle>
                    <DialogDescription className="truncate">{previewFile.size} • {previewFile.uploadedAt}</DialogDescription>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => previewFile && handleDownload(previewFile)}
                          disabled={downloadingFile === previewFile.id}
                          className={downloadingFile === previewFile.id ? 'animate-pulse' : ''}
                        >
                          <Download className={`h-4 w-4 mr-2 ${downloadingFile === previewFile.id ? 'animate-bounce' : ''}`} />
                          {language === 'bn' ? 'ডাউনলোড' : 'Download'}
                        </Button>
                      </div>
                    </DialogHeader>
                  <div className="mt-4">
                    {!previewFile.previewUrl ? (
                      <div className="text-center text-muted-foreground py-8">
                        {language === 'bn' ? 'পূর্বরূপ উপলব্ধ নেই' : 'Preview not available'}
                      </div>
                    ) : previewFile.type.startsWith('image/') ? (
                      <img 
                        src={previewFile.previewUrl} 
                        alt={previewFile.name} 
                        className="mx-auto max-h-[60vh] object-contain" 
                      />
                    ) : previewFile.type === 'application/pdf' ? (
                      <object
                        data={previewFile.previewUrl}
                        type="application/pdf"
                        className="w-full h-[60vh]"
                      >
                        <div className="text-center text-muted-foreground py-8">
                          {language === 'bn' ? 'পিডিএফ দেখার জন্য পিডিএফ ভিউয়ার প্রয়োজন' : 'PDF viewer is required to view this file'}
                        </div>
                      </object>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        {language === 'bn' ? 'পূর্বরূপ উপলব্ধ নেই' : 'Preview not available'}
                      </div>
                    )}
                  </div>
                </DialogContent>
              )}
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
}
