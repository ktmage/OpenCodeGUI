import { describe, expect, it } from "vitest";
import {
  CIcon,
  CppIcon,
  CSharpIcon,
  CssIcon,
  DefaultFileIcon,
  DockerIcon,
  EnvIcon,
  FolderTypeIcon,
  GitIcon,
  GoIcon,
  HtmlIcon,
  JavaIcon,
  JavaScriptIcon,
  JavaScriptReactIcon,
  JsonIcon,
  KotlinIcon,
  LockFileIcon,
  MakefileIcon,
  MarkdownIcon,
  PythonIcon,
  RubyIcon,
  RustIcon,
  ShellIcon,
  SqlIcon,
  SvelteIcon,
  SwiftIcon,
  TypeScriptIcon,
  TypeScriptReactIcon,
  VueIcon,
  YamlIcon,
} from "../../components/atoms/icons/file-type-icons";
import { getFileIcon, getFolderIcon } from "../../utils/file-icons";

describe("getFileIcon", () => {
  // ── exact match ──────────────────────────────────────────
  // when the file name exactly matches an entry
  context("完全一致するファイル名の場合", () => {
    // returns DockerIcon for "Dockerfile"
    it("Dockerfile に DockerIcon を返すこと", () => {
      expect(getFileIcon("Dockerfile")).toBe(DockerIcon);
    });

    // returns MakefileIcon for "Makefile"
    it("Makefile に MakefileIcon を返すこと", () => {
      expect(getFileIcon("Makefile")).toBe(MakefileIcon);
    });

    // returns GitIcon for ".gitignore"
    it(".gitignore に GitIcon を返すこと", () => {
      expect(getFileIcon(".gitignore")).toBe(GitIcon);
    });

    // returns GitIcon for ".gitattributes"
    it(".gitattributes に GitIcon を返すこと", () => {
      expect(getFileIcon(".gitattributes")).toBe(GitIcon);
    });

    // returns EnvIcon for ".env"
    it(".env に EnvIcon を返すこと", () => {
      expect(getFileIcon(".env")).toBe(EnvIcon);
    });

    // returns EnvIcon for ".env.local"
    it(".env.local に EnvIcon を返すこと", () => {
      expect(getFileIcon(".env.local")).toBe(EnvIcon);
    });
  });

  // ── exact match is case-insensitive ──────────────────────
  // when the file name matches case-insensitively
  context("大文字・小文字を区別しない完全一致の場合", () => {
    // handles uppercase DOCKERFILE
    it("大文字の DOCKERFILE でも DockerIcon を返すこと", () => {
      expect(getFileIcon("DOCKERFILE")).toBe(DockerIcon);
    });

    // handles mixed case
    it("混在ケースの makefile でも MakefileIcon を返すこと", () => {
      expect(getFileIcon("makefile")).toBe(MakefileIcon);
    });
  });

  // ── extension match: TypeScript / JavaScript ─────────────
  // when the file has a TypeScript or JavaScript extension
  context("TypeScript / JavaScript 拡張子の場合", () => {
    // returns TypeScriptIcon for .ts
    it(".ts に TypeScriptIcon を返すこと", () => {
      expect(getFileIcon("app.ts")).toBe(TypeScriptIcon);
    });

    // returns TypeScriptReactIcon for .tsx
    it(".tsx に TypeScriptReactIcon を返すこと", () => {
      expect(getFileIcon("App.tsx")).toBe(TypeScriptReactIcon);
    });

    // returns JavaScriptIcon for .js
    it(".js に JavaScriptIcon を返すこと", () => {
      expect(getFileIcon("main.js")).toBe(JavaScriptIcon);
    });

    // returns JavaScriptIcon for .mjs
    it(".mjs に JavaScriptIcon を返すこと", () => {
      expect(getFileIcon("config.mjs")).toBe(JavaScriptIcon);
    });

    // returns JavaScriptReactIcon for .jsx
    it(".jsx に JavaScriptReactIcon を返すこと", () => {
      expect(getFileIcon("Button.jsx")).toBe(JavaScriptReactIcon);
    });
  });

  // ── extension match: compound extension (longest match) ──
  // when the file has a compound extension like .d.ts
  context("複合拡張子の場合（最長一致）", () => {
    // returns TypeScriptIcon for .d.ts (not generic .ts)
    it(".d.ts に TypeScriptIcon を返すこと（最長一致）", () => {
      expect(getFileIcon("types.d.ts")).toBe(TypeScriptIcon);
    });
  });

  // ── extension match: Web ─────────────────────────────────
  // when the file has a web-related extension
  context("Web 関連拡張子の場合", () => {
    // returns CssIcon for .css
    it(".css に CssIcon を返すこと", () => {
      expect(getFileIcon("styles.css")).toBe(CssIcon);
    });

    // returns CssIcon for .scss
    it(".scss に CssIcon を返すこと", () => {
      expect(getFileIcon("app.scss")).toBe(CssIcon);
    });

    // returns HtmlIcon for .html
    it(".html に HtmlIcon を返すこと", () => {
      expect(getFileIcon("index.html")).toBe(HtmlIcon);
    });

    // returns VueIcon for .vue
    it(".vue に VueIcon を返すこと", () => {
      expect(getFileIcon("App.vue")).toBe(VueIcon);
    });

    // returns SvelteIcon for .svelte
    it(".svelte に SvelteIcon を返すこと", () => {
      expect(getFileIcon("Page.svelte")).toBe(SvelteIcon);
    });
  });

  // ── extension match: Data / Config ───────────────────────
  // when the file has a data or config extension
  context("データ / 設定ファイル拡張子の場合", () => {
    // returns JsonIcon for .json
    it(".json に JsonIcon を返すこと", () => {
      expect(getFileIcon("package.json")).toBe(JsonIcon);
    });

    // returns YamlIcon for .yml
    it(".yml に YamlIcon を返すこと", () => {
      expect(getFileIcon("config.yml")).toBe(YamlIcon);
    });

    // returns YamlIcon for .yaml
    it(".yaml に YamlIcon を返すこと", () => {
      expect(getFileIcon("docker-compose.yaml")).toBe(YamlIcon);
    });
  });

  // ── extension match: Systems languages ───────────────────
  // when the file has a systems language extension
  context("システム言語拡張子の場合", () => {
    // returns GoIcon for .go
    it(".go に GoIcon を返すこと", () => {
      expect(getFileIcon("main.go")).toBe(GoIcon);
    });

    // returns RustIcon for .rs
    it(".rs に RustIcon を返すこと", () => {
      expect(getFileIcon("lib.rs")).toBe(RustIcon);
    });

    // returns CIcon for .c
    it(".c に CIcon を返すこと", () => {
      expect(getFileIcon("main.c")).toBe(CIcon);
    });

    // returns CppIcon for .cpp
    it(".cpp に CppIcon を返すこと", () => {
      expect(getFileIcon("main.cpp")).toBe(CppIcon);
    });

    // returns CSharpIcon for .cs
    it(".cs に CSharpIcon を返すこと", () => {
      expect(getFileIcon("Program.cs")).toBe(CSharpIcon);
    });

    // returns JavaIcon for .java
    it(".java に JavaIcon を返すこと", () => {
      expect(getFileIcon("Main.java")).toBe(JavaIcon);
    });

    // returns KotlinIcon for .kt
    it(".kt に KotlinIcon を返すこと", () => {
      expect(getFileIcon("App.kt")).toBe(KotlinIcon);
    });
  });

  // ── extension match: Scripting languages ─────────────────
  // when the file has a scripting language extension
  context("スクリプト言語拡張子の場合", () => {
    // returns PythonIcon for .py
    it(".py に PythonIcon を返すこと", () => {
      expect(getFileIcon("app.py")).toBe(PythonIcon);
    });

    // returns RubyIcon for .rb
    it(".rb に RubyIcon を返すこと", () => {
      expect(getFileIcon("app.rb")).toBe(RubyIcon);
    });
  });

  // ── extension match: Document ────────────────────────────
  // when the file has a document extension
  context("ドキュメント拡張子の場合", () => {
    // returns MarkdownIcon for .md
    it(".md に MarkdownIcon を返すこと", () => {
      expect(getFileIcon("README.md")).toBe(MarkdownIcon);
    });
  });

  // ── extension match: Shell / Infra ───────────────────────
  // when the file has a shell or infra extension
  context("シェル / インフラ拡張子の場合", () => {
    // returns ShellIcon for .sh
    it(".sh に ShellIcon を返すこと", () => {
      expect(getFileIcon("setup.sh")).toBe(ShellIcon);
    });

    // returns DockerIcon for .dockerfile
    it(".dockerfile に DockerIcon を返すこと", () => {
      expect(getFileIcon("app.dockerfile")).toBe(DockerIcon);
    });
  });

  // ── extension match: Mobile ──────────────────────────────
  // when the file has a mobile language extension
  context("モバイル言語拡張子の場合", () => {
    // returns SwiftIcon for .swift
    it(".swift に SwiftIcon を返すこと", () => {
      expect(getFileIcon("ViewController.swift")).toBe(SwiftIcon);
    });
  });

  // ── extension match: DB ──────────────────────────────────
  // when the file has a database extension
  context("データベース拡張子の場合", () => {
    // returns SqlIcon for .sql
    it(".sql に SqlIcon を返すこと", () => {
      expect(getFileIcon("schema.sql")).toBe(SqlIcon);
    });
  });

  // ── extension match: Lock ────────────────────────────────
  // when the file has a lock extension
  context("ロックファイル拡張子の場合", () => {
    // returns LockFileIcon for .lock
    it(".lock に LockFileIcon を返すこと", () => {
      expect(getFileIcon("package-lock.lock")).toBe(LockFileIcon);
    });
  });

  // ── case-insensitive extension ───────────────────────────
  // when the extension has different casing
  context("拡張子が大文字の場合", () => {
    // matches uppercase extension
    it("大文字拡張子でも正しいアイコンを返すこと", () => {
      expect(getFileIcon("README.MD")).toBe(MarkdownIcon);
    });
  });

  // ── fallback ─────────────────────────────────────────────
  // when the file name has no matching extension
  context("一致する拡張子がない場合", () => {
    // returns DefaultFileIcon
    it("DefaultFileIcon を返すこと", () => {
      expect(getFileIcon("unknown-file")).toBe(DefaultFileIcon);
    });

    // returns DefaultFileIcon for uncommon extension
    it("未知の拡張子でも DefaultFileIcon を返すこと", () => {
      expect(getFileIcon("data.xyz123")).toBe(DefaultFileIcon);
    });
  });
});

describe("getFolderIcon", () => {
  // returns FolderTypeIcon
  it("FolderTypeIcon を返すこと", () => {
    expect(getFolderIcon()).toBe(FolderTypeIcon);
  });
});
