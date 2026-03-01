import { render } from "@testing-library/react";
import type { FC } from "react";
import { describe, expect, it } from "vitest";
import type { IconProps } from "../../../components/atoms/icons";
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
} from "../../../components/atoms/icons/file-type-icons";

/**
 * 共通テストを生成するヘルパー。
 * 全ファイルタイプアイコンは 14×14、aria-hidden、カスタム props 受付の振る舞いを共有する。
 */
function describeFileTypeIcon(Icon: FC<IconProps>) {
  // when rendered with default props
  context("デフォルトの描画の場合", () => {
    // renders an <svg> element
    it("<svg> 要素をレンダリングすること", () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    // has aria-hidden attribute
    it("aria-hidden 属性を持つこと", () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    // has default width of 14
    it("デフォルトの幅が 14 であること", () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")?.getAttribute("width")).toBe("14");
    });

    // has default height of 14
    it("デフォルトの高さが 14 であること", () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")?.getAttribute("height")).toBe("14");
    });
  });

  // when custom props are passed
  context("カスタム props を指定した場合", () => {
    // accepts custom width
    it("カスタム width が反映されること", () => {
      const { container } = render(<Icon width={24} height={24} />);
      expect(container.querySelector("svg")?.getAttribute("width")).toBe("24");
    });

    // accepts custom height
    it("カスタム height が反映されること", () => {
      const { container } = render(<Icon width={24} height={24} />);
      expect(container.querySelector("svg")?.getAttribute("height")).toBe("24");
    });

    // passes className through
    it("className が SVG 要素に反映されること", () => {
      const { container } = render(<Icon className="custom" />);
      expect(container.querySelector("svg")).toHaveClass("custom");
    });

    // spreads arbitrary SVG attributes
    it("任意の SVG 属性がスプレッドされること", () => {
      const { container } = render(<Icon data-testid="icon" />);
      expect(container.querySelector("svg")).toHaveAttribute("data-testid", "icon");
    });
  });
}

// ─── 各アイコンの describe ────────────────────────────────

describe("TypeScriptIcon", () => {
  describeFileTypeIcon(TypeScriptIcon);
});

describe("TypeScriptReactIcon", () => {
  describeFileTypeIcon(TypeScriptReactIcon);
});

describe("JavaScriptIcon", () => {
  describeFileTypeIcon(JavaScriptIcon);
});

describe("JavaScriptReactIcon", () => {
  describeFileTypeIcon(JavaScriptReactIcon);
});

describe("CssIcon", () => {
  describeFileTypeIcon(CssIcon);
});

describe("HtmlIcon", () => {
  describeFileTypeIcon(HtmlIcon);
});

describe("JsonIcon", () => {
  describeFileTypeIcon(JsonIcon);
});

describe("MarkdownIcon", () => {
  describeFileTypeIcon(MarkdownIcon);
});

describe("YamlIcon", () => {
  describeFileTypeIcon(YamlIcon);
});

describe("PythonIcon", () => {
  describeFileTypeIcon(PythonIcon);
});

describe("GoIcon", () => {
  describeFileTypeIcon(GoIcon);
});

describe("RustIcon", () => {
  describeFileTypeIcon(RustIcon);
});

describe("JavaIcon", () => {
  describeFileTypeIcon(JavaIcon);
});

describe("CIcon", () => {
  describeFileTypeIcon(CIcon);
});

describe("CppIcon", () => {
  describeFileTypeIcon(CppIcon);
});

describe("CSharpIcon", () => {
  describeFileTypeIcon(CSharpIcon);
});

describe("RubyIcon", () => {
  describeFileTypeIcon(RubyIcon);
});

describe("PhpIcon", () => {
  describeFileTypeIcon(PhpIcon);
});

describe("SwiftIcon", () => {
  describeFileTypeIcon(SwiftIcon);
});

describe("KotlinIcon", () => {
  describeFileTypeIcon(KotlinIcon);
});

describe("DartIcon", () => {
  describeFileTypeIcon(DartIcon);
});

describe("ShellIcon", () => {
  describeFileTypeIcon(ShellIcon);
});

describe("DockerIcon", () => {
  describeFileTypeIcon(DockerIcon);
});

describe("SqlIcon", () => {
  describeFileTypeIcon(SqlIcon);
});

describe("GraphqlIcon", () => {
  describeFileTypeIcon(GraphqlIcon);
});

describe("VueIcon", () => {
  describeFileTypeIcon(VueIcon);
});

describe("SvelteIcon", () => {
  describeFileTypeIcon(SvelteIcon);
});

describe("XmlIcon", () => {
  describeFileTypeIcon(XmlIcon);
});

describe("TomlIcon", () => {
  describeFileTypeIcon(TomlIcon);
});

describe("ImageIcon", () => {
  describeFileTypeIcon(ImageIcon);
});

describe("LockFileIcon", () => {
  describeFileTypeIcon(LockFileIcon);
});

describe("EnvIcon", () => {
  describeFileTypeIcon(EnvIcon);
});

describe("GitIcon", () => {
  describeFileTypeIcon(GitIcon);
});

describe("LuaIcon", () => {
  describeFileTypeIcon(LuaIcon);
});

describe("RIcon", () => {
  describeFileTypeIcon(RIcon);
});

describe("ScalaIcon", () => {
  describeFileTypeIcon(ScalaIcon);
});

describe("ZigIcon", () => {
  describeFileTypeIcon(ZigIcon);
});

describe("ElixirIcon", () => {
  describeFileTypeIcon(ElixirIcon);
});

describe("HaskellIcon", () => {
  describeFileTypeIcon(HaskellIcon);
});

describe("PrismaIcon", () => {
  describeFileTypeIcon(PrismaIcon);
});

describe("TerraformIcon", () => {
  describeFileTypeIcon(TerraformIcon);
});

describe("PowershellIcon", () => {
  describeFileTypeIcon(PowershellIcon);
});

describe("HeaderIcon", () => {
  describeFileTypeIcon(HeaderIcon);
});

describe("PerlIcon", () => {
  describeFileTypeIcon(PerlIcon);
});

describe("ClojureIcon", () => {
  describeFileTypeIcon(ClojureIcon);
});

describe("ErlangIcon", () => {
  describeFileTypeIcon(ErlangIcon);
});

describe("LispIcon", () => {
  describeFileTypeIcon(LispIcon);
});

describe("NimIcon", () => {
  describeFileTypeIcon(NimIcon);
});

describe("WasmIcon", () => {
  describeFileTypeIcon(WasmIcon);
});

describe("ProtoIcon", () => {
  describeFileTypeIcon(ProtoIcon);
});

describe("BatchIcon", () => {
  describeFileTypeIcon(BatchIcon);
});

describe("LogIcon", () => {
  describeFileTypeIcon(LogIcon);
});

describe("CsvIcon", () => {
  describeFileTypeIcon(CsvIcon);
});

describe("PdfIcon", () => {
  describeFileTypeIcon(PdfIcon);
});

describe("RstIcon", () => {
  describeFileTypeIcon(RstIcon);
});

describe("TxtIcon", () => {
  describeFileTypeIcon(TxtIcon);
});

describe("IniIcon", () => {
  describeFileTypeIcon(IniIcon);
});

describe("MakefileIcon", () => {
  describeFileTypeIcon(MakefileIcon);
});

describe("DefaultFileIcon", () => {
  describeFileTypeIcon(DefaultFileIcon);
});

describe("FolderTypeIcon", () => {
  describeFileTypeIcon(FolderTypeIcon);
});
