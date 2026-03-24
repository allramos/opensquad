import { useState } from "react";
import { ChevronRight, ChevronLeft, Sparkles, X } from "lucide-react";
import { useI18nStore } from "@/store/useI18nStore";

interface WizardData {
  companyName: string;
  slogan: string;
  whatDoes: string;
  audience: string;
  tone: string;
  primaryColor: string;
  secondaryColor: string;
  logoNotes: string;
  contentRules: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  website: string;
  postingFrequency: string;
  extra: string;
}

const EMPTY: WizardData = {
  companyName: "",
  slogan: "",
  whatDoes: "",
  audience: "",
  tone: "",
  primaryColor: "#2563EB",
  secondaryColor: "#10B981",
  logoNotes: "",
  contentRules: "",
  instagram: "",
  linkedin: "",
  twitter: "",
  website: "",
  postingFrequency: "",
  extra: "",
};

interface Props {
  onComplete: (markdown: string) => void;
  onClose: () => void;
}

export function CompanyWizard({ onComplete, onClose }: Props) {
  const t = useI18nStore((s) => s.t);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({ ...EMPTY });

  const update = (field: keyof WizardData, value: string) =>
    setData((d) => ({ ...d, [field]: value }));

  const steps = [
    {
      titleKey: "wizard.step1Title",
      fields: [
        { key: "companyName" as const, labelKey: "wizard.companyName", type: "text", placeholder: "Acme Corp" },
        { key: "slogan" as const, labelKey: "wizard.slogan", type: "text", placeholder: t("wizard.sloganPlaceholder") },
        { key: "whatDoes" as const, labelKey: "wizard.whatDoes", type: "textarea", placeholder: t("wizard.whatDoesPlaceholder") },
      ],
    },
    {
      titleKey: "wizard.step2Title",
      fields: [
        { key: "audience" as const, labelKey: "wizard.audience", type: "text", placeholder: t("wizard.audiencePlaceholder") },
        { key: "tone" as const, labelKey: "wizard.tone", type: "text", placeholder: t("wizard.tonePlaceholder") },
        { key: "contentRules" as const, labelKey: "wizard.contentRules", type: "textarea", placeholder: t("wizard.contentRulesPlaceholder") },
      ],
    },
    {
      titleKey: "wizard.step3Title",
      fields: [
        { key: "primaryColor" as const, labelKey: "wizard.primaryColor", type: "color", placeholder: "" },
        { key: "secondaryColor" as const, labelKey: "wizard.secondaryColor", type: "color", placeholder: "" },
        { key: "logoNotes" as const, labelKey: "wizard.logoNotes", type: "text", placeholder: t("wizard.logoNotesPlaceholder") },
      ],
    },
    {
      titleKey: "wizard.step4Title",
      fields: [
        { key: "instagram" as const, labelKey: "Instagram", type: "text", placeholder: "@mycompany" },
        { key: "linkedin" as const, labelKey: "LinkedIn", type: "text", placeholder: "/company/mycompany" },
        { key: "twitter" as const, labelKey: "X / Twitter", type: "text", placeholder: "@mycompany" },
        { key: "website" as const, labelKey: "Website", type: "text", placeholder: "https://mycompany.com" },
        { key: "postingFrequency" as const, labelKey: "wizard.postingFrequency", type: "text", placeholder: t("wizard.postingFreqPlaceholder") },
      ],
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;
  const canProceed = data.companyName.trim().length > 0;

  const generateMarkdown = (): string => {
    const lines: string[] = [];
    lines.push(`# ${data.companyName || "My Company"}`);
    if (data.whatDoes) {
      lines.push("", data.whatDoes);
    }
    lines.push("", "## Brand");
    lines.push(`- **${t("wizard.companyName")}:** ${data.companyName}`);
    if (data.slogan) lines.push(`- **Slogan:** "${data.slogan}"`);
    if (data.tone) lines.push(`- **${t("wizard.tone")}:** ${data.tone}`);
    if (data.audience) lines.push(`- **${t("wizard.audience")}:** ${data.audience}`);

    lines.push("", "## Visual Identity");
    lines.push(`- **${t("wizard.primaryColor")}:** ${data.primaryColor}`);
    lines.push(`- **${t("wizard.secondaryColor")}:** ${data.secondaryColor}`);
    if (data.logoNotes) lines.push(`- **Logo:** ${data.logoNotes}`);

    if (data.contentRules) {
      lines.push("", "## Content Guidelines");
      for (const rule of data.contentRules.split("\n").filter((l) => l.trim())) {
        lines.push(`- ${rule.trim()}`);
      }
    }

    const socials: string[] = [];
    if (data.instagram) socials.push(`- **Instagram:** ${data.instagram}`);
    if (data.linkedin) socials.push(`- **LinkedIn:** ${data.linkedin}`);
    if (data.twitter) socials.push(`- **X / Twitter:** ${data.twitter}`);
    if (data.website) socials.push(`- **Website:** ${data.website}`);
    if (data.postingFrequency) socials.push(`- **${t("wizard.postingFrequency")}:** ${data.postingFrequency}`);
    if (socials.length > 0) {
      lines.push("", "## Social Media");
      lines.push(...socials);
    }

    if (data.extra) {
      lines.push("", "## Additional Notes");
      lines.push(data.extra);
    }

    return lines.join("\n");
  };

  const handleFinish = () => {
    onComplete(generateMarkdown());
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    background: "var(--bg-raised)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    transition: "var(--transition-fast)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{t("wizard.title")}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ padding: "12px 20px 0", display: "flex", gap: 4 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= step ? "var(--accent-primary)" : "var(--border-subtle)",
                transition: "var(--transition-normal)",
              }}
            />
          ))}
        </div>

        {/* Step title */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
            {t("wizard.stepOf", { current: String(step + 1), total: String(steps.length) })}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {t(currentStep.titleKey)}
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {currentStep.fields.map(({ key, labelKey, type, placeholder }) => (
            <div key={key}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: 6,
                }}
              >
                {labelKey.startsWith("wizard.") ? t(labelKey) : labelKey}
              </label>
              {type === "textarea" ? (
                <textarea
                  value={data[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                />
              ) : type === "color" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    value={data[key]}
                    onChange={(e) => update(key, e.target.value)}
                    style={{
                      width: 40,
                      height: 36,
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-sm)",
                      background: "transparent",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  />
                  <input
                    type="text"
                    value={data[key]}
                    onChange={(e) => update(key, e.target.value)}
                    style={{ ...inputStyle, flex: 1, fontFamily: "monospace", fontSize: 13 }}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={data[key]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px 16px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "8px 14px",
              background: "transparent",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              color: step === 0 ? "var(--text-muted)" : "var(--text-secondary)",
              cursor: step === 0 ? "default" : "pointer",
              fontSize: 13,
              fontWeight: 500,
              opacity: step === 0 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={14} />
            {t("wizard.back")}
          </button>

          {isLast ? (
            <button
              onClick={handleFinish}
              disabled={!canProceed}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 20px",
                background: canProceed ? "var(--accent-primary)" : "var(--bg-overlay)",
                color: canProceed ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                fontWeight: 600,
                cursor: canProceed ? "pointer" : "default",
              }}
            >
              <Sparkles size={14} />
              {t("wizard.generate")}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "8px 20px",
                background: "var(--accent-primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {t("wizard.next")}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
