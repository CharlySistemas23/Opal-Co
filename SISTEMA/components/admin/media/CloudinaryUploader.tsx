"use client";

import { useState, useCallback } from "react";
import { Text } from "@/components/ui";

interface CloudinaryUploaderProps {
  folder?: string;
  onUploaded?: () => void;
}

export function CloudinaryUploader({ folder: initialFolder = "opal", onUploaded }: CloudinaryUploaderProps) {
  const [folder, setFolder] = useState(initialFolder);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Only images are supported");
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const signRes = await fetch("/api/admin/media/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
          credentials: "include",
        });
        const signData = await signRes.json();
        if (!signRes.ok) {
          setError(signData?.error === "UNAVAILABLE" ? "Cloudinary not configured" : "Failed to get signature");
          return;
        }
        const { timestamp, signature, apiKey, cloudName } = signData;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("api_key", apiKey);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        const cloudData = await uploadRes.json();
        if (cloudData.error) {
          setError(cloudData.error?.message ?? "Upload failed");
          return;
        }
        const { secure_url, public_id } = cloudData;

        const saveRes = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: public_id,
            url: secure_url,
            folder: folder || undefined,
          }),
          credentials: "include",
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok) {
          setError(saveData?.error === "UNAVAILABLE" ? "Database not configured" : "Failed to save");
          return;
        }
        onUploaded?.();
      } catch {
        setError("Network error");
      } finally {
        setUploading(false);
      }
    },
    [folder, onUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <Text variant="small" muted>
            Folder:
          </Text>
          <input
            type="text"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="px-3 py-2 border border-charcoal/20 rounded text-sm w-32"
            placeholder="opal"
          />
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
          id="media-upload-input"
        />
        <label htmlFor="media-upload-input" className="cursor-pointer">
          <span
            className={`inline-flex items-center justify-center px-8 py-4 font-sans text-sm uppercase tracking-[0.2em] border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/5 transition-all duration-fast ease-luxury ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? "Uploading…" : "Choose file"}
          </span>
        </label>
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? "border-charcoal/40 bg-charcoal/5" : "border-charcoal/20"
        }`}
      >
        <Text variant="small" muted>
          Drag & drop images here
        </Text>
      </div>
      {error && (
        <Text variant="body" className="text-red-600">
          {error}
        </Text>
      )}
    </div>
  );
}
