// File validation utilities for secure file uploads

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// Allowed MIME types for different file categories
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

// File size limits
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5MB

// File signature (magic numbers) for common types
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]] // %PDF
};

/**
 * Sanitize file name to prevent path traversal attacks
 */
export const sanitizeFileName = (fileName: string): string => {
  // Remove any directory traversal attempts
  const baseName = fileName.split('/').pop() || fileName;
  
  // Replace any non-alphanumeric characters (except dots and dashes) with underscores
  return baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Check if file signature matches declared MIME type
 */
const verifyFileSignature = async (file: File): Promise<boolean> => {
  const signatures = FILE_SIGNATURES[file.type];
  if (!signatures) return true; // Skip verification for unknown types
  
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check if any of the valid signatures match
    return signatures.some(signature => {
      return signature.every((byte, index) => bytes[index] === byte);
    });
  } catch {
    return false;
  }
};

/**
 * Validate photo file (for passport photos, profile pictures)
 */
export const validatePhotoFile = async (file: File): Promise<FileValidationResult> => {
  // Check file size
  if (file.size > MAX_PHOTO_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_PHOTO_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, and WebP images are allowed'
    };
  }
  
  // Verify file signature matches MIME type
  const signatureValid = await verifyFileSignature(file);
  if (!signatureValid) {
    return {
      valid: false,
      error: 'File type does not match its content. Possible file spoofing detected.'
    };
  }
  
  // Block SVG files (XSS risk)
  if (file.name.toLowerCase().endsWith('.svg')) {
    return {
      valid: false,
      error: 'SVG files are not allowed due to security risks'
    };
  }
  
  return { valid: true };
};

/**
 * Validate document file (for ID proofs, certificates)
 */
export const validateDocumentFile = async (file: File): Promise<FileValidationResult> => {
  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Check MIME type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF, JPEG, and PNG files are allowed'
    };
  }
  
  // Verify file signature matches MIME type
  const signatureValid = await verifyFileSignature(file);
  if (!signatureValid) {
    return {
      valid: false,
      error: 'File type does not match its content. Possible file spoofing detected.'
    };
  }
  
  return { valid: true };
};

/**
 * Get safe file extension from MIME type
 */
export const getExtensionFromMimeType = (mimeType: string): string => {
  const extensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf'
  };
  
  return extensionMap[mimeType] || 'bin';
};
