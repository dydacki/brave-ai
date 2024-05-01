export interface RenderFormPayload {
  template: string;
  data: Record<string, string>;
}

export interface RenderFormResponse {
  href: string;
}
