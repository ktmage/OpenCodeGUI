import type { IconProps } from "../icons";

// ─── File Type Icons ──────────────────────────────────────────────────
// 各言語・ファイルタイプを表す 16×16 SVG アイコン。
// 言語の公式カラーを SVG 内に固定色で埋め込む。

/** TypeScript (.ts) */
export function TypeScriptIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#3178c6" />
      <path d="M4 7h5v1.2H7.2V13H5.8V8.2H4V7z" fill="#fff" />
      <path
        d="M9.6 12.4c.3.2.7.3 1.1.4.4.1.8.1 1.1.1.3 0 .6 0 .8-.1.2-.1.4-.2.5-.4.1-.2.2-.4.2-.6 0-.2-.1-.4-.2-.5-.1-.2-.3-.3-.5-.4-.2-.1-.5-.2-.8-.3-.4-.1-.7-.3-1-.4-.3-.2-.5-.4-.7-.6-.2-.3-.3-.6-.3-1 0-.4.1-.7.3-1 .2-.3.5-.5.8-.7.4-.2.8-.2 1.3-.2.3 0 .7 0 1 .1.3.1.6.2.8.3l-.4 1c-.2-.1-.4-.2-.6-.3-.2-.1-.5-.1-.8-.1-.3 0-.5.1-.7.2-.2.1-.2.3-.2.5 0 .2.1.3.2.4.1.1.3.2.5.3.2.1.5.2.7.3.4.1.7.3 1 .5.3.2.5.4.6.7.2.3.2.6.2 1 0 .4-.1.8-.3 1-.2.3-.5.5-.9.7-.4.2-.8.2-1.4.2-.5 0-.9-.1-1.3-.2-.3-.1-.6-.3-.9-.5l.5-1z"
        fill="#fff"
      />
    </svg>
  );
}

/** TypeScript React (.tsx) */
export function TypeScriptReactIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#3178c6" />
      <circle cx="10.5" cy="10" r="1" fill="#61dafb" />
      <ellipse cx="10.5" cy="10" rx="3.5" ry="1.3" stroke="#61dafb" strokeWidth="0.6" fill="none" />
      <ellipse
        cx="10.5"
        cy="10"
        rx="3.5"
        ry="1.3"
        stroke="#61dafb"
        strokeWidth="0.6"
        fill="none"
        transform="rotate(60 10.5 10)"
      />
      <ellipse
        cx="10.5"
        cy="10"
        rx="3.5"
        ry="1.3"
        stroke="#61dafb"
        strokeWidth="0.6"
        fill="none"
        transform="rotate(120 10.5 10)"
      />
      <path d="M2 4h4.5v1H4.8V9H3.7V5H2V4z" fill="#fff" />
    </svg>
  );
}

/** JavaScript (.js) */
export function JavaScriptIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#f7df1e" />
      <path
        d="M5 5h1.3v4.7c0 .4-.1.7-.2.9-.2.3-.4.4-.7.5-.3.1-.6.2-1 .2-.5 0-.9-.1-1.2-.4-.3-.3-.4-.6-.5-1l1-.3c0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .4-.1.5-.3.1-.2.1-.5.1-.9V5z"
        fill="#323330"
      />
      <path
        d="M9 11c.3.2.7.3 1.1.3.5 0 .7-.2.7-.5 0-.3-.2-.5-.7-.7l-.4-.1c-.8-.3-1.2-.7-1.2-1.4 0-.7.5-1.3 1.4-1.3.4 0 .8.1 1.1.3l-.3.8c-.3-.1-.5-.2-.8-.2-.4 0-.5.2-.5.4 0 .3.2.4.7.6l.3.1c.9.3 1.3.8 1.3 1.5 0 .8-.6 1.3-1.5 1.3-.5 0-1-.1-1.4-.4L9 11z"
        fill="#323330"
      />
    </svg>
  );
}

