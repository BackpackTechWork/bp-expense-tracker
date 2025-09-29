import { FileStorageService, type FileUploadOptions } from "./storage";

/**
 * File upload configuration
 */
export interface UploadConfig {
    maxSize: number; // in bytes
    allowedTypes: string[];
    storagePath: string;
}

/**
 * Default upload configurations for different file types
 */
export const UPLOAD_CONFIGS = {
    receipt: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/pdf",
        ],
        storagePath: "/expenses",
    },
    avatar: {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
        storagePath: "/avatars",
    },
    document: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ],
        storagePath: "/documents",
    },
} as const;

/**
 * Validate file against upload configuration
 */
export function validateFile(
    file: File,
    config: UploadConfig
): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxSize) {
        const maxSizeMB = config.maxSize / (1024 * 1024);
        return {
            isValid: false,
            error: `File size must be less than ${maxSizeMB}MB`,
        };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type not allowed. Allowed types: ${config.allowedTypes.join(
                ", "
            )}`,
        };
    }

    return { isValid: true };
}

/**
 * Convert File to Buffer (for Node.js storage)
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Upload file using the storage service
 */
export async function uploadFile(
    file: File,
    config: UploadConfig,
    storageService: FileStorageService
): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
        // Validate file
        const validation = validateFile(file, config);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // Convert file to buffer
        const buffer = await fileToBuffer(file);

        // Prepare upload options
        const uploadOptions: FileUploadOptions = {
            file: buffer,
            path: config.storagePath,
            filename: file.name,
            mimeType: file.type,
        };

        // Upload file
        const result = await storageService.upload(uploadOptions);

        if (result.success) {
            return { success: true, path: result.path };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
        };
    }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Generate a preview URL for image files
 */
export function createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * Clean up preview URL to prevent memory leaks
 */
export function revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
