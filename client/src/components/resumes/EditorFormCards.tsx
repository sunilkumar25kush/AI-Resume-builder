import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Award,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  FolderGit2,
  GraduationCap,
  Languages,
  Layers,
  Link as LinkIcon,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Trophy,
  Wrench,
  type LucideIcon,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth";
import type { AiChange } from "@/types";

interface ContactFieldConfig {
  id: string;
  label: string;
  placeholder: string;
  isLinkable?: boolean;
  destUrlKey?: "linkedinUrl" | "githubUrl" | "websiteUrl";
}

const ALL_CONTACT_FIELDS: Record<string, ContactFieldConfig> = {
  location: {
    id: "location",
    label: "Location",
    placeholder: "Delhi,India",
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "Sunil Kumar",
    isLinkable: true,
    destUrlKey: "linkedinUrl",
  },
  github: {
    id: "github",
    label: "GitHub",
    placeholder: "sunilkumar25kush",
    isLinkable: true,
    destUrlKey: "githubUrl",
  },
  website: {
    id: "website",
    label: "Portfolio / Website",
    placeholder: "My Portfolio",
    isLinkable: true,
    destUrlKey: "websiteUrl",
  },
  phone: {
    id: "phone",
    label: "Phone",
    placeholder: "+91 7827598401",
  },
  email: {
    id: "email",
    label: "Email",
    placeholder: "sunilkumar25@navgurukul.org",
  },
};

const DEFAULT_CONTACT_ORDER = ["location", "linkedin", "github", "website", "phone", "email"];

const DEFAULT_SECTION_ORDER = [
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "certifications",
  "languages",
  "awards",
  "customSections",
];

const SECTION_META: Record<string, { title: string; description?: string; icon: LucideIcon }> = {
  summary: { title: "Summary", description: "Professional summary headline and overview", icon: Sparkles },
  skills: { title: "Skills", description: "Technical skills and tool proficiencies", icon: Wrench },
  experience: { title: "Experience", description: "Work history and achievements", icon: Briefcase },
  education: { title: "Education", description: "Degrees, academic background, and dates", icon: GraduationCap },
  projects: { title: "Projects", description: "Key projects, portfolio items, and repositories", icon: FolderGit2 },
  certifications: { title: "Certifications", description: "Licenses and certified credentials", icon: Award },
  languages: { title: "Languages", description: "Language fluencies and proficiencies", icon: Languages },
  awards: { title: "Awards", description: "Honors, recognitions, and achievements", icon: Trophy },
  customSections: { title: "Custom Sections", description: "Additional custom resume sections", icon: Layers },
};

