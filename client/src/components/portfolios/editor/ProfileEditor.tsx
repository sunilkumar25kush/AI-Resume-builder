import { useRef } from "react";
import { AlertCircle, Camera, MapPin, Mail, Phone, Upload, User, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeAvatarUrl } from "@/components/portfolios/common/urlUtils";
import { resolveAvatarUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import type { PortfolioProfile } from "@/types/portfolio";

export interface ProfileEditorProps {
  profile: PortfolioProfile;
  onChange: (updated: PortfolioProfile) => void;
}

export function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = <K extends keyof PortfolioProfile>(field: K, value: PortfolioProfile[K]) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  const isMissing = (val?: string) => !val || !val.trim();

  const initials = (profile.fullName || "P")
    .split(" ")
    .map((n: string) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image file must be under 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        handleChange("avatarUrl", reader.result);
        toast.success("Photo loaded successfully!");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleUseAccountAvatar = () => {
    if (!user?.avatar) {
      toast.info("No profile picture found on your account");
      return;
    }
    handleChange("avatarUrl", resolveAvatarUrl(user.avatar));
    toast.success("Using your account profile photo");
  };

  const handleClearAvatar = () => {
    handleChange("avatarUrl", "");
    toast.info("Photo removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <User className="h-4 w-4 text-neutral-500" />
            <span>Personal & Contact Info</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Your name, headline, and primary biographical summary.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-fullName" className="text-xs font-medium">
              Full Name *
            </Label>
            {isMissing(profile.fullName) && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Missing
              </span>
            )}
          </div>
          <Input
            id="profile-fullName"
            value={profile.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="e.g. Alex Mercer"
            className="h-9 text-sm"
          />
        </div>

        {/* Headline */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-headline" className="text-xs font-medium">
              Professional Headline
            </Label>
            {isMissing(profile.headline) && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Empty
              </span>
            )}
          </div>
          <Input
            id="profile-headline"
            value={profile.headline || ""}
            onChange={(e) => handleChange("headline", e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer • Distributed Systems"
            className="h-9 text-sm"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-email" className="text-xs font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-neutral-400" /> Email
            </Label>
            {isMissing(profile.email) && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Empty
              </span>
            )}
          </div>
          <Input
            id="profile-email"
            type="email"
            value={profile.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="alex@example.com"
            className="h-9 text-sm"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-phone" className="text-xs font-medium flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-neutral-400" /> Phone
          </Label>
          <Input
            id="profile-phone"
            value={profile.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 019-2834"
            className="h-9 text-sm"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-location" className="text-xs font-medium flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-neutral-400" /> Location
          </Label>
          <Input
            id="profile-location"
            value={profile.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="San Francisco, CA"
            className="h-9 text-sm"
          />
        </div>

        {/* Avatar / Photo with live preview & upload options */}
        <div className="space-y-3 md:col-span-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-neutral-500" />
              <span>Portfolio Avatar & Photo</span>
            </Label>
            {profile.avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAvatar}
                className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1"
              >
                <X className="h-3 w-3" /> Remove Photo
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Live avatar preview */}
            <div className="relative group shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shadow-xs">
                {profile.avatarUrl ? (
                  <img
                    src={normalizeAvatarUrl(profile.avatarUrl)}
                    alt={profile.fullName || "Avatar preview"}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".avatar-error-fallback");
                      if (fallback) fallback.classList.remove("hidden");
                    }}
                  />
                ) : (
                  <span className="text-xl font-bold font-mono text-neutral-400">
                    {initials}
                  </span>
                )}
                <div className="avatar-error-fallback hidden absolute inset-0 bg-neutral-100 dark:bg-neutral-800 text-[10px] text-amber-600 dark:text-amber-400 p-1 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="h-4 w-4 mb-0.5" />
                  <span>Invalid URL</span>
                </div>
              </div>
            </div>

            {/* URL input and Action Buttons */}
            <div className="flex-1 w-full space-y-2">
              <Input
                id="profile-avatarUrl"
                value={profile.avatarUrl || ""}
                onChange={(e) => handleChange("avatarUrl", e.target.value)}
                placeholder="https://images.unsplash.com/... or Google Drive link"
                className="h-9 text-xs sm:text-sm font-mono flex-1"
              />

              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs gap-1.5"
                >
                  <Upload className="h-3 w-3" />
                  Upload Image
                </Button>

                {user?.avatar && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseAccountAvatar}
                    className="h-7 text-xs gap-1.5"
                  >
                    <User className="h-3 w-3" />
                    Use Account Photo
                  </Button>
                )}
                <span className="text-[11px] text-neutral-400">
                  Paste URL, use Google Drive link, or upload an image file
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="profile-bio" className="text-xs font-medium">
              About / Professional Bio
            </Label>
            {isMissing(profile.bio) && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Empty
              </span>
            )}
          </div>
          <Textarea
            id="profile-bio"
            value={profile.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Write a concise overview of your background, core focus, and engineering philosophy..."
            rows={4}
            className="text-sm leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
