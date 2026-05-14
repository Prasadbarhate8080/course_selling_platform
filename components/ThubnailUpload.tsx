"use client";

import { useDropzone } from "react-dropzone";
import { ImagePlus } from "lucide-react";
import { useState, useCallback } from "react";

interface ThumbnailUploadProps {
  onFileSelect: (file: File) => void;
}

export default function ThumbnailUpload({ onFileSelect }: ThumbnailUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop,
  });

  return (
    <div className="w-full">
      {/* Dropzone Box */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition
        flex flex-col items-center justify-center
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-400 bg-gray-100"}`}
      >
        <input {...getInputProps()} />

        {preview ? (
          <img
            src={preview}
            alt="Thumbnail Preview"
            className="h-40 w-auto rounded-lg shadow-md object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImagePlus size={40} className="text-gray-500" />
            <p className="text-gray-700 font-medium">
              {isDragActive ? "Drop the image…" : "Upload course thumbnail"}
            </p>
            <p className="text-gray-500 text-sm">
              Drag & drop or click to select
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-sm text-gray-500 mt-2">
        Recommended size: 1280×720 (JPG / PNG)
      </p>
    </div>
  );
}
