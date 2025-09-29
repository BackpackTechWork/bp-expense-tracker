import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Storage driver configuration
export const STORAGE_DISK = "local" as const;

// Supported storage drivers
export type StorageDriver = "local" | "s3" | "cloudflare-r2";

// File upload options
export interface FileUploadOptions {
    file: Buffer;
    path: string;
    filename: string;
    mimeType?: string;
}

// File upload result
export interface FileUploadResult {
    success: boolean;
    path?: string;
    url?: string;
    error?: string;
}

/**
 * Generate a unique filename to prevent conflicts
 */
function generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    const uuid = randomUUID();
    return `${name}-${uuid}${ext}`;
}

/**
 * Local storage driver - stores files in the project's public directory
 */
async function storeLocally(
    options: FileUploadOptions
): Promise<FileUploadResult> {
    try {
        const { file, path: filePath, filename } = options;

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(filename);

        // Create the full path relative to public directory
        const relativePath = `/uploads${filePath}/${uniqueFilename}`;
        const fullPath = path.join(
            process.cwd(),
            "public",
            "uploads",
            filePath
        );

        // Ensure directory exists
        await fs.mkdir(fullPath, { recursive: true });

        // Write file
        const filePathWithFilename = path.join(fullPath, uniqueFilename);
        await fs.writeFile(filePathWithFilename, file);

        return {
            success: true,
            path: relativePath,
            url: relativePath, // For local storage, path and URL are the same
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * S3 storage driver (placeholder for future implementation)
 */
async function storeInS3(
    options: FileUploadOptions
): Promise<FileUploadResult> {
    // TODO: Implement S3 storage
    throw new Error("S3 storage not implemented yet");
}

/**
 * Cloudflare R2 storage driver (placeholder for future implementation)
 */
async function storeInCloudflareR2(
    options: FileUploadOptions
): Promise<FileUploadResult> {
    // TODO: Implement Cloudflare R2 storage
    throw new Error("Cloudflare R2 storage not implemented yet");
}

/**
 * Main file storage service
 */
export class FileStorageService {
    private driver: StorageDriver;

    constructor(driver: StorageDriver = STORAGE_DISK) {
        this.driver = driver;
    }

    /**
     * Upload a file using the configured storage driver
     */
    async upload(options: FileUploadOptions): Promise<FileUploadResult> {
        switch (this.driver) {
            case "local":
                return storeLocally(options);
            case "s3":
                return storeInS3(options);
            case "cloudflare-r2":
                return storeInCloudflareR2(options);
            default:
                throw new Error(`Unsupported storage driver: ${this.driver}`);
        }
    }

    /**
     * Delete a file from storage
     */
    async delete(
        filePath: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            switch (this.driver) {
                case "local":
                    const fullPath = path.join(
                        process.cwd(),
                        "public",
                        filePath
                    );
                    await fs.unlink(fullPath);
                    return { success: true };
                case "s3":
                    // TODO: Implement S3 delete
                    throw new Error("S3 delete not implemented yet");
                case "cloudflare-r2":
                    // TODO: Implement Cloudflare R2 delete
                    throw new Error("Cloudflare R2 delete not implemented yet");
                default:
                    throw new Error(
                        `Unsupported storage driver: ${this.driver}`
                    );
            }
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            };
        }
    }

    /**
     * Get the public URL for a file
     */
    getPublicUrl(filePath: string): string {
        switch (this.driver) {
            case "local":
                return filePath; // For local storage, return the relative path
            case "s3":
                // TODO: Implement S3 URL generation
                throw new Error("S3 URL generation not implemented yet");
            case "cloudflare-r2":
                // TODO: Implement Cloudflare R2 URL generation
                throw new Error(
                    "Cloudflare R2 URL generation not implemented yet"
                );
            default:
                throw new Error(`Unsupported storage driver: ${this.driver}`);
        }
    }
}

// Export a default instance
export const fileStorage = new FileStorageService(STORAGE_DISK);
