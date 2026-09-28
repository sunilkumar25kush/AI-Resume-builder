import type { ComponentType } from "react";

export interface TemplateTheme {
  accentColor?: string;
  fontSize?: string;
}

export interface TemplateProps {
  data: any;
  theme?: TemplateTheme;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  component: ComponentType<TemplateProps>;
  defaultTheme: TemplateTheme;
  reference?: string;
}

export const TEMPLATES: TemplateDefinition[];
export function getTemplateById(id?: string): TemplateDefinition;
export function normalizeResume(data: any): any;
export function getEmptyResume(): any;
export const sampleResume: any;
