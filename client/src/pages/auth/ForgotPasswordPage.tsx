import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { authApi } from "@/api/auth";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const result = await authApi.forgotPassword(values);
      setSent(true);
      toast.success("If an account exists, a reset link has been sent");
      if (result.devResetToken) {
        // Dev-only: no email provider configured yet — show the token for testing.
        toast.info(`Dev reset token: ${result.devResetToken.slice(0, 16)}…`, { duration: 8000 });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  if (sent) {
    return (
      <AuthFormCard title="Check your email" description="We've handled your request if the account exists.">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm text-muted-foreground">
            Open the reset link from your email to choose a new password.
          </p>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link to="/login">Back to login</Link>
          </Button>
        </div>
      </AuthFormCard>
    );
  }

  return (
    <AuthFormCard
      title="Forgot password?"
      description="Enter your email and we'll send you a reset link"
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
          {submitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthFormCard>
  );
}
