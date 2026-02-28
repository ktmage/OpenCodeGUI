import type { SVGProps } from "react";

// Common props for all icon components.
// Consumers can override width, height, className, and any standard SVG attribute.
export type IconProps = SVGProps<SVGSVGElement>;

// ─── Navigation / Header ─────────────────────────────────────────────

/** Codicon: list-unordered */
export function ListIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M2 3h1v1H2V3zm3 0h9v1H5V3zM2 7h1v1H2V7zm3 0h9v1H5V7zm-3 4h1v1H2v-1zm3 0h9v1H5v-1z" />
    </svg>
  );
}

/** Codicon: add (16px plus) */
export function AddIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 1v7H1v1h7v7h1V9h7V8H9V1H8z" />
    </svg>
  );
}

/** Small plus icon (12px) used for quick-add buttons */
export function PlusIcon({ width = 12, height = 12, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z" />
    </svg>
  );
}

/** Chevron right arrow — used for expand/collapse toggles */
export function ChevronRightIcon({ width = 12, height = 12, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5.3 5.3-5.3 5.4z" />
    </svg>
  );
}

// ─── File / Document ──────────────────────────────────────────────────

/** Codicon: file */
export function FileIcon({ width = 12, height = 12, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M13.71 4.29l-3-3A1 1 0 0 0 10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-.29-.71zM12 14H4V2h5v3a1 1 0 0 0 1 1h3v8z" />
    </svg>
  );
}

/** Codicon: paperclip / attach */
export function ClipIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M10.97 2.29a1.625 1.625 0 0 0-2.298 0L3.836 7.126a2.813 2.813 0 0 0 3.977 3.977l4.837-4.836-.707-.708-4.837 4.837a1.813 1.813 0 0 1-2.563-2.563L9.38 2.997a.625.625 0 0 1 .884.884L5.427 8.718a.313.313 0 0 0 .442.442l4.837-4.837-.707-.707-4.837 4.837a1.313 1.313 0 0 1-1.856-1.856l4.836-4.837a1.625 1.625 0 0 1 2.298 0 1.625 1.625 0 0 1 0 2.298l-4.837 4.837a2.813 2.813 0 0 1-3.977-3.977L7.63 1.285l-.707-.707L1.285 6.214a3.813 3.813 0 0 0 5.391 5.391l4.837-4.837a2.625 2.625 0 0 0 0-3.712 2.625 2.625 0 0 0-.543-.356z" />
    </svg>
  );
}

// ─── Action ───────────────────────────────────────────────────────────

/** Codicon: close (×) */
export function CloseIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707z" />
    </svg>
  );
}

/** Codicon: trash / delete */
export function DeleteIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M10 3h3v1h-1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4H3V3h3V2a1 1 0 011-1h2a1 1 0 011 1v1zM5 4v9h6V4H5zm2-1V2H7v1h2V2H9v1z" />
    </svg>
  );
}

/** Codicon: edit / pencil */
export function EditIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z" />
    </svg>
  );
}

/** Codicon: send arrow */
export function SendIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1 1.5l14 6.5-14 6.5V9l8-1-8-1V1.5z" />
    </svg>
  );
}

/** Codicon: stop (square) */
export function StopIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <rect x="3" y="3" width="10" height="10" rx="1" />
    </svg>
  );
}

/** Revert / retry arrows — used for checkpoint revert */
export function RevertIcon({ width = 12, height = 12, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M2.006 8.267L.78 9.5 3.28 12l2.5-2.5L4.56 8.28l-1.054 1.06a5.001 5.001 0 0 1 8.98-3.89l1.054-.98A6.002 6.002 0 0 0 3.507 7.21L2.006 8.267zM13.994 7.733L15.22 6.5 12.72 4l-2.5 2.5 1.22 1.22 1.054-1.06a5.001 5.001 0 0 1-8.98 3.89l-1.054.98a6.002 6.002 0 0 0 10.007-1.566l1.527-2.231z" />
    </svg>
  );
}

/** Codicon: repo-forked — セッション Fork 用の分岐アイコン */
export function ForkIcon({ width = 12, height = 12, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M14 4a2 2 0 1 0-2.47 1.94V7a1 1 0 0 1-1 1H5.53a1 1 0 0 1-1-1V5.94a2 2 0 1 0-1 0V7a2 2 0 0 0 2 2h1.473v1.06a2 2 0 1 0 1 0V9H9.53a2 2 0 0 0 2-2V5.94A2 2 0 0 0 14 4zM5.03 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3.5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3.5-8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
  );
}

