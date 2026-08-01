import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, type Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
}

interface SectionListEditorProps {
  name: "experience" | "education" | "projects";
  fieldDefs: FieldDef[];
  emptyEntry: Record<string, string>;
  addLabel: string;
}

/** Generic repeatable section editor driven by react-hook-form FieldArray. */
export function SectionListEditor({ name, fieldDefs, emptyEntry, addLabel }: SectionListEditorProps) {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing added yet.</p>
      ) : (
        fields.map((field, index) => (
          <div key={field.id} className="flex flex-col gap-3 rounded-xl border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {fieldDefs.map((def) => (
                <div key={def.key} className={def.type === "textarea" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={`${name}-${index}-${def.key}`} className="mb-1.5 block text-xs font-medium">
                    {def.label}
                  </Label>
                  {def.type === "textarea" ? (
                    <Textarea
                      id={`${name}-${index}-${def.key}`}
                      rows={3}
                      placeholder={def.placeholder}
                      {...register(`${name}.${index}.${def.key}` as Path<Record<string, unknown>>)}
                    />
                  ) : (
                    <Input
                      id={`${name}-${index}-${def.key}`}
                      placeholder={def.placeholder}
                      {...register(`${name}.${index}.${def.key}` as Path<Record<string, unknown>>)}
                    />
                  )}
                </div>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" className="self-end text-destructive" onClick={() => remove(index)}>
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
              Remove
            </Button>
          </div>
        ))
      )}
      <Button type="button" variant="outline" className="self-start" onClick={() => append(emptyEntry)}>
        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
        {addLabel}
      </Button>
    </div>
  );
}
