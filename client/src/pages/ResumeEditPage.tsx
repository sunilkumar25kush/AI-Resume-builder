import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/client";
import { resumesApi } from "@/api/resumes";
import { SectionListEditor } from "@/components/resumes/SectionListEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Resume } from "@/types";

const entrySchema = z.object({
  title: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  location: z.string().max(200).default(""),
  startDate: z.string().max(100).default(""),
  endDate: z.string().max(100).default(""),
  description: z.string().max(5000).default(""),
});

const eduSchema = z.object({
  degree: z.string().max(200).default(""),
  institution: z.string().max(200).default(""),
  startDate: z.string().max(100).default(""),
  endDate: z.string().max(100).default(""),
  description: z.string().max(3000).default(""),
});

const projectSchema = z.object({
  name: z.string().max(200).default(""),
  description: z.string().max(3000).default(""),
  link: z.string().max(500).default(""),
});

const editSchema = z.object({
  summary: z.string().max(10000).default(""),
  contact: z.object({
    email: z.string().max(254).default(""),
    phone: z.string().max(40).default(""),
    location: z.string().max(200).default(""),
    linkedin: z.string().max(500).default(""),
    github: z.string().max(500).default(""),
  }),
  skillsText: z.string().max(3000).default(""),
  experience: z.array(entrySchema).max(100).default([]),
  education: z.array(eduSchema).max(100).default([]),
  projects: z.array(projectSchema).max(100).default([]),
});

type EditFormValues = z.infer<typeof editSchema>;

const EMPTY_EXPERIENCE: Record<string, string> = { title: "", company: "", location: "", startDate: "", endDate: "", description: "" };
const EMPTY_EDUCATION: Record<string, string> = { degree: "", institution: "", startDate: "", endDate: "", description: "" };
const EMPTY_PROJECT: Record<string, string> = { name: "", description: "", link: "" };

function toFormValues(resume: Resume): EditFormValues {
  return {
    summary: resume.parsedData.summary,
    contact: resume.parsedData.contact,
    skillsText: resume.parsedData.skills.join("\n"),
    experience: resume.parsedData.experience,
    education: resume.parsedData.education,
    projects: resume.parsedData.projects,
  };
}

export default function ResumeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<z.input<typeof editSchema>, unknown, z.output<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    values: resume ? toFormValues(resume) : undefined,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    resumesApi
      .get(id)
      .then((data) => {
        if (!cancelled) setResume(data);
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error));
        if (!cancelled) navigate("/resumes");
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!resume) return;
    setSaving(true);
    try {
      const skills = values.skillsText
        .split(/\n|,/)
        .map((skill) => skill.trim())
        .filter(Boolean);
      const updated = await resumesApi.update(resume._id, {
        summary: values.summary,
        contact: values.contact,
        skills,
        experience: values.experience,
        education: values.education,
        projects: values.projects,
      });
      toast.success("Resume saved");
      navigate(`/resumes/${updated._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setSaving(false);
    }
  });

  if (!resume) {
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
            <Link to={`/resumes/${resume._id}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
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
            <CardTitle className="text-base">Contact</CardTitle>
            <CardDescription>How recruiters reach you</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["contact.email", "Email"],
                ["contact.phone", "Phone"],
                ["contact.location", "Location"],
                ["contact.linkedin", "LinkedIn"],
                ["contact.github", "GitHub"],
              ] as const
            ).map(([name, label]) => (
              <div key={name} className="flex flex-col gap-2">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} {...form.register(name)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea id="summary" rows={4} placeholder="Professional summary…" {...form.register("summary")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>One per line — or separated by commas</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="skillsText" rows={5} placeholder={"JavaScript\nReact\nNode.js"} {...form.register("skillsText")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionListEditor
              name="experience"
              addLabel="Add experience"
              emptyEntry={EMPTY_EXPERIENCE}
              fieldDefs={[
                { key: "title", label: "Job title" },
                { key: "company", label: "Company" },
                { key: "location", label: "Location" },
                { key: "startDate", label: "Start date" },
                { key: "endDate", label: "End date" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Education</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionListEditor
              name="education"
              addLabel="Add education"
              emptyEntry={EMPTY_EDUCATION}
              fieldDefs={[
                { key: "degree", label: "Degree" },
                { key: "institution", label: "Institution" },
                { key: "startDate", label: "Start date" },
                { key: "endDate", label: "End date" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <SectionListEditor
              name="projects"
              addLabel="Add project"
              emptyEntry={EMPTY_PROJECT}
              fieldDefs={[
                { key: "name", label: "Project name" },
                { key: "link", label: "Link" },
                { key: "description", label: "Description", type: "textarea" },
              ]}
            />
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
