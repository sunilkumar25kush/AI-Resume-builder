import { AlertCircle, MapPin, Mail, Phone, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioProfile } from "@/types/portfolio";

export interface ProfileEditorProps {
  profile: PortfolioProfile;
  onChange: (updated: PortfolioProfile) => void;
}

export function ProfileEditor({ profile, onChange }: ProfileEditorProps) {
  const handleChange = <K extends keyof PortfolioProfile>(field: K, value: PortfolioProfile[K]) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  const isMissing = (val?: string) => !val || !val.trim();

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

        {/* Avatar URL */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-avatarUrl" className="text-xs font-medium">
            Avatar / Photo URL
          </Label>
          <Input
            id="profile-avatarUrl"
            value={profile.avatarUrl || ""}
            onChange={(e) => handleChange("avatarUrl", e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="h-9 text-sm"
          />
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
