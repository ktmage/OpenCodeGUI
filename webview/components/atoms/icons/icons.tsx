import type { SVGProps } from "react";
import type { IconBaseProps } from "react-icons";
import {
  VscAdd,
  VscArrowLeft,
  VscArrowRight,
  VscAttach,
  VscChecklist,
  VscChevronRight,
  VscClose,
  VscDebugStop,
  VscDiscard,
  VscEdit,
  VscError,
  VscEye,
  VscEyeClosed,
  VscFile,
  VscFolderOpened,
  VscInfo,
  VscLinkExternal,
  VscListUnordered,
  VscNewFile,
  VscNote,
  VscPerson,
  VscPlay,
  VscRepoForked,
  VscSearch,
  VscSend,
  VscSettingsGear,
  VscShare,
  VscTerminal,
  VscTrash,
} from "react-icons/vsc";

// Common props for all icon components.
// Consumers can override width, height, className, and any standard SVG attribute.
export type IconProps = SVGProps<SVGSVGElement>;

// react-icons の IconBaseProps は SVGAttributes<SVGElement> を拡張しており、
// SVGProps<SVGSVGElement> とほぼ互換。height を除外して size に統一する。
function adapt({ width, height: _height, ...rest }: Omit<IconProps, "ref">, defaultSize: number): IconBaseProps {
  return { size: width != null ? Number(width) : defaultSize, "aria-hidden": true, ...rest };
}

// ─── Navigation / Header ─────────────────────────────────────────────

/** Codicon: list-unordered */
export function ListIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscListUnordered {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: add (16px plus) */
export function AddIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscAdd {...adapt({ width, ...props }, 16)} />;
}

/** Small plus icon (12px) used for quick-add buttons */
export function PlusIcon({ width = 12, height: _h, ...props }: IconProps) {
  return <VscAdd {...adapt({ width, ...props }, 12)} />;
}

/** Chevron right arrow — used for expand/collapse toggles */
export function ChevronRightIcon({ width = 12, height: _h, ...props }: IconProps) {
  return <VscChevronRight {...adapt({ width, ...props }, 12)} />;
}

// ─── File / Document ──────────────────────────────────────────────────

/** Codicon: file */
export function FileIcon({ width = 12, height: _h, ...props }: IconProps) {
  return <VscFile {...adapt({ width, ...props }, 12)} />;
}

/** Codicon: attach */
export function ClipIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscAttach {...adapt({ width, ...props }, 14)} />;
}

// ─── Action ───────────────────────────────────────────────────────────

/** Codicon: close (×) */
export function CloseIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscClose {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: trash / delete */
export function DeleteIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscTrash {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: edit / pencil */
export function EditIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscEdit {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: send arrow */
export function SendIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscSend {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: debug-stop (square) */
export function StopIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscDebugStop {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: discard — used for checkpoint revert */
export function RevertIcon({ width = 12, height: _h, ...props }: IconProps) {
  return <VscDiscard {...adapt({ width, ...props }, 12)} />;
}

/** Codicon: repo-forked — セッション Fork 用の分岐アイコン */
export function ForkIcon({ width = 12, height: _h, ...props }: IconProps) {
  return <VscRepoForked {...adapt({ width, ...props }, 12)} />;
}

// ─── Input Area Actions ───────────────────────────────────────────────

/** Codicon: terminal */
export function TerminalIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscTerminal {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: settings-gear */
export function GearIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscSettingsGear {...adapt({ width, ...props }, 16)} />;
}

// ─── Tool / Status ────────────────────────────────────────────────────

// SpinnerIcon はアニメーション付きのカスタム SVG のため、react-icons に置き換えない
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

/** Codicon: error */
export function ErrorCircleIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscError {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: info — used for completed reasoning/thought indicator */
export function InfoCircleIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscInfo {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: checklist */
export function CheckboxIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscChecklist {...adapt({ width, ...props }, 14)} />;
}

// ─── Tool Action Category Icons ───────────────────────────────────────

/** Codicon: note — read action icon */
export function ReadActionIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscNote {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: edit — edit action icon */
export function EditActionIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscEdit {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: new-file — write/create action icon */
export function WriteActionIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscNewFile {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: play — run action icon */
export function RunActionIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscPlay {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: search — search action icon */
export function SearchActionIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscSearch {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: file — default for uncategorized tools */
export function ToolIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscFile {...adapt({ width, ...props }, 14)} />;
}

// ─── Visibility ───────────────────────────────────────────────────────

/** Codicon: folder-opened — file changes icon */
export function DiffIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscFolderOpened {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: link-external — open file in editor */
export function ExternalLinkIcon({ width = 12, height: _h, ...props }: IconProps) {
  return <VscLinkExternal {...adapt({ width, ...props }, 12)} />;
}

/** Codicon: eye — visible / show */
export function EyeIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscEye {...adapt({ width, ...props }, 14)} />;
}

/** Codicon: eye-closed — hidden / hide */
export function EyeOffIcon({ width = 14, height: _h, ...props }: IconProps) {
  return <VscEyeClosed {...adapt({ width, ...props }, 14)} />;
}

// ─── Child Session Navigation ─────────────────────────────────────────

/** Codicon: arrow-left — back navigation */
export function BackIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscArrowLeft {...adapt({ width, ...props }, 16)} />;
}

// ─── Share ────────────────────────────────────────────────────────────

/** Codicon: share — share session */
export function ShareIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscShare {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: link-external — unshare / shared state */
export function UnshareIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscLinkExternal {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: person — agent/subagent icon */
export function AgentIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscPerson {...adapt({ width, ...props }, 16)} />;
}

// ─── Undo / Redo ──────────────────────────────────────────────────────

/** Codicon: arrow-left — Undo */
export function UndoIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscArrowLeft {...adapt({ width, ...props }, 16)} />;
}

/** Codicon: arrow-right — Redo */
export function RedoIcon({ width = 16, height: _h, ...props }: IconProps) {
  return <VscArrowRight {...adapt({ width, ...props }, 16)} />;
}