/** JavaScript React (.jsx) */
export function JavaScriptReactIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#f7df1e" />
      <circle cx="10.5" cy="10" r="1" fill="#61dafb" />
      <ellipse cx="10.5" cy="10" rx="3.5" ry="1.3" stroke="#61dafb" strokeWidth="0.6" fill="none" />
      <ellipse
        cx="10.5"
        cy="10"
        rx="3.5"
        ry="1.3"
        stroke="#61dafb"
        strokeWidth="0.6"
        fill="none"
        transform="rotate(60 10.5 10)"
      />
      <ellipse
        cx="10.5"
        cy="10"
        rx="3.5"
        ry="1.3"
        stroke="#61dafb"
        strokeWidth="0.6"
        fill="none"
        transform="rotate(120 10.5 10)"
      />
      <path
        d="M2.5 4h1.2v4c0 .3 0 .5-.1.7-.1.2-.3.3-.5.4-.2.1-.5.1-.8.1-.4 0-.7-.1-1-.3l.3-.8c.1.1.3.2.5.2.2 0 .3-.1.3-.2.1-.1.1-.3.1-.6V4z"
        fill="#323330"
      />
    </svg>
  );
}

/** CSS (.css, .scss, .less) */
export function CssIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#1572b6" />
      <path d="M3.5 3L4.2 12l3.8 1.2L11.8 12l.7-9H3.5z" fill="#1572b6" />
      <path d="M8 4.2v8l3-0.9.6-7.1H8z" fill="#33a9dc" />
      <path d="M5 6.5h6l-.2 2H7.5l.1 1.3L8 10l2.5-.5.1-1H5.2L5 6.5z" fill="#fff" />
    </svg>
  );
}

/** HTML (.html, .htm) */
export function HtmlIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#e34f26" />
      <path d="M3.5 2.5L4.3 12.5l3.7 1 3.7-1 .8-10H3.5z" fill="#e34f26" />
      <path d="M8 3.5v9l3-0.8.6-8.2H8z" fill="#f06529" />
      <path
        d="M5 6h6l-.1 1.5H7.3l.1 1.5h3.3l-.2 2.5L8 12l-2.5-.8-.1-1.7h1.2l.1.8 1.3.4 1.3-.4.2-1.3H5.1L5 6z"
        fill="#fff"
      />
    </svg>
  );
}

/** JSON (.json, .jsonc) */
export function JsonIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#cbcb41" />
      <path
        d="M6.2 4C5.5 4 5 4.3 5 5.2v1.6c0 .6-.3 1-.8 1.2.5.2.8.6.8 1.2v1.6c0 .9.5 1.2 1.2 1.2h.3v-1h-.1c-.3 0-.5-.1-.5-.5V9c0-.6-.3-1-.7-1.1v-.1c.4-.1.7-.5.7-1.1V5.5c0-.4.2-.5.5-.5h.1V4h-.3z"
        fill="#323330"
      />
      <path
        d="M9.8 4c.7 0 1.2.3 1.2 1.2v1.6c0 .6.3 1 .8 1.2-.5.2-.8.6-.8 1.2v1.6c0 .9-.5 1.2-1.2 1.2h-.3v-1h.1c.3 0 .5-.1.5-.5V9c0-.6.3-1 .7-1.1v-.1c-.4-.1-.7-.5-.7-1.1V5.5c0-.4-.2-.5-.5-.5h-.1V4h.3z"
        fill="#323330"
      />
    </svg>
  );
}

/** Markdown (.md, .mdx) */
export function MarkdownIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect x="0.5" y="2.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <path
        d="M3 10V6l2 2.5L7 6v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 8.5l2-2v5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 11.5l2-2 2 2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** YAML (.yaml, .yml) */
export function YamlIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#cb171e" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        YML
      </text>
    </svg>
  );
}

/** Python (.py) */
export function PythonIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M7.9 1.5c-3 0-2.8 1.3-2.8 1.3v1.4h2.9v.4H3.7S1.5 4.3 1.5 7.5s1.9 3 1.9 3h1.1V9.1s-.1-1.9 1.9-1.9h3.2s1.8 0 1.8-1.8V3.2s.3-1.7-3.5-1.7zm-1.7 1c.3 0 .6.3.6.6s-.3.6-.6.6-.6-.3-.6-.6.3-.6.6-.6z"
        fill="#3776ab"
      />
      <path
        d="M8.1 14.5c3 0 2.8-1.3 2.8-1.3v-1.4H8v-.4h4.3s2.2.3 2.2-2.9-1.9-3-1.9-3h-1.1v1.4s.1 1.9-1.9 1.9H6.4s-1.8 0-1.8 1.8v2.2s-.3 1.7 3.5 1.7zm1.7-1c-.3 0-.6-.3-.6-.6s.3-.6.6-.6.6.3.6.6-.3.6-.6.6z"
        fill="#ffd43b"
      />
    </svg>
  );
}

