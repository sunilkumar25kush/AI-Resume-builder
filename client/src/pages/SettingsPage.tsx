import { Link } from "react-router";
import { KeyRound, LogOut, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/stores/auth";
import { usePrefsStore } from "@/stores/prefs";
import { useThemeStore } from "@/stores/theme";
import { AvatarSettingsDialog, AvatarView, useAvatarStore } from "@/components/avatar";

const PREF_ROWS: { key: "resumeTips" | "optimizationAlerts" | "productUpdates"; label: string; hint: string }[] = [
  { key: "resumeTips", label: "Resume tips", hint: "Occasional writing and formatting suggestions" },
  { key: "optimizationAlerts", label: "Optimization alerts", hint: "When an ATS optimization completes" },
  { key: "productUpdates", label: "Product updates", hint: "New features and announcements" },
];

export default function SettingsPage() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { toggle, ...prefs } = usePrefsStore();
  const logout = useAuthStore((state) => state.logout);
  const assistantEnabled = useAvatarStore((state) => state.enabled);
  const setAssistantEnabled = useAvatarStore((state) => state.setEnabled);
  const companionCharacter = useAvatarStore((state) => state.getCharacter());

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Appearance, preferences and account</p>
      </div>

      <Card data-mascot-section="settings-appearance">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how the app looks on this device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={theme === "light" ? "default" : "outline"}
              className="h-24 flex-col gap-2"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
            >
              <Sun className="h-5 w-5" aria-hidden />
              Light
            </Button>
            <Button
              type="button"
              variant={theme === "dark" ? "default" : "outline"}
              className="h-24 flex-col gap-2"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
            >
              <Moon className="h-5 w-5" aria-hidden />
              Dark
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card data-mascot-section="settings-companion">
        <CardHeader>
          <CardTitle className="text-base">AI Assistant Companion</CardTitle>
          <CardDescription>Customize your procedural vector avatar assistant</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <Label htmlFor="assistant-toggle" className="font-medium">
                Enable Interactive Assistant
              </Label>
              <span className="text-sm text-muted-foreground">
                Provides real-time feedback, ATS validation warnings, and onboarding guidance
              </span>
            </div>
            <Switch
              id="assistant-toggle"
              checked={assistantEnabled}
              onCheckedChange={setAssistantEnabled}
              aria-label="Enable Interactive Assistant"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 overflow-hidden">
                <AvatarView
                  definition={companionCharacter.definition}
                  animation="idle"
                  size={44}
                  autoplay={false}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{companionCharacter.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {companionCharacter.definition.body.primary.type} companion
                </span>
              </div>
            </div>
            <AvatarSettingsDialog
              trigger={
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose what you want to hear about</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {PREF_ROWS.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <Label htmlFor={`pref-${row.key}`} className="font-medium">
                  {row.label}
                </Label>
                <span className="text-sm text-muted-foreground">{row.hint}</span>
              </div>
              <Switch
                id={`pref-${row.key}`}
                checked={prefs[row.key]}
                onCheckedChange={() => toggle(row.key)}
                aria-label={row.label}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild variant="outline" className="justify-start">
            <Link to="/forgot-password">
              <KeyRound className="mr-2 h-4 w-4" aria-hidden />
              Change password
            </Link>
          </Button>
          <Separator />
          <Button
            type="button"
            variant="destructive"
            className="justify-start"
            onClick={() => void logout()}
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
