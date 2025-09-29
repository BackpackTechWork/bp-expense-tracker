"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X, File, Image, FileText } from "lucide-react";
import {
    formatFileSize,
    createPreviewUrl,
    revokePreviewUrl,
} from "@/lib/file-utils";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
    accept?: Record<string, string[]>;
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    className?: string;
    label?: string;
    description?: string;
}

export function FileUpload({
    onFileSelect,
    selectedFile,
    accept = {
        "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        "application/pdf": [".pdf"],
    },
    maxSize = 5 * 1024 * 1024, // 5MB
    maxFiles = 1,
    disabled = false,
    className,
    label = "Upload File",
    description = "Drag and drop a file here, or click to select",
}: FileUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: any[]) => {
            setError(null);

            // Handle rejected files
            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === "file-too-large") {
                    setError(
                        `File size must be less than ${formatFileSize(maxSize)}`
                    );
                } else if (rejection.errors[0]?.code === "file-invalid-type") {
                    setError("File type not supported");
                } else {
                    setError("File upload failed");
                }
                return;
            }

            // Handle accepted files
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                onFileSelect(file);

                // Create preview for images
                if (file.type.startsWith("image/")) {
                    const url = createPreviewUrl(file);
                    setPreviewUrl(url);
                }
            }
        },
        [onFileSelect, maxSize]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles,
        disabled,
    });

    const handleRemoveFile = () => {
        if (previewUrl) {
            revokePreviewUrl(previewUrl);
            setPreviewUrl(null);
        }
        onFileSelect(null);
        setError(null);
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith("image/")) {
            return <Image className="h-8 w-8 text-blue-500" />;
        } else if (file.type === "application/pdf") {
            return <FileText className="h-8 w-8 text-red-500" />;
        } else {
            return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragActive && "border-blue-500 bg-blue-50",
                    selectedFile && "border-green-500 bg-green-50",
                    error && "border-red-500 bg-red-50",
                    disabled && "opacity-50 cursor-not-allowed",
                    "hover:border-gray-400 hover:bg-gray-50"
                )}
            >
                <input {...getInputProps()} />

                {selectedFile ? (
                    <div className="space-y-3">
                        {previewUrl ? (
                            <div className="flex justify-center">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-h-32 max-w-32 object-cover rounded border"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                {getFileIcon(selectedFile)}
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(selectedFile.size)}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile();
                            }}
                            className="text-red-600 hover:text-red-700"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <Upload className="h-8 w-8 text-gray-400" />
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                                {description}
                            </p>
                            <p className="text-xs text-gray-500">
                                Max size: {formatFileSize(maxSize)}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={disabled}
                        >
                            Select File
                        </Button>
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