/** Go (.go) */
export function GoIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#00add8" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
        Go
      </text>
    </svg>
  );
}

/** Rust (.rs) */
export function RustIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#dea584" />
      <text x="8" y="11.5" textAnchor="middle" fill="#000" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Rs
      </text>
    </svg>
  );
}

/** Java (.java) */
export function JavaIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#e76f00" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Jv
      </text>
    </svg>
  );
}

/** C (.c) */
export function CIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#a8b9cc" />
      <text x="8" y="12" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
        C
      </text>
    </svg>
  );
}

/** C++ (.cpp, .cc, .cxx) */
export function CppIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#00599c" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        C++
      </text>
    </svg>
  );
}

/** C# (.cs) */
export function CSharpIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#239120" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
        C#
      </text>
    </svg>
  );
}

/** Ruby (.rb) */
export function RubyIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#cc342d" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Rb
      </text>
    </svg>
  );
}

/** PHP (.php) */
export function PhpIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="8" fill="#777bb3" />
      <text x="8" y="11" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        php
      </text>
    </svg>
  );
}

/** Swift (.swift) */
export function SwiftIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="3" fill="#fa7343" />
      <path
        d="M11.5 11.8c-.1.1-.3.1-.5.1-1.4 0-3-1.2-4.4-3 1.3.8 2.8 1.2 3.9 1.2-.5-.7-3.6-3.8-3.6-3.8 1.2.9 2.5 1.5 3.5 1.8C9 6.3 5.5 3.8 5.5 3.8c2.3 2 4.1 3.9 5.2 5.3.7-1 1-2.3.7-3.6 1.4 1.4 1.4 4-.2 5.4l.3.9z"
        fill="#fff"
      />
    </svg>
  );
}

/** Kotlin (.kt, .kts) */
export function KotlinIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <defs>
        <linearGradient id="ktGrad" x1="0" y1="16" x2="16" y2="0">
          <stop offset="0%" stopColor="#e44857" />
          <stop offset="50%" stopColor="#c711e1" />
          <stop offset="100%" stopColor="#7f52ff" />
        </linearGradient>
      </defs>
      <rect width="16" height="16" rx="2" fill="url(#ktGrad)" />
      <path d="M3 13L8 8l5-5H8L3 8v5z" fill="#fff" />
      <path d="M3 13l5-5 5 5H3z" fill="#fff" />
    </svg>
  );
}

/** Dart (.dart) */
export function DartIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#00b4ab" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Dt
      </text>
    </svg>
  );
}

/** Shell (.sh, .bash, .zsh) */
export function ShellIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#2b2b2b" />
      <path
        d="M4 4.5l4 3.5-4 3.5"
        stroke="#89e051"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M9 12h4" stroke="#89e051" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Dockerfile */
export function DockerIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#2496ed" />
      {/* コンテナの積み重なりを表現するシンプルな形 */}
      <rect x="3" y="7" width="2.2" height="2" rx="0.3" fill="#fff" />
      <rect x="5.5" y="7" width="2.2" height="2" rx="0.3" fill="#fff" />
      <rect x="8" y="7" width="2.2" height="2" rx="0.3" fill="#fff" />
      <rect x="3" y="4.7" width="2.2" height="2" rx="0.3" fill="#fff" />
      <rect x="5.5" y="4.7" width="2.2" height="2" rx="0.3" fill="#fff" />
      <rect x="8" y="4.7" width="2.2" height="2" rx="0.3" fill="#fff" />
      <path d="M10.5 6.5c.5-.3 1.3-.3 2 .5" stroke="#fff" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <path d="M1.5 10c1 1.5 3 2.5 6 2.5s5-1 6-2.5" stroke="#fff" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

/** SQL (.sql) */
export function SqlIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#e38c00" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        SQL
      </text>
    </svg>
  );
}

