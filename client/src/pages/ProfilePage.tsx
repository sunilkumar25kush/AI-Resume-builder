import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
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
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "" },
  });

  const onSaveName = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await updateProfile(values);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  });

  const onAvatarChange = async (file: File | undefined) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      toast.error("Please choose a JPEG, PNG or WebP image");
      return;
    }
    setUploading(true);
    try {
      await uploadAvatar(file);
      toast.success("Avatar updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile picture</CardTitle>
          <CardDescription>JPEG, PNG or WebP — up to 2 MB</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="object-cover" />
            ) : (
              <AvatarFallback className="text-lg">{getInitials(user?.name ?? "?")}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              aria-label="Upload profile picture"
              onChange={(event) => void onAvatarChange(event.target.files?.[0])}
            />
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              {uploading ? "Uploading…" : "Upload new picture"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={onSaveName} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>
            <Button type="submit" className="self-start" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Save className="mr-2 h-4 w-4" aria-hidden />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
          <Separator />
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ""} readOnly aria-describedby="email-hint" />
            <p id="email-hint" className="text-xs text-muted-foreground">
              Email cannot be changed yet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
