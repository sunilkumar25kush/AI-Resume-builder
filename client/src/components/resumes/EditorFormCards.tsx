import { useFormContext } from "react-hook-form";

import { SectionListEditor } from "@/components/resumes/SectionListEditor";
import {
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  EMPTY_PROJECT,
  type EditFormValues,
} from "@/components/resumes/editorForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_FIELDS: Array<[keyof EditFormValues["contact"], string]> = [
  ["email", "Email"],
  ["phone", "Phone"],
  ["location", "Location"],
  ["linkedin", "LinkedIn"],
  ["github", "GitHub"],
];

/** All editable resume sections — rendered inside a FormProvider. */
export function EditorFormCards() {
  const { register } = useFormContext<EditFormValues>();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
          <CardDescription>How recruiters reach you</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map(([name, label]) => (
            <div key={name} className="flex flex-col gap-2">
              <Label htmlFor={`contact-${name}`}>{label}</Label>
              <Input id={`contact-${name}`} {...register(`contact.${name}`)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea id="summary" rows={4} placeholder="Professional summary…" {...register("summary")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skills</CardTitle>
          <CardDescription>One per line — or separated by commas</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea id="skillsText" rows={5} placeholder={"JavaScript\nReact\nNode.js"} {...register("skillsText")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Experience</CardTitle>
          <CardDescription>Drag the handle to reorder</CardDescription>
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
          <CardDescription>Drag the handle to reorder</CardDescription>
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
          <CardDescription>Drag the handle to reorder</CardDescription>
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
    </div>
  );
}