/** GraphQL (.graphql, .gql) */
export function GraphqlIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#171e26" />
      <polygon points="8,2.5 13,5.5 13,10.5 8,13.5 3,10.5 3,5.5" stroke="#e10098" strokeWidth="1" fill="none" />
      <circle cx="8" cy="2.5" r="1" fill="#e10098" />
      <circle cx="13" cy="5.5" r="1" fill="#e10098" />
      <circle cx="13" cy="10.5" r="1" fill="#e10098" />
      <circle cx="8" cy="13.5" r="1" fill="#e10098" />
      <circle cx="3" cy="10.5" r="1" fill="#e10098" />
      <circle cx="3" cy="5.5" r="1" fill="#e10098" />
    </svg>
  );
}

/** Vue (.vue) */
export function VueIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M1 2h3.5L8 8l3.5-6H15L8 14.5 1 2z" fill="#42b883" />
      <path d="M4.5 2L8 8l3.5-6h-2.5L8 4.5 6.9 2H4.5z" fill="#35495e" />
    </svg>
  );
}

/** Svelte (.svelte) */
export function SvelteIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#ff3e00" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Sv
      </text>
    </svg>
  );
}

/** XML (.xml) */
export function XmlIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#e37933" />
      <path
        d="M4 5l-2 3 2 3"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 5l2 3-2 3"
        stroke="#fff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M9 4l-2 8" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** TOML (.toml) */
export function TomlIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#9c4121" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
        TML
      </text>
    </svg>
  );
}

/** Image (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico) */
export function ImageIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect x="1" y="2" width="14" height="12" rx="1.5" stroke="#a074c4" strokeWidth="1.2" fill="none" />
      <circle cx="5" cy="5.5" r="1.5" fill="#a074c4" />
      <path d="M1.5 11l3-3 2.5 2.5L10 8l4.5 4.5v.5H1.5v-2z" fill="#a074c4" opacity="0.6" />
    </svg>
  );
}

/** Lock file (.lock) */
export function LockFileIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect x="4" y="7" width="8" height="6" rx="1" fill="#e5c07b" />
      <path d="M6 7V5a2 2 0 0 1 4 0v2" stroke="#e5c07b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="8" cy="10" r="1" fill="#323330" />
    </svg>
  );
}

/** Env file (.env) */
export function EnvIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#ecd53f" />
      <text x="8" y="11.5" textAnchor="middle" fill="#323330" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        ENV
      </text>
    </svg>
  );
}

/** Git files (.gitignore, .gitattributes) */
export function GitIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M15 7.3L8.7 1a1 1 0 0 0-1.4 0L5.8 2.5l1.8 1.8a1.2 1.2 0 0 1 1.5 1.5L10.8 7.5a1.2 1.2 0 1 1-.7.4L8.5 6.3v4a1.2 1.2 0 1 1-1-.1V6.1A1.2 1.2 0 0 1 7 4.8L5.2 3 1 7.3a1 1 0 0 0 0 1.4L7.3 15a1 1 0 0 0 1.4 0l6.3-6.3a1 1 0 0 0 0-1.4"
        fill="#f05032"
      />
    </svg>
  );
}

/** Lua (.lua) */
export function LuaIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#000080" />
      <circle cx="7.5" cy="8.5" r="4" stroke="#fff" strokeWidth="1.2" fill="none" />
      <circle cx="12" cy="4" r="1.5" fill="#fff" />
    </svg>
  );
}

/** R (.r, .R) */
export function RIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#276dc3" />
      <text x="8" y="12" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
        R
      </text>
    </svg>
  );
}

/** Scala (.scala) */
export function ScalaIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#dc322f" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Sc
      </text>
    </svg>
  );
}

/** Zig (.zig) */
export function ZigIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#f7a41d" />
      <text x="8" y="11.5" textAnchor="middle" fill="#000" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Zig
      </text>
    </svg>
  );
}

/** Elixir (.ex, .exs) */
export function ElixirIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#6e4a7e" />
      <path d="M8 2C6 5 5 7.5 5 9.5a3 3 0 0 0 6 0C11 7.5 10 5 8 2z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

