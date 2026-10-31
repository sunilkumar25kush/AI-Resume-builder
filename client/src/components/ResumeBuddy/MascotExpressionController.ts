import type { ExpressionKey } from "@bible-strong/avatar-core";

export type MicroExpression =
  | "neutral"
  | "lookLeft"
  | "lookRight"
  | "lookDown"
  | "lookUp"
  | "concerned"
  | "smile"
  | "surprised"
  | "wink"
  | "confused"
  | "proud";

export const MICRO_EXPRESSION_MAP: Record<MicroExpression, ExpressionKey> = {
  neutral: "expression-00",
  lookLeft: "expression-01",
  lookRight: "expression-02",
  lookDown: "expression-05",
  lookUp: "expression-03",
  concerned: "expression-10",
  smile: "expression-08",
  surprised: "expression-12",
  wink: "expression-21",
  confused: "expression-16",
  proud: "expression-23",
};

export class MascotExpressionController {
  private currentExpression: ExpressionKey = "expression-00";
  private overrideTimeout: ReturnType<typeof setTimeout> | null = null;
  private onExpressionChange?: (expr: ExpressionKey) => void;

  constructor(onExpressionChange?: (expr: ExpressionKey) => void) {
    this.onExpressionChange = onExpressionChange;
  }

  public setListener(onExpressionChange: (expr: ExpressionKey) => void) {
    this.onExpressionChange = onExpressionChange;
  }

  public getExpression(): ExpressionKey {
    return this.currentExpression;
  }

  public setExpression(expr: ExpressionKey | MicroExpression) {
    this.clearOverride();
    const resolvedKey = (MICRO_EXPRESSION_MAP[expr as MicroExpression] || expr) as ExpressionKey;
    this.currentExpression = resolvedKey;
    this.onExpressionChange?.(resolvedKey);
  }

  public pulseMicroExpression(
    expr: MicroExpression,
    durationMs = 1200,
    onComplete?: () => void,
  ) {
    this.clearOverride();
    const previous = this.currentExpression;
    const target = MICRO_EXPRESSION_MAP[expr] || "expression-00";

    this.currentExpression = target;
    this.onExpressionChange?.(target);

    this.overrideTimeout = setTimeout(() => {
      this.currentExpression = previous;
      this.onExpressionChange?.(previous);
      onComplete?.();
    }, durationMs);
  }

  public clearOverride() {
    if (this.overrideTimeout) {
      clearTimeout(this.overrideTimeout);
      this.overrideTimeout = null;
    }
  }
}

