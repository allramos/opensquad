import { ExternalLink } from "lucide-react";

const URL_REGEX = /(https?:\/\/[^\s,)]+)/g;

interface LinkedTextProps {
  text: string;
}

export function LinkedText({ text }: LinkedTextProps) {
  const parts = text.split(URL_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        if (URL_REGEX.test(part)) {
          // Reset regex lastIndex since we reuse it
          URL_REGEX.lastIndex = 0;
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--accent-primary)",
                textDecoration: "none",
                borderBottom: "1px solid var(--accent-primary-dim)",
                cursor: "pointer",
                transition: "var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "var(--accent-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = "var(--accent-primary-dim)";
              }}
            >
              {formatUrl(part)}
              <ExternalLink size={10} style={{ marginLeft: 3, verticalAlign: "middle" }} />
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function formatUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}