/** Haskell (.hs) */
export function HaskellIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#5d4f85" />
      <path d="M1 13L4.5 8 1 3h2.5l3.5 5-3.5 5H1z" fill="#fff" />
      <path d="M4 13L7.5 8 4 3h2.5l5 5-5 5H4z" fill="#fff" opacity="0.7" />
      <path d="M9.5 9.5l1 1.5h3l-1-1.5h-3zM10.5 6.5l1 1.5h3l-1-1.5h-3z" fill="#fff" />
    </svg>
  );
}

/** Prisma (.prisma) */
export function PrismaIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#2d3748" />
      <path d="M5 13l-1-7L12 3l-1 10-6 2z" fill="#fff" />
      <path d="M5 13l7-3-1-7L5 13z" fill="#5a67d8" opacity="0.5" />
    </svg>
  );
}

/** Terraform (.tf) */
export function TerraformIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#844fba" />
      <path d="M6 3v3.5l3 1.8V4.8L6 3z" fill="#fff" />
      <path d="M9.5 4.8v3.5l3-1.8V3l-3 1.8z" fill="#fff" opacity="0.6" />
      <path d="M6 8.7v3.5l3 1.8V10.5L6 8.7z" fill="#fff" />
    </svg>
  );
}

/** PowerShell (.ps1) */
export function PowershellIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#012456" />
      <path
        d="M3 4.5l5 3.5-5 3.5"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M8 12.5h5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Header file (.h, .hpp) */
export function HeaderIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#a8b9cc" />
      <text x="8" y="12" textAnchor="middle" fill="#000" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
        H
      </text>
    </svg>
  );
}

/** Perl (.pl, .pm) */
export function PerlIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#39457e" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Pl
      </text>
    </svg>
  );
}

/** Clojure (.clj, .cljs, .cljc) */
export function ClojureIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#5881d8" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Clj
      </text>
    </svg>
  );
}

/** Erlang (.erl) */
export function ErlangIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#a90533" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
        Erl
      </text>
    </svg>
  );
}

/** Lisp / Emacs Lisp (.lisp, .el) */
export function LispIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#3fb68b" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
        λ
      </text>
    </svg>
  );
}

/** Nim (.nim) */
export function NimIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#ffe953" />
      <text x="8" y="11.5" textAnchor="middle" fill="#000" fontSize="6" fontWeight="bold" fontFamily="sans-serif">
        Nim
      </text>
    </svg>
  );
}

/** WebAssembly (.wasm) */
export function WasmIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#654ff0" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
        WA
      </text>
    </svg>
  );
}

/** Protocol Buffers (.proto) */
export function ProtoIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#4285f4" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">
        PB
      </text>
    </svg>
  );
}

/** Batch (.bat, .cmd) */
export function BatchIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#c1f12e" />
      <path
        d="M4 4.5l4 3.5-4 3.5"
        stroke="#1e1e1e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M9 12h4" stroke="#1e1e1e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Log file (.log) */
export function LogIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M4.5 4.5h7M4.5 7h5M4.5 9.5h6M4.5 12h3" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/** CSV (.csv) */
export function CsvIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#237346" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        CSV
      </text>
    </svg>
  );
}

/** PDF (.pdf) */
export function PdfIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#d32f2f" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        PDF
      </text>
    </svg>
  );
}

/** ReStructuredText (.rst) */
export function RstIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#141414" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        rST
      </text>
    </svg>
  );
}

/** Plain text (.txt) */
export function TxtIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect x="2" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M4.5 4.5h7M4.5 7h7M4.5 9.5h5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

/** INI / Config (.ini, .cfg) */
export function IniIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#6d8086" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
        INI
      </text>
    </svg>
  );
}

/** Makefile */
export function MakefileIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <rect width="16" height="16" rx="2" fill="#6d8086" />
      <text x="8" y="11.5" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
        Make
      </text>
    </svg>
  );
}

/** デフォルトのファイルアイコン（フォールバック） */
export function DefaultFileIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M3 1.5h6.5L13 5v9.5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
      <path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}

/** フォルダアイコン */
export function FolderTypeIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M1.5 3a1 1 0 0 1 1-1h3.7l1.3 1.5h6a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V3z"
        fill="#dcb67a"
        stroke="#dcb67a"
        strokeWidth="0.5"
      />
    </svg>
  );
}
