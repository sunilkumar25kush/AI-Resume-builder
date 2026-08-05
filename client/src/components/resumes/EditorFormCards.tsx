import { useFieldArray, useFormContext } from "react-hook-form";
import { Eye, EyeOff, Plus, Sparkles, Trash2, type LucideIcon } from "lucide-react";

import { AiAssistMenu } from "@/components/resumes/AiAssistMenu";
import { SectionListEditor } from "@/components/resumes/SectionListEditor";
import {
  EMPTY_CUSTOM_SECTION,
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  EMPTY_PROJECT,
  aiChangesForSection,
  pendingSkillChanges,
  skillChangesApplied,
  splitSkills,
  textChangesApplied,
  type EditFormValues,
} from "@/components/resumes/editorForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { AiChange } from "@/types";

const CONTACT_FIELDS: Array<[keyof EditFormValues["contact"], string]> = [
  ["email", "Email"],
  ["phone", "Phone"],
  ["location", "Location"],
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
];

interface SectionCardProps {
  title: string;
  description?: string;
  sectionKey: string;
  icon?: LucideIcon;
  /** Green highlight: the AI added/recommended content in this section. */
  highlighted?: boolean;
  children: React.ReactNode;
}

/** Section card with a hide/show toggle (hidden sections skip preview + export). */
function SectionCard({ title, description, sectionKey, icon: Icon, highlighted, children }: SectionCardProps) {
  const { getValues, setValue } = useFormContext<EditFormValues>();
  const hidden = getValues("hiddenSections").includes(sectionKey);

  const toggle = () => {
    const current = getValues("hiddenSections");
    setValue(
      "hiddenSections",
      hidden ? current.filter((key) => key !== sectionKey) : [...current, sectionKey],
      { shouldDirty: true },
    );
  };

  return (
    <Card className={cn(hidden && "opacity-60", highlighted && "border-emerald-400 ring-1 ring-emerald-300")}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex min-w-0 flex-col gap-1">
          <CardTitle className="flex items-center gap-2 text-base">
            {Icon ? <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden /> : null}
            {title}
            {hidden ? <span className="text-xs font-normal text-muted-foreground">(hidden)</span> : null}
            {highlighted ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <Sparkles className="h-3 w-3" aria-hidden />
                AI added
              </span>
            ) : null}
          </CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={hidden ? `Show ${title} section` : `Hide ${title} section`}
          aria-pressed={hidden}
        >
          {hidden ? <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden /> : <Eye className="h-4 w-4 text-muted-foreground" aria-hidden />}
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** All editable resume sections — rendered inside a FormProvider. */
export function EditorFormCards({ aiChanges = [] }: { aiChanges?: AiChange[] }) {
  const { register, getValues, setValue, control } = useFormContext<EditFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "customSections" });

  // Green-highlight detection: a section lights up while the form still
  // contains the content the AI added; editing it away drops the highlight.
  const summaryChanges = aiChangesForSection(aiChanges, "summary");
  const summaryHighlighted = summaryChanges.length > 0 && textChangesApplied(summaryChanges, [getValues("summary")]);
  const skillsChanges = aiChangesForSection(aiChanges, "skills");
  const skillsHighlighted = skillsChanges.length > 0 && skillChangesApplied(skillsChanges, getValues("skillsText"));
  const pendingSkills = pendingSkillChanges(skillsChanges, getValues("skillsText"));
  const experienceChanges = aiChangesForSection(aiChanges, "experience");
  const experienceHighlighted =
    experienceChanges.length > 0 &&
    textChangesApplied(experienceChanges, getValues("experience").map((entry) => entry.description));
  const projectsChanges = aiChangesForSection(aiChanges, "projects");
  const projectsHighlighted =
    projectsChanges.length > 0 &&
    textChangesApplied(
      projectsChanges,
      getValues("projects").flatMap((project) => [project.description, project.technologies]),
    );

  const applyPendingSkill = (change: AiChange) => {
    const current = splitSkills(getValues("skillsText"));
    setValue("skillsText", [...current, change.value].join("\n"), { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal info</CardTitle>
          <CardDescription>Your full name and contact details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Rahul Sharma" {...register("name")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACT_FIELDS.map(([name, label]) => (
              <div key={name} className="flex flex-col gap-2">
                <Label htmlFor={`contact-${name}`}>{label}</Label>
                <Input id={`contact-${name}`} {...register(`contact.${name}`)} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <SectionCard title="Summary" sectionKey="summary" highlighted={summaryHighlighted}>
        <div className="flex items-start justify-end gap-2">
          <AiAssistMenu section="summary" getContent={() => getValues("summary")} onResult={(result) => setValue("summary", result as string)} />
        </div>
        <Textarea id="summary" rows={4} placeholder="Professional summary…" {...register("summary")} />
      </SectionCard>

      <SectionCard title="Skills" description="One per line — or separated by commas" sectionKey="skills" highlighted={skillsHighlighted}>
        <div className="flex items-start justify-end gap-2">
          <AiAssistMenu
            section="skills"
            getContent={() => splitSkills(getValues("skillsText"))}
            onResult={(result) => setValue("skillsText", (result as string[]).join("\n"))}
          />
        </div>
        {pendingSkills.length > 0 ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-emerald-700">AI suggests adding:</span>
            {pendingSkills.map((change) => (
              <button
                key={`${change.value}-${change.reason}`}
                type="button"
                onClick={() => applyPendingSkill(change)}
                className="flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                + {change.value}
              </button>
            ))}
          </div>
        ) : null}
        <Textarea id="skillsText" rows={5} placeholder={"JavaScript\nReact\nNode.js"} {...register("skillsText")} />
      </SectionCard>

      <SectionCard title="Experience" description="Drag the handle to reorder" sectionKey="experience" highlighted={experienceHighlighted}>
        <SectionListEditor
          name="experience"
          addLabel="Add experience"
          emptyEntry={EMPTY_EXPERIENCE}
          assistSection="experience"
          fieldDefs={[
            { key: "title", label: "Job title" },
            { key: "company", label: "Company" },
            { key: "location", label: "Location" },
            { key: "startDate", label: "Start date" },
            { key: "endDate", label: "End date" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "achievements", label: "Achievements", type: "textarea", placeholder: "Reduced load time by 40%" },
            { key: "technologies", label: "Technologies", placeholder: "React, Node.js, MongoDB" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Education" description="Drag the handle to reorder" sectionKey="education">
        <SectionListEditor
          name="education"
          addLabel="Add education"
          emptyEntry={EMPTY_EDUCATION}
          assistSection="education"
          fieldDefs={[
            { key: "degree", label: "Degree" },
            { key: "institution", label: "Institution" },
            { key: "startDate", label: "Start date" },
            { key: "endDate", label: "End date" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Projects" description="Drag the handle to reorder" sectionKey="projects" highlighted={projectsHighlighted}>
        <SectionListEditor
          name="projects"
          addLabel="Add project"
          emptyEntry={EMPTY_PROJECT}
          assistSection="project"
          fieldDefs={[
            { key: "name", label: "Project name" },
            { key: "link", label: "GitHub link" },
            { key: "liveDemo", label: "Live demo link" },
            { key: "technologies", label: "Technologies", placeholder: "React, D3.js" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </SectionCard>

      <SectionCard title="Certifications" description="One per line" sectionKey="certifications">
        <Textarea id="certificationsText" rows={4} placeholder={"AWS Certified Solutions Architect\nGoogle Cloud Associate"} {...register("certificationsText")} />
      </SectionCard>

      <SectionCard title="Languages" description="One per line — include proficiency" sectionKey="languages">
        <Textarea id="languagesText" rows={3} placeholder={"English (Fluent)\nHindi (Native)"} {...register("languagesText")} />
      </SectionCard>

      <SectionCard title="Awards" description="One per line" sectionKey="awards">
        <Textarea id="awardsText" rows={3} placeholder={"Employee of the Year 2023\nHackathon Winner"} {...register("awardsText")} />
      </SectionCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom sections</CardTitle>
          <CardDescription>Add your own sections (publications, volunteering, interests…)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom sections yet.</p>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-3 rounded-xl border p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`customSections-${index}-title`} className="text-xs font-medium">
                      Section title
                    </Label>
                    <Input id={`customSections-${index}-title`} placeholder="Publications" {...register(`customSections.${index}.title`)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`customSections-${index}-content`} className="text-xs font-medium">
                      Content
                    </Label>
                    <Textarea id={`customSections-${index}-content`} rows={3} placeholder="One per line — or a short paragraph…" {...register(`customSections.${index}.content`)} />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" className="self-end text-destructive" onClick={() => remove(index)}>
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
                  Remove
                </Button>
              </div>
            ))
          )}
          <Button type="button" variant="outline" className="self-start" onClick={() => append(EMPTY_CUSTOM_SECTION)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            Add custom section
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