// ─── Input Area Actions ───────────────────────────────────────────────

/** Codicon: terminal */
export function TerminalIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1 3.5l4.5 4.5L1 12.5l1 1 5.5-5.5L2 2.5l-1 1zM8 13h7v-1H8v1z" />
    </svg>
  );
}

/** Codicon: gear / settings */
export function GearIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M14.773 7.308l-1.394-.461a5.543 5.543 0 0 0-.476-1.147l.646-1.32a.249.249 0 0 0-.046-.283l-.87-.87a.249.249 0 0 0-.283-.046l-1.32.646a5.543 5.543 0 0 0-1.147-.476l-.461-1.394A.249.249 0 0 0 9.184 1.8H8.016a.249.249 0 0 0-.238.157l-.461 1.394a5.543 5.543 0 0 0-1.147.476l-1.32-.646a.249.249 0 0 0-.283.046l-.87.87a.249.249 0 0 0-.046.283l.646 1.32a5.543 5.543 0 0 0-.476 1.147l-1.394.461A.249.249 0 0 0 2.27 7.546v1.168c0 .103.064.196.157.238l1.394.461c.11.4.27.784.476 1.147l-.646 1.32a.249.249 0 0 0 .046.283l.87.87c.073.073.18.096.283.046l1.32-.646c.363.206.747.366 1.147.476l.461 1.394c.042.093.135.157.238.157h1.168c.103 0 .196-.064.238-.157l.461-1.394a5.543 5.543 0 0 0 1.147-.476l1.32.646a.249.249 0 0 0 .283-.046l.87-.87a.249.249 0 0 0 .046-.283l-.646-1.32c.206-.363.366-.747.476-1.147l1.394-.461a.249.249 0 0 0 .157-.238V7.546a.249.249 0 0 0-.157-.238zM8.6 10.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6z" />
    </svg>
  );
}

// ─── Tool / Status ────────────────────────────────────────────────────

/** Loading spinner — animated rotating arc */
export function SpinnerIcon({ width = 16, height = 16, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Error circle with exclamation mark */
export function ErrorCircleIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
      <path d="M7.25 4h1.5v5h-1.5V4zm0 6h1.5v1.5h-1.5V10z" />
    </svg>
  );
}

/** Info circle — used for completed reasoning/thought indicator */
export function InfoCircleIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
      <path d="M7.5 4.5h1v4h-1zM7.5 10h1v1.5h-1z" />
    </svg>
  );
}

/** Checkbox with checkmark */
export function CheckboxIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2zm0 1a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9zM6.5 6L5 7.5 7 9.5l4-4L9.5 4 7 6.5 6.5 6z" />
    </svg>
  );
}

// ─── Tool Action Category Icons ───────────────────────────────────────

/** Read action icon — open file/document */
export function ReadActionIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1.5 1h11l1.5 2v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 0 13.5V2.5A1.5 1.5 0 0 1 1.5 1zm0 1a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V3.5L12 2H1.5zM3 5h8v1H3V5zm0 3h8v1H3V8zm0 3h5v1H3v-1z" />
    </svg>
  );
}

/** Edit action icon — pencil (same path as EditIcon) */
export function EditActionIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z" />
    </svg>
  );
}

/** Write/create action icon — file upload */
export function WriteActionIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M9 1h4.5a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5V2.5A1.5 1.5 0 0 1 2.5 1H7v1H2.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V2.5a.5.5 0 0 0-.5-.5H9V1zM8 4l4 4H9v4H7V8H4l4-4z" />
    </svg>
  );
}

/** Run action icon — play button in terminal */
export function RunActionIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M2 2.5A1.5 1.5 0 0 1 3.5 1h9A1.5 1.5 0 0 1 14 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5v-11zM3.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-9zM5 6l4 2.5L5 11V6z" />
    </svg>
  );
}

/** Search action icon — magnifying glass */
export function SearchActionIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M15.25 11.8l-3.5-3.5a5.51 5.51 0 1 0-1.45 1.45l3.5 3.5a1.028 1.028 0 0 0 1.45-1.45zM6.5 10A3.5 3.5 0 1 1 10 6.5 3.504 3.504 0 0 1 6.5 10z" />
    </svg>
  );
}

