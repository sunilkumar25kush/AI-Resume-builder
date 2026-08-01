import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { jdsApi } from "@/api/jds";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { JobDescription } from "@/types";

const editSchema = z.object({
  title: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  skillsText: z.string().max(10000).default(""),
  qualificationsText: z.string().max(25000).default(""),
  responsibilitiesText: z.string().max(25000).default(""),
});

type EditFormValues = z.output<typeof editSchema>;

function toFormValues(jd: JobDescription): EditFormValues {
  return {
    title: jd.title,
    company: jd.company,
    skillsText: jd.skills.join("\n"),
    qualificationsText: jd.qualifications.join("\n"),
    responsibilitiesText: jd.responsibilities.join("\n"),
  };
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 100);
}

export default function JDEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [jd, setJd] = useState<JobDescription | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.input<typeof editSchema>, unknown, z.output<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: jd ? toFormValues(jd) : undefined,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    jdsApi
      .get(id)
      .then((data) => {
        if (!cancelled) setJd(data);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        if (!cancelled) navigate("/jds");
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!jd) return;
    setSaving(true);
    try {
      await jdsApi.update(jd._id, {
        title: values.title,
        company: values.company,
        skills: splitLines(values.skillsText),
        qualifications: splitLines(values.qualificationsText),
        responsibilities: splitLines(values.responsibilitiesText),
      });
      toast.success("Job description saved");
      navigate(`/jds/${jd._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setSaving(false);
    }
  });

  if (!jd) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Link to={`/jds/${jd._id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to preview
            </Link>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Edit parsed data</h1>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Save className="mr-2 h-4 w-4" aria-hidden />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Job title</Label>
              <Input id="title" placeholder="Senior Software Engineer" {...form.register("title")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Acme Corp" {...form.register("company")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>One per line</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="skillsText" rows={5} placeholder={"React\nTypeScript\nNode.js"} {...form.register("skillsText")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Qualifications</CardTitle>
            <CardDescription>One per line</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="qualificationsText" rows={6} placeholder={"5+ years of experience with React"} {...form.register("qualificationsText")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Responsibilities</CardTitle>
            <CardDescription>One per line</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="responsibilitiesText" rows={6} placeholder={"Build and maintain the company dashboard"} {...form.register("responsibilitiesText")} />
          </CardContent>
        </Card>

        <div className="flex justify-end pb-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <Save className="mr-2 h-4 w-4" aria-hidden />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
