import { Suspense, lazy, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CroppedImageResult } from "@/lib/cropImage";
import { resolveAvatarUrl } from "@/lib/utils";

const ImageCropModal = lazy(() =>
  import("@/components/ui/ImageCropModal").then((m) => ({ default: m.ImageCropModal })),
);
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth";

const customLinkSchema = z.object({
  label: z.string().trim().max(80),
  url: z.string().trim().max(500),
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email / Gmail address is required")
    .email("Please enter a valid email address"),
  phone: z.string().trim().max(40),
  location: z.string().trim().max(200),
  targetJobTitle: z.string().trim().max(120),
  linkedin: z.string().trim().max(500),
  github: z.string().trim().max(500),
  website: z.string().trim().max(500),
  linkedinUrl: z.string().trim().max(500),
  githubUrl: z.string().trim().max(500),
  websiteUrl: z.string().trim().max(500),
  customLinks: z.array(customLinkSchema),
  autoPopulateResume: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      location: user?.location ?? "",
      targetJobTitle: user?.targetJobTitle ?? "",
      linkedin: user?.linkedin ?? "",
      github: user?.github ?? "",
      website: user?.website ?? "",
      linkedinUrl: user?.linkedinUrl ?? "",
      githubUrl: user?.githubUrl ?? "",
      websiteUrl: user?.websiteUrl ?? "",
      customLinks: user?.customLinks ?? [],
      autoPopulateResume: user?.autoPopulateResume ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customLinks",
  });

  const watchedValues = watch();

  const onSaveProfile = handleSubmit(async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      await updateProfile(values);
      toast.success("Profile updated — new resumes will auto-fill with these details");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  });

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const onAvatarSelect = (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Please choose a JPEG, PNG or WebP image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB for cropping");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropSave = async (result: CroppedImageResult) => {
    setUploading(true);
    try {
      await uploadAvatar(result.file);
      toast.success("Profile picture updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      throw error;
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile &amp; Resume Defaults</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal details. Only Name and Gmail address are mandatory — all other fields are optional and will automatically pre-populate your resume.
        </p>
      </div>

      {cropModalOpen && selectedImageSrc ? (
        <Suspense fallback={null}>
          <ImageCropModal
            open={cropModalOpen}
            imageSrc={selectedImageSrc}
            title="Crop Profile Picture"
            description="Choose which part to show and zoom into. The circle preview shows exactly how it will appear on your profile."
            cropShape="round"
            aspect={1}
            onClose={() => {
              setCropModalOpen(false);
              setSelectedImageSrc(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            onCropSave={onCropSave}
          />
        </Suspense>
      ) : null}

      <form onSubmit={onSaveProfile} className="flex flex-col gap-6">
        {/* Profile Picture Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile picture</CardTitle>
            <CardDescription>JPEG, PNG or WebP — interactive circle crop &amp; zoom</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-5">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20 shadow-xs overflow-hidden rounded-full shrink-0">
              {user?.avatar ? (
                <img
                  src={resolveAvatarUrl(user.avatar, 80)}
                  alt={user.name}
                  width={80}
                  height={80}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="text-xl font-medium">
                  {getInitials(user?.name ?? "?")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                aria-label="Upload profile picture"
                onChange={(event) => {
                  onAvatarSelect(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
                {uploading ? "Uploading…" : user?.avatar ? "Change picture" : "Upload picture"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Circle cropped · Drag to choose position &amp; zoom level
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Live Resume Header Preview */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              <CardTitle className="text-sm font-semibold">
                Live Resume Header Preview
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Here is how your details will automatically appear on your resume header:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-background p-5 text-center shadow-xs">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-serif">
                {watchedValues.name || "Your Full Name"}
              </h2>
              {watchedValues.targetJobTitle ? (
                <p className="text-sm italic text-muted-foreground mt-0.5 font-serif">
                  {watchedValues.targetJobTitle}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/60 italic mt-0.5">
                  (Target job role will appear here)
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                {watchedValues.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {watchedValues.email}
                  </span>
                )}
                {watchedValues.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {watchedValues.phone}
                  </span>
                )}
                {watchedValues.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {watchedValues.location}
                  </span>
                )}
                {watchedValues.linkedin && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    LinkedIn: {watchedValues.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
                  </span>
                )}
                {watchedValues.github && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    GitHub: {watchedValues.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                  </span>
                )}
                {watchedValues.website && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Globe className="h-3 w-3" /> {watchedValues.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                )}
                {watchedValues.customLinks?.map((l, i) =>
                  l?.url ? (
                    <span key={i} className="inline-flex items-center gap-1 text-primary">
                      <ExternalLink className="h-3 w-3" /> {l.label || l.url}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal & Professional Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal &amp; Professional details</CardTitle>
            <CardDescription>
              Fields marked with an asterisk (<span className="text-destructive font-bold">*</span>) are mandatory. All others are optional.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Mandatory: Full Name */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Full name <span className="text-destructive font-bold">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Sunil Kumar"
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name ? (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                ) : null}
              </div>

              {/* Mandatory: Email / Gmail */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Gmail / Email address <span className="text-destructive font-bold">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. sunilkumar25@gmail.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
            </div>

            {/* Target Job Title (Derives Job Role) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="targetJobTitle" className="flex items-center gap-1.5 font-medium">
                  <Briefcase className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Target Job Title
                </Label>
                <span className="text-xs text-muted-foreground">Optional (derives resume job role)</span>
              </div>
              <Input
                id="targetJobTitle"
                placeholder="e.g. Web Developer, Full Stack Engineer, Data Scientist"
                {...register("targetJobTitle")}
              />
              <p className="text-xs text-muted-foreground">
                Your resume header will automatically display this as your job title / headline directly underneath your name.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Optional: Phone */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone">Phone number</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. +91 7827598401"
                  autoComplete="tel"
                  {...register("phone")}
                />
              </div>

              {/* Optional: Location */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="location">Location</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <Input
                  id="location"
                  placeholder="e.g. Delhi, India"
                  {...register("location")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Links & Platforms Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Links &amp; Online Platforms</CardTitle>
                <CardDescription>
                  Add URLs for GitHub, LinkedIn, portfolio, and other platforms to populate your resume contact row.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* LinkedIn */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="linkedin" className="text-xs font-semibold">
                  LinkedIn Display Name / Handle
                </Label>
                <Input
                  id="linkedin"
                  placeholder="e.g. Sunil Kumar"
                  {...register("linkedin")}
                />
                <Input
                  id="linkedinUrl"
                  placeholder="Destination URL: https://linkedin.com/in/sunilkumar"
                  className="text-xs text-muted-foreground focus:text-foreground"
                  {...register("linkedinUrl")}
                />
              </div>

              {/* GitHub */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="github" className="text-xs font-semibold">
                  GitHub Display Name / Username
                </Label>
                <Input
                  id="github"
                  placeholder="e.g. sunilkumar25kush"
                  {...register("github")}
                />
                <Input
                  id="githubUrl"
                  placeholder="Destination URL: https://github.com/sunilkumar25kush"
                  className="text-xs text-muted-foreground focus:text-foreground"
                  {...register("githubUrl")}
                />
              </div>
            </div>

            {/* Portfolio / Personal Website */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="website" className="text-xs font-semibold">
                Portfolio / Personal Website
              </Label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  id="website"
                  placeholder="Display name: e.g. My Portfolio"
                  {...register("website")}
                />
                <Input
                  id="websiteUrl"
                  placeholder="Destination URL: https://sunilkumar.dev"
                  {...register("websiteUrl")}
                />
              </div>
            </div>

            {/* Custom Links / Other Platforms */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">Other Platforms &amp; URLs</Label>
                  <p className="text-xs text-muted-foreground">
                    Add custom platforms like LeetCode, Twitter/X, Behance, Dribbble, Medium, etc.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ label: "", url: "" })}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Platform
                </Button>
              </div>

              {fields.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2.5"
                    >
                      <div className="w-1/3">
                        <Input
                          placeholder="Platform (e.g. LeetCode)"
                          className="bg-background text-xs"
                          {...register(`customLinks.${index}.label` as const)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="URL (e.g. https://leetcode.com/u/sunil)"
                          className="bg-background text-xs"
                          {...register(`customLinks.${index}.url` as const)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => remove(index)}
                        aria-label="Remove link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/75 italic">
                  No additional custom platforms added yet. Click &quot;Add Platform&quot; to include more links.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resume Auto-population Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resume Auto-population</CardTitle>
            <CardDescription>
              Control whether these profile details are automatically applied to resumes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="autoPopulateResume" className="text-sm font-semibold cursor-pointer">
                  Automatically populate into new resumes
                </Label>
                <p className="text-xs text-muted-foreground">
                  When enabled, all newly generated or blank resumes will automatically include your name, target job role, contact details, and platform links.
                </p>
              </div>
              <Switch
                id="autoPopulateResume"
                checked={watchedValues.autoPopulateResume}
                onCheckedChange={(checked: boolean) =>
                  setValue("autoPopulateResume", checked, { shouldDirty: true })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Profile updates sync instantly across your resume builder
          </div>
          <Button type="submit" size="lg" disabled={saving} className="font-semibold gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {saving ? "Saving…" : "Save profile changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