/** Generic tool/file icon — default for uncategorized tools */
export function ToolIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5h-3V1z" />
    </svg>
  );
}

// ─── Visibility ───────────────────────────────────────────────────────

/** Codicon: diff — git compare icon for file changes */
export function DiffIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.257a1.5 1.5 0 0 1 1.06.44l1.244 1.243A.5.5 0 0 0 8.414 4H12.5A1.5 1.5 0 0 1 14 5.5v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H8.414a1.5 1.5 0 0 1-1.06-.44L6.11 3.317A.5.5 0 0 0 5.757 3H3.5z" />
    </svg>
  );
}

/** External link — open file in editor */
export function ExternalLinkIcon({ width = 12, height = 12, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1.5 1H6v1H2v12h12v-4h1v4.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5zM9 1h6v6l-2-2-4 4-1-1 4-4L9 1z" />
    </svg>
  );
}

/** Eye icon — visible / show */
export function EyeIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 3C4.5 3 1.7 5.1 0.5 8c1.2 2.9 4 5 7.5 5s6.3-2.1 7.5-5c-1.2-2.9-4-5-7.5-5zm0 8.5C5.5 11.5 3.5 10 2.2 8 3.5 6 5.5 4.5 8 4.5S12.5 6 13.8 8c-1.3 2-3.3 3.5-5.8 3.5zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
    </svg>
  );
}

/** Eye-off icon — hidden / hide */
export function EyeOffIcon({ width = 14, height = 14, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 3C4.5 3 1.7 5.1 0.5 8c.5 1.2 1.3 2.3 2.3 3.1l1-1c-.7-.6-1.3-1.3-1.7-2.1C3.5 6 5.5 4.5 8 4.5c.8 0 1.6.2 2.3.4l1.1-1.1C10.4 3.3 9.2 3 8 3zm4.9 1.9l-1 1c.7.6 1.3 1.3 1.7 2.1-1.3 2-3.3 3.5-5.8 3.5-.8 0-1.5-.1-2.2-.4l-1.1 1.1c1 .5 2.1.8 3.3.8 3.5 0 6.3-2.1 7.5-5-.6-1.3-1.4-2.4-2.4-3.1zM2.3 1.3L1 2.6l2.5 2.5C2 6.2 1 7 0.5 8c1.2 2.9 4 5 7.5 5 1.1 0 2.2-.2 3.1-.6l2.3 2.3 1.3-1.3L2.3 1.3zM8 11.5c-2.5 0-4.5-1.5-5.8-3.5.5-.9 1.2-1.7 2-2.3l1.5 1.5c-.1.3-.2.5-.2.8a2.5 2.5 0 003.3 2.3l1.1 1.1c-.6.1-1.2.1-1.9.1z" />
    </svg>
  );
}

// ─── Child Session Navigation ─────────────────────────────────────────

/** Codicon: arrow-left — back navigation */
export function BackIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M7 3.09l-5 5V8.9l5 5 .71-.71L3.41 8.9H15v-1H3.41l4.3-4.3L7 3.09z" />
    </svg>
  );
}

// ─── Share ────────────────────────────────────────────────────────────

/** Codicon: link — share session */
export function ShareIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M4.4 3l1.086 1.086-3.232 3.232 3.232 3.232L4.4 11.636.082 7.318 4.4 3zm7.2 0l-1.086 1.086 3.232 3.232-3.232 3.232L11.6 11.636l4.318-4.318L11.6 3zM7.053 12.697L8.271 3.07l.982.136-1.218 9.627-.982-.136z" />
    </svg>
  );
}

/** Codicon: link-external — unshare / shared state */
export function UnshareIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M1.5 1H6v1H2v12h12v-4h1v4.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5zM9 1h6v6l-2-2-4 4-1-1 4-4L9 1z" />
    </svg>
  );
}

/** Codicon: person — agent/subagent icon */
export function AgentIcon({ width = 16, height = 16, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" width={width} height={height} viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm-3.5 9c0-2.5 2-4.5 4.5-4.5h2c2.5 0 4.5 2 4.5 4.5v1h-1v-1c0-1.9-1.6-3.5-3.5-3.5H7c-1.9 0-3.5 1.6-3.5 3.5v1h-1v-1z" />
    </svg>
  );
}
