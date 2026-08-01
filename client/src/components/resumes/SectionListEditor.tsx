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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext, useWatch, type Path } from "react-hook-form";

import { AiAssistMenu } from "@/components/resumes/AiAssistMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditFormValues } from "@/components/resumes/editorForm";
import type { AssistSection } from "@/api/ai";

interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
}

interface SectionListEditorProps<N extends "experience" | "education" | "projects"> {
  name: N;
  fieldDefs: FieldDef[];
  emptyEntry: EditFormValues[N][number];
  addLabel: string;
  /** When set, each entry row gets an AI-assist menu that rewrites its description. */
  assistSection?: "experience" | "education" | "project";
}

/** One sortable row: drag handle + fields + remove. */
function SortableRow({
  id,
  index,
  name,
  fieldDefs,
  assistSection,
  onRemove,
}: {
  id: string;
  index: number;
  name: "experience" | "education" | "projects";
  fieldDefs: FieldDef[];
  assistSection?: "experience" | "education" | "project";
  onRemove: () => void;
}) {
  const { control, register, setValue } = useFormContext<EditFormValues>();
  const rowPath = `${name}.${index}` as Path<EditFormValues>;
  const entry = useWatch<EditFormValues>({ control, name: rowPath });
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-3 rounded-xl border p-4 ${isDragging ? "z-10 opacity-60 shadow-lg" : ""}`}
    >
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
                {...register(`${name}.${index}.${def.key}` as Path<EditFormValues>)}
              />
            ) : (
              <Input
                id={`${name}-${index}-${def.key}`}
                placeholder={def.placeholder}
                {...register(`${name}.${index}.${def.key}` as Path<EditFormValues>)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-grab text-muted-foreground active:cursor-grabbing"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Drag to reorder ${name} entry ${index + 1}`}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
            Drag
          </Button>
          {assistSection ? (
            <AiAssistMenu
              section={assistSection as AssistSection}
              getContent={() => entry}
              onResult={(result) =>
                setValue(`${rowPath}.description` as Path<EditFormValues>, (result as { description?: string }).description ?? "")
              }
              compact
            />
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
          <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
          Remove
        </Button>
      </div>
    </div>
  );
}

/** Generic sortable repeatable-section editor (dnd-kit + RHF FieldArray). */
export function SectionListEditor<N extends "experience" | "education" | "projects">({
  name,
  fieldDefs,
  emptyEntry,
  addLabel,
  assistSection,
}: SectionListEditorProps<N>) {
  const { control } = useFormContext<EditFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = fields.findIndex((field) => field.id === active.id);
    const to = fields.findIndex((field) => field.id === over.id);
    if (from === -1 || to === -1) return;
    move(from, to);
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing added yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <SortableRow
                  key={field.id}
                  id={field.id}
                  index={index}
                  name={name}
                  fieldDefs={fieldDefs}
                  assistSection={assistSection}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <Button type="button" variant="outline" className="self-start" onClick={() => append(emptyEntry as never)}>
        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
        {addLabel}
      </Button>
    </div>
  );
}