/** Individual sortable contact row with [🔗 Link] modal and [↕] drag handle matching user screenshot */
function SortableContactRow({
  id,
  label,
  placeholder,
  isLinkable,
  destUrlKey,
}: ContactFieldConfig) {
  const { register, watch, setValue } = useFormContext<EditFormValues>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const destUrl = destUrlKey ? watch(`contact.${destUrlKey}`) : "";
  const [tempUrl, setTempUrl] = useState(destUrl || "");

  const handleOpenDialog = () => {
    setTempUrl(destUrl || "");
    setLinkDialogOpen(true);
  };

  const handleSaveUrl = () => {
    if (destUrlKey) {
      setValue(`contact.${destUrlKey}`, tempUrl.trim(), { shouldDirty: true });
    }
    setLinkDialogOpen(false);
    toast.success(`${label} destination URL updated`);
  };

  const handleClearUrl = () => {
    if (destUrlKey) {
      setValue(`contact.${destUrlKey}`, "", { shouldDirty: true });
    }
    setTempUrl("");
    setLinkDialogOpen(false);
    toast.info(`${label} destination URL cleared`);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn("flex flex-col gap-1.5", isDragging && "z-20 opacity-60")}
    >
      <Label htmlFor={`contact-${id}`} className="text-sm font-semibold text-neutral-800">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            id={`contact-${id}`}
            placeholder={placeholder}
            className="h-10 bg-neutral-100/70 border-neutral-200 text-neutral-900 pr-2 focus-visible:bg-white"
            {...register(`contact.${id as keyof EditFormValues["contact"]}` as const)}
          />
        </div>

        {isLinkable ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenDialog}
            className={cn(
              "h-10 px-3 shrink-0 rounded-lg border border-purple-300 font-medium text-xs gap-1.5 transition-colors",
              destUrl
                ? "bg-purple-100/80 text-purple-900 border-purple-400 hover:bg-purple-200"
                : "bg-purple-50/60 text-purple-700 hover:bg-purple-100/80 hover:text-purple-900"
            )}
            title={destUrl ? `Linked to: ${destUrl}` : `Attach destination URL for ${label}`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Link</span>
            {destUrl ? <Check className="h-3 w-3 text-purple-700 stroke-[2.5]" /> : null}
          </Button>
        ) : null}

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="h-10 w-9 shrink-0 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-grab active:cursor-grabbing rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label={`Drag to reorder ${label}`}
          title="Drag to reorder contact item"
        >
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {isLinkable && destUrlKey ? (
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <LinkIcon className="h-4 w-4 text-purple-600" />
                Attach {label} Destination URL
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Only the clean display name/handle will appear on the resume text, but clicking it will open this underlying destination link.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-2">
              <Label htmlFor={`dest-url-${id}`} className="text-xs font-medium">
                Destination URL (Hyperlink)
              </Label>
              <Input
                id={`dest-url-${id}`}
                placeholder={
                  id === "linkedin"
                    ? "https://linkedin.com/in/username"
                    : id === "github"
                    ? "https://github.com/username"
                    : "https://yourwebsite.com"
                }
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                className="text-sm"
              />
            </div>
            <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
              {destUrl ? (
                <Button type="button" variant="ghost" size="sm" onClick={handleClearUrl} className="text-destructive text-xs">
                  Remove Link
                </Button>
              ) : <div />}
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" onClick={handleSaveUrl} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Save Link
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

interface SortableSectionCardProps {
  sectionKey: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  highlighted?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  children: React.ReactNode;
}

/** Section card with drag-to-reorder handle, up/down buttons, and visibility toggle */
function SortableSectionCard({
  sectionKey,
  title,
  description,
  icon: Icon,
  highlighted,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}: SortableSectionCardProps) {
  const { getValues, setValue } = useFormContext<EditFormValues>();
  const hidden = (getValues("hiddenSections") || []).includes(sectionKey);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sectionKey });

  const toggle = () => {
    const current = getValues("hiddenSections") || [];
    setValue(
      "hiddenSections",
      hidden ? current.filter((key) => key !== sectionKey) : [...current, sectionKey],
      { shouldDirty: true },
    );
  };

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "transition-shadow",
        hidden && "opacity-60",
        highlighted && "border-emerald-400 ring-1 ring-emerald-300",
        isDragging && "z-20 opacity-70 shadow-xl border-primary"
      )}
    >
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 cursor-grab active:cursor-grabbing shrink-0"
            aria-label={`Drag to reorder ${title} section`}
            title="Drag to reorder section"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 flex-col gap-0.5">
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
            {description ? <CardDescription className="text-xs">{description}</CardDescription> : null}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-neutral-900"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            title="Move section up"
            aria-label={`Move ${title} section up`}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-500 hover:text-neutral-900"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            title="Move section down"
            aria-label={`Move ${title} section down`}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={toggle}
            aria-label={hidden ? `Show ${title} section` : `Hide ${title} section`}
            aria-pressed={hidden}
            title={hidden ? "Show on resume" : "Hide from resume"}
          >
            {hidden ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** All editable resume sections with drag-to-reorder contact items and entire sections */
export function EditorFormCards({ aiChanges = [] }: { aiChanges?: AiChange[] }) {
  const { register, getValues, setValue, control } = useFormContext<EditFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "customSections" });
  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control, name: "contact.customLinks" });

  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);

  const user = useAuthStore((s) => s.user);

  // Watch dynamic order arrays
  const rawContactOrder = useWatch({ control, name: "contact.contactOrder" });
  const contactOrder =
    Array.isArray(rawContactOrder) && rawContactOrder.length > 0
      ? rawContactOrder
      : DEFAULT_CONTACT_ORDER;

  const rawSectionOrder = useWatch({ control, name: "sectionOrder" });
  const sectionOrder =
    Array.isArray(rawSectionOrder) && rawSectionOrder.length > 0
      ? rawSectionOrder
      : DEFAULT_SECTION_ORDER;

  // DND sensors with minimum drag distance
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleContactDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = contactOrder.indexOf(String(active.id));
    const newIndex = contactOrder.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(contactOrder, oldIndex, newIndex);
      setValue("contact.contactOrder", reordered, { shouldDirty: true });
    }
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(String(active.id));
    const newIndex = sectionOrder.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(sectionOrder, oldIndex, newIndex);
      setValue("sectionOrder", reordered, { shouldDirty: true });
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;
    const reordered = arrayMove(sectionOrder, index, targetIndex);
    setValue("sectionOrder", reordered, { shouldDirty: true });
  };

  const resetSectionOrder = () => {
    setValue("sectionOrder", DEFAULT_SECTION_ORDER, { shouldDirty: true });
    toast.success("Section order reset to default");
  };

  const handleAutoFillProfile = () => {
    if (!user) {
      toast.error("No profile data available");
      return;
    }
    if (user.name) setValue("name", user.name, { shouldDirty: true });
    if (user.targetJobTitle) setValue("title", user.targetJobTitle, { shouldDirty: true });
    if (user.email) setValue("contact.email", user.email, { shouldDirty: true });
    if (user.phone) setValue("contact.phone", user.phone, { shouldDirty: true });
    if (user.location) setValue("contact.location", user.location, { shouldDirty: true });
    if (user.linkedin) setValue("contact.linkedin", user.linkedin, { shouldDirty: true });
    if (user.github) setValue("contact.github", user.github, { shouldDirty: true });
    if (user.website) setValue("contact.website", user.website, { shouldDirty: true });
    if (user.linkedinUrl) setValue("contact.linkedinUrl", user.linkedinUrl, { shouldDirty: true });
    if (user.githubUrl) setValue("contact.githubUrl", user.githubUrl, { shouldDirty: true });
    if (user.websiteUrl) setValue("contact.websiteUrl", user.websiteUrl, { shouldDirty: true });
    if (Array.isArray(user.contactOrder) && user.contactOrder.length > 0) {
      setValue("contact.contactOrder", user.contactOrder, { shouldDirty: true });
    }
    if (Array.isArray(user.customLinks) && user.customLinks.length > 0) {
      setValue("contact.customLinks", user.customLinks, { shouldDirty: true });
    }
    toast.success("Profile details auto-filled into resume");
  };

  // AI suggestions detection
  const summaryChanges = aiChangesForSection(aiChanges, "summary");
  const summaryHighlighted = summaryChanges.length > 0 && textChangesApplied(summaryChanges, [getValues("summary")]);
  const skillsChanges = aiChangesForSection(aiChanges, "skills");
  const skillsHighlighted = skillsChanges.length > 0 && skillChangesApplied(skillsChanges, getValues("skillsText"));
  const pendingSkills = pendingSkillChanges(skillsChanges, getValues("skillsText"));
  const experienceChanges = aiChangesForSection(aiChanges, "experience");
  const experienceHighlighted =
    experienceChanges.length > 0 &&
    textChangesApplied(experienceChanges, (getValues("experience") || []).map((entry) => entry.description));
  const projectsChanges = aiChangesForSection(aiChanges, "projects");
  const projectsHighlighted =
    projectsChanges.length > 0 &&
    textChangesApplied(
      projectsChanges,
      (getValues("projects") || []).flatMap((project) => [project.description, project.technologies]),
    );

  const applyPendingSkill = (change: AiChange) => {
    const current = splitSkills(getValues("skillsText"));
    setValue("skillsText", [...current, change.value].join("\n"), { shouldDirty: true });
  };

  // Render individual section card by key
  const renderSectionCard = (key: string, index: number) => {
    const meta = SECTION_META[key] || { title: key, description: "", icon: Layers };
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;

    switch (key) {
      case "summary":
        return (
          <SortableSectionCard
            key="summary"
            sectionKey="summary"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            highlighted={summaryHighlighted}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
            <div className="flex items-start justify-end gap-2 mb-2">
              <AiAssistMenu section="summary" getContent={() => getValues("summary")} onResult={(result) => setValue("summary", result as string)} />
            </div>
            <Textarea id="summary" rows={4} placeholder="Professional summary…" {...register("summary")} />
          </SortableSectionCard>
        );

      case "skills":
        return (
          <SortableSectionCard
            key="skills"
            sectionKey="skills"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            highlighted={skillsHighlighted}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
            <div className="flex items-start justify-end gap-2 mb-2">
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
          </SortableSectionCard>
        );

      case "experience":
        return (
          <SortableSectionCard
            key="experience"
            sectionKey="experience"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            highlighted={experienceHighlighted}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
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
          </SortableSectionCard>
        );

      case "education":
        return (
          <SortableSectionCard
            key="education"
            sectionKey="education"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
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
          </SortableSectionCard>
        );

      case "projects":
        return (
          <SortableSectionCard
            key="projects"
            sectionKey="projects"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            highlighted={projectsHighlighted}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
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
          </SortableSectionCard>
        );

      case "certifications":
        return (
          <SortableSectionCard
            key="certifications"
            sectionKey="certifications"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
            <Textarea id="certificationsText" rows={4} placeholder={"AWS Certified Solutions Architect\nGoogle Cloud Associate"} {...register("certificationsText")} />
          </SortableSectionCard>
        );

      case "languages":
        return (
          <SortableSectionCard
            key="languages"
            sectionKey="languages"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
            <Textarea id="languagesText" rows={3} placeholder={"English (Fluent)\nHindi (Native)"} {...register("languagesText")} />
          </SortableSectionCard>
        );

      case "awards":
        return (
          <SortableSectionCard
            key="awards"
            sectionKey="awards"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
            <Textarea id="awardsText" rows={3} placeholder={"Employee of the Year 2023\nHackathon Winner"} {...register("awardsText")} />
          </SortableSectionCard>
        );

      case "customSections":
        return (
          <SortableSectionCard
            key="customSections"
            sectionKey="customSections"
            title={meta.title}
            description={meta.description}
            icon={meta.icon}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={() => moveSection(index, "up")}
            onMoveDown={() => moveSection(index, "down")}
          >
            <div className="flex flex-col gap-4">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">No custom sections yet.</p>
              ) : (
                fields.map((field, itemIdx) => (
                  <div key={field.id} className="flex flex-col gap-3 rounded-xl border p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`customSections-${itemIdx}-title`} className="text-xs font-medium">
                          Section title
                        </Label>
                        <Input id={`customSections-${itemIdx}-title`} placeholder="Publications" {...register(`customSections.${itemIdx}.title`)} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`customSections-${itemIdx}-content`} className="text-xs font-medium">
                          Content
                        </Label>
                        <Textarea id={`customSections-${itemIdx}-content`} rows={3} placeholder="One per line — or a short paragraph…" {...register(`customSections.${itemIdx}.content`)} />
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="self-end text-destructive" onClick={() => remove(itemIdx)}>
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
            </div>
          </SortableSectionCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Personal Info & Contact Fields */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div>
            <CardTitle className="text-base">Personal Info &amp; Contact</CardTitle>
            <CardDescription>
              Drag contact handles <span className="font-semibold text-neutral-800">↕</span> to reorder items. Click <span className="font-semibold text-purple-700">Link</span> to attach destination URLs.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFillProfile}
            className="gap-1.5 text-xs font-medium border-primary/30 hover:bg-primary/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Auto-fill from profile
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Sunil Kumar" {...register("name")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Job Title / Target Role</Label>
              <Input id="title" placeholder="e.g. Web Developer" {...register("title")} />
            </div>
          </div>

          {/* Drag-to-reorder Contact Items */}
          <div className="flex flex-col gap-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Contact &amp; Social Links</Label>
                <p className="text-xs text-muted-foreground">
                  Arrange contact fields in your preferred order. On your resume, only the clean name/handle is visible while linking directly to your URL.
                </p>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleContactDragEnd}
            >
              <SortableContext items={contactOrder} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-3">
                  {contactOrder.map((fieldId) => {
                    const cfg = ALL_CONTACT_FIELDS[fieldId];
                    if (!cfg) return null;
                    return <SortableContactRow key={fieldId} {...cfg} />;
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Custom Platform Links */}
          <div className="flex flex-col gap-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">Other Platform Links</Label>
                <p className="text-xs text-muted-foreground">
                  Add custom platforms like Twitter/X, LeetCode, Behance, Medium, etc.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLink({ label: "", url: "" })}
                className="gap-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add Link
              </Button>
            </div>

            {linkFields.length > 0 ? (
              <div className="flex flex-col gap-2">
                {linkFields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Platform (e.g. LeetCode)"
                      className="w-1/3 text-xs"
                      {...register(`contact.customLinks.${idx}.label` as const)}
                    />
                    <Input
                      placeholder="URL (https://...)"
                      className="flex-1 text-xs"
                      {...register(`contact.customLinks.${idx}.url` as const)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removeLink(idx)}
                      aria-label="Remove link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Section Reordering Banner & Manager */}
      <div className="flex items-center justify-between rounded-xl border bg-neutral-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Resume Section Layout</h3>
            <p className="text-xs text-muted-foreground">
              Drag section cards below or use the reorder tool to arrange entire sections however you prefer.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetSectionOrder}
            className="text-xs gap-1.5"
            title="Reset to standard section order"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setReorderDialogOpen(true)}
            className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Reorder Sections
          </Button>
        </div>
      </div>

      {/* Reorder All Sections Dialog */}
      <Dialog open={reorderDialogOpen} onOpenChange={setReorderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              Arrange Resume Sections
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Rearrange the order of entire sections. Changes are reflected in real time on your resume preview and PDF exports.
            </DialogDescription>
          </DialogHeader>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-1.5 py-2">
                {sectionOrder.map((key, idx) => {
                  const meta = SECTION_META[key] || { title: key, icon: Layers };
                  const Icon = meta.icon;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5 shadow-2xs hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                          {idx + 1}
                        </span>
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-neutral-900">{meta.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, "up")}
                          className="h-7 w-7 text-neutral-500"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={idx === sectionOrder.length - 1}
                          onClick={() => moveSection(idx, "down")}
                          className="h-7 w-7 text-neutral-500"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
            <Button type="button" variant="outline" size="sm" onClick={resetSectionOrder} className="text-xs gap-1">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Order
            </Button>
            <Button type="button" size="sm" onClick={() => setReorderDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drag-to-reorder Section Cards */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-6">
            {sectionOrder.map((sectionKey, index) => renderSectionCard(sectionKey, index))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
