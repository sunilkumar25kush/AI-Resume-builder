import { useFormContext } from "react-hook-form";

import { AiAssistMenu } from "@/components/resumes/AiAssistMenu";
import { SectionListEditor } from "@/components/resumes/SectionListEditor";
import {
  EMPTY_EDUCATION,
  EMPTY_EXPERIENCE,
  EMPTY_PROJECT,
  splitSkills,
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
  const { register, getValues, setValue } = useFormContext<EditFormValues>();

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

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Summary</CardTitle>
          </div>
          <AiAssistMenu
            section="summary"
            getContent={() => getValues("summary")}
            onResult={(result) => setValue("summary", result as string)}
          />
        </CardHeader>
        <CardContent>
          <Textarea id="summary" rows={4} placeholder="Professional summary…" {...register("summary")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Skills</CardTitle>
            <CardDescription>One per line — or separated by commas</CardDescription>
          </div>
          <AiAssistMenu
            section="skills"
            getContent={() => splitSkills(getValues("skillsText"))}
            onResult={(result) => setValue("skillsText", (result as string[]).join("\n"))}
          />
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
            assistSection="education"
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
            assistSection="project"
            fieldDefs={[
              { key: "name", label: "Project name" },
              { key: "link", label: "GitHub link" },
              { key: "liveDemo", label: "Live demo link" },
              { key: "technologies", label: "Technologies", placeholder: "React, D3.js" },
              { key: "description", label: "Description", type: "textarea" },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Certifications</CardTitle>
          <CardDescription>One per line</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea id="certificationsText" rows={4} placeholder={"AWS Certified Solutions Architect\nGoogle Cloud Associate"} {...register("certificationsText")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Languages</CardTitle>
          <CardDescription>One per line — include proficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea id="languagesText" rows={3} placeholder={"English (Fluent)\nHindi (Native)"} {...register("languagesText")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Awards</CardTitle>
          <CardDescription>One per line</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea id="awardsText" rows={3} placeholder={"Employee of the Year 2023\nHackathon Winner"} {...register("awardsText")} />
        </CardContent>
      </Card>
    </div>
  );
}
