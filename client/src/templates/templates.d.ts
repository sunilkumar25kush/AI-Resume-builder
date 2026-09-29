import React from "react";
import type { ParsedResumeData } from "../types";

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
  component: React.ComponentType<TemplateProps>;
  defaultTheme: TemplateTheme;
  reference?: string;
}

export declare const TEMPLATES: TemplateDefinition[];
export declare function getTemplateById(id?: string): TemplateDefinition;
export declare function normalizeResume(data: any): any;
