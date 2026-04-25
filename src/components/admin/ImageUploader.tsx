"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, GripVertical } from "lucide-react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  adminToken: string;
}

export default function ImageUploader({ images, onChange, adminToken }: Props) {
  const [uploading, setUploading] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (images.length + files.length > 10) {
        alert("Maximum 10 images allowed.");
        return;
      }

      setUploading(true);
      const urls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-token": adminToken },
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          urls.push(url);
        }
      }

      onChange([...images, ...urls]);
      setUploading(false);
    },
    [images, onChange, adminToken]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((f) =>
      ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(f.type)
    );
    uploadFiles(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const reorder = (from: number, to: number) => {
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDraggingOver(true);
        }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          draggingOver
            ? "border-[#0073bb] bg-[#e3f2fd]"
            : "border-[#e0e0e0] hover:border-[#0073bb] hover:bg-[#f5f5f5]"
        } ${images.length >= 10 ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Upload
          size={28}
          className={`mx-auto mb-2 ${draggingOver ? "text-[#0073bb]" : "text-[#757575]"}`}
        />
        {uploading ? (
          <p className="text-sm text-[#757575]">Uploading...</p>
        ) : (
          <>
            <p className="text-sm font-medium text-[#212121]">
              {draggingOver
                ? "Drop images here"
                : "Drag & drop images or click to browse"}
            </p>
            <p className="text-xs text-[#757575] mt-1">
              JPEG, PNG, WebP • Max 5MB each • {images.length}/10 uploaded
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((src, i) => (
            <div
              key={src + i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) {
                  reorder(dragIndex, i);
                  setDragIndex(i);
                }
              }}
              onDragEnd={() => setDragIndex(null)}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#e0e0e0] group cursor-move bg-gray-100"
            >
              <Image
                src={src}
                alt={`Image ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Primary badge */}
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-[#0073bb] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}

              {/* Drag handle */}
              <div className="absolute top-1 right-7 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <GripVertical size={14} />
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} className="text-white" />
              </button>

              <span className="absolute bottom-1 right-1 text-white text-[10px] bg-black/50 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
