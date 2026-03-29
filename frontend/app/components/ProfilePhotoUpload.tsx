import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

interface ProfilePhotoUploadProps {
    size?: "sm" | "md" | "lg";
    editable?: boolean;
}

export default function ProfilePhotoUpload({ size = "md", editable = true }: ProfilePhotoUploadProps) {
    const { user, login } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sizeClasses = {
        sm: "size-10 text-xl",
        md: "size-16 text-2xl",
        lg: "size-24 text-4xl"
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        setUploading(true);
        try {
            const response = await fetch("/api/auth/profile-photo", {
                method: "PUT",
                body: formData,
                credentials: "include"
            });

            if (response.ok) {
                const updatedUser = await response.json();
                login(updatedUser);
            } else {
                const data = await response.json();
                alert(data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Profile photo upload error:", error);
            alert("An error occurred during upload");
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        if (editable && !uploading) {
            fileInputRef.current?.click();
        }
    };

    const photoUrl = user?.profilePhoto 
        ? (user.profilePhoto.startsWith("http") ? user.profilePhoto : `/uploads/${user.profilePhoto}`)
        : null;

    return (
        <div className="relative group">
            <div 
                onClick={triggerFileInput}
                className={`${sizeClasses[size]} bg-background-muted rounded-2xl border border-border-muted shadow-sm overflow-hidden flex items-center justify-center relative ${editable ? 'cursor-pointer' : ''}`}
            >
                {uploading ? (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
                        <span className="animate-spin material-symbols-outlined text-primary">sync</span>
                    </div>
                ) : null}

                {photoUrl ? (
                    <img 
                        src={photoUrl} 
                        alt={user?.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors"></div>
                        <span className="material-symbols-outlined text-primary relative z-10">
                            {user?.role === 'authority' ? 'shield_person' : user?.role === 'admin' ? 'admin_panel_settings' : 'person'}
                        </span>
                    </>
                )}

                {editable && !uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <span className="material-symbols-outlined text-white text-xl">edit</span>
                    </div>
                )}
            </div>

            {editable && (
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            )}
        </div>
    );
}
