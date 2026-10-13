import { Award, ExternalLink, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PortfolioCertification } from "@/types/portfolio";

export interface CertificationsEditorProps {
  certifications?: PortfolioCertification[];
  onChange: (certs: PortfolioCertification[]) => void;
}

export function CertificationsEditor({ certifications = [], onChange }: CertificationsEditorProps) {
  const handleAdd = () => {
    onChange([
      ...certifications,
      {
        name: "",
        issuer: "",
        issueDate: "",
        url: "",
      },
    ]);
  };

  const handleUpdate = (index: number, patch: Partial<PortfolioCertification>) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(certifications.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Award className="h-4 w-4 text-neutral-500" />
            <span>Certifications & Licenses ({certifications.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Professional certifications, cloud accreditations, and verified credentials.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Credential</span>
        </Button>
      </div>

      {certifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-2">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            No certifications added yet
          </p>
          <p className="text-xs text-neutral-400">
            Add AWS, GCP, CKA, or other professional credentials to build trust.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAdd}
            className="mt-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Certification
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
                  Certification #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-7 w-7 text-neutral-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Certification Name *</Label>
                  <Input
                    value={cert.name || ""}
                    onChange={(e) => handleUpdate(index, { name: e.target.value })}
                    placeholder="e.g. AWS Solutions Architect Professional"
                    className="h-8 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Issuing Organization *</Label>
                  <Input
                    value={cert.issuer || ""}
                    onChange={(e) => handleUpdate(index, { issuer: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Issue Date</Label>
                  <Input
                    value={cert.issueDate || ""}
                    onChange={(e) => handleUpdate(index, { issueDate: e.target.value })}
                    placeholder="e.g. March 2024"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> Verification URL
                  </Label>
                  <Input
                    value={cert.url || ""}
                    onChange={(e) => handleUpdate(index, { url: e.target.value })}
                    placeholder="https://credly.com/badges/..."
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
