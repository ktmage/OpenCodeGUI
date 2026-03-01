import type { FC } from "react";
import type { IconProps } from "../components/atoms/icons";
import {
  BatchIcon,
  CIcon,
  ClojureIcon,
  CppIcon,
  CSharpIcon,
  CssIcon,
  CsvIcon,
  DartIcon,
  DefaultFileIcon,
  DockerIcon,
  ElixirIcon,
  EnvIcon,
  ErlangIcon,
  FolderTypeIcon,
  GitIcon,
  GoIcon,
  GraphqlIcon,
  HaskellIcon,
  HeaderIcon,
  HtmlIcon,
  ImageIcon,
  IniIcon,
  JavaIcon,
  JavaScriptIcon,
  JavaScriptReactIcon,
  JsonIcon,
  KotlinIcon,
  LispIcon,
  LockFileIcon,
  LogIcon,
  LuaIcon,
  MakefileIcon,
  MarkdownIcon,
  NimIcon,
  PdfIcon,
  PerlIcon,
  PhpIcon,
  PowershellIcon,
  PrismaIcon,
  ProtoIcon,
  PythonIcon,
  RIcon,
  RstIcon,
  RubyIcon,
  RustIcon,
  ScalaIcon,
  ShellIcon,
  SqlIcon,
  SvelteIcon,
  SwiftIcon,
  TerraformIcon,
  TomlIcon,
  TxtIcon,
  TypeScriptIcon,
  TypeScriptReactIcon,
  VueIcon,
  WasmIcon,
  XmlIcon,
  YamlIcon,
  ZigIcon,
} from "../components/atoms/icons/file-type-icons";

/**
 * 完全一致でアイコンを返すマッピング。
 * ファイル名全体（小文字化済み）をキーとする。
 */
const exactMatchMap: Record<string, FC<IconProps>> = {
  dockerfile: DockerIcon,
  makefile: MakefileIcon,
  ".gitignore": GitIcon,
  ".gitattributes": GitIcon,
  ".gitmodules": GitIcon,
  ".env": EnvIcon,
  ".env.local": EnvIcon,
  ".env.development": EnvIcon,
  ".env.production": EnvIcon,
  ".env.test": EnvIcon,
};

/**
 * 拡張子からアイコンへのマッピング。
 * 最長一致で検索するため、 `.d.ts` のような複合拡張子もサポートする。
 */
const extensionMap: Record<string, FC<IconProps>> = {
  // TypeScript / JavaScript
  ".d.ts": TypeScriptIcon,
  ".ts": TypeScriptIcon,
  ".tsx": TypeScriptReactIcon,
  ".js": JavaScriptIcon,
  ".mjs": JavaScriptIcon,
  ".cjs": JavaScriptIcon,
  ".jsx": JavaScriptReactIcon,

  // Web
  ".css": CssIcon,
  ".scss": CssIcon,
  ".sass": CssIcon,
  ".less": CssIcon,
  ".html": HtmlIcon,
  ".htm": HtmlIcon,
  ".vue": VueIcon,
  ".svelte": SvelteIcon,

  // Data / Config
  ".json": JsonIcon,
  ".jsonc": JsonIcon,
  ".json5": JsonIcon,
  ".yaml": YamlIcon,
  ".yml": YamlIcon,
  ".toml": TomlIcon,
  ".xml": XmlIcon,
  ".ini": IniIcon,
  ".cfg": IniIcon,
  ".env": EnvIcon,
  ".graphql": GraphqlIcon,
  ".gql": GraphqlIcon,
  ".prisma": PrismaIcon,
  ".proto": ProtoIcon,

  // Document
  ".md": MarkdownIcon,
  ".mdx": MarkdownIcon,
  ".txt": TxtIcon,
  ".rst": RstIcon,
  ".pdf": PdfIcon,
  ".csv": CsvIcon,
  ".log": LogIcon,

  // Systems languages
  ".go": GoIcon,
  ".rs": RustIcon,
  ".c": CIcon,
  ".cpp": CppIcon,
  ".cc": CppIcon,
  ".cxx": CppIcon,
  ".h": HeaderIcon,
  ".hpp": HeaderIcon,
  ".hxx": HeaderIcon,
  ".cs": CSharpIcon,
  ".java": JavaIcon,
  ".kt": KotlinIcon,
  ".kts": KotlinIcon,
  ".scala": ScalaIcon,
  ".zig": ZigIcon,
  ".wasm": WasmIcon,

  // Scripting languages
  ".py": PythonIcon,
  ".pyw": PythonIcon,
  ".rb": RubyIcon,
  ".php": PhpIcon,
  ".pl": PerlIcon,
  ".pm": PerlIcon,
  ".lua": LuaIcon,
  ".r": RIcon,

  // Mobile
  ".swift": SwiftIcon,
  ".dart": DartIcon,

  // Shell / Infra
  ".sh": ShellIcon,
  ".bash": ShellIcon,
  ".zsh": ShellIcon,
  ".fish": ShellIcon,
  ".ps1": PowershellIcon,
  ".bat": BatchIcon,
  ".cmd": BatchIcon,
  ".dockerfile": DockerIcon,
  ".tf": TerraformIcon,
  ".hcl": TerraformIcon,

  // Functional
  ".ex": ElixirIcon,
  ".exs": ElixirIcon,
  ".erl": ErlangIcon,
  ".hs": HaskellIcon,
  ".clj": ClojureIcon,
  ".cljs": ClojureIcon,
  ".cljc": ClojureIcon,
  ".lisp": LispIcon,
  ".el": LispIcon,
  ".nim": NimIcon,

  // DB
  ".sql": SqlIcon,

  // Image
  ".svg": ImageIcon,
  ".png": ImageIcon,
  ".jpg": ImageIcon,
  ".jpeg": ImageIcon,
  ".gif": ImageIcon,
  ".webp": ImageIcon,
  ".ico": ImageIcon,
  ".bmp": ImageIcon,

  // Lock
  ".lock": LockFileIcon,

  // Git
  ".gitignore": GitIcon,
  ".gitattributes": GitIcon,
};

/**
 * 拡張子マッピングのキーを長さの降順でソートしたもの。
 * 最長一致を実現するために事前ソートしておく。
 */
const sortedExtensions = Object.keys(extensionMap).sort((a, b) => b.length - a.length);

/**
 * ファイル名からファイルタイプアイコンコンポーネントを返す。
 *
 * 判定優先順位:
 * 1. 完全一致（ファイル名全体）
 * 2. 拡張子マッチ（最長一致）
 * 3. フォールバック → DefaultFileIcon
 */
export function getFileIcon(fileName: string): FC<IconProps> {
  const lower = fileName.toLowerCase();

  // 1. 完全一致
  const exact = exactMatchMap[lower];
  if (exact) return exact;

  // 2. 拡張子マッチ（最長一致）
  for (const ext of sortedExtensions) {
    if (lower.endsWith(ext)) {
      return extensionMap[ext];
    }
  }

  // 3. フォールバック
  return DefaultFileIcon;
}

/**
 * フォルダアイコンコンポーネントを返す。
 */
export function getFolderIcon(): FC<IconProps> {
  return FolderTypeIcon;
}
