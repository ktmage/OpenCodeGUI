import { describe, expect, it } from "vitest";
import { CATEGORY_LABEL_KEYS, TOOL_CATEGORIES, type ToolCategory, getCategory } from "../../utils/tool-categories";

describe("TOOL_CATEGORIES", () => {
  it("全エントリが有効な ToolCategory 値を持つこと", () => {
    const validCategories: ToolCategory[] = ["read", "edit", "write", "run", "search", "other"];
    for (const value of Object.values(TOOL_CATEGORIES)) {
      expect(validCategories).toContain(value);
    }
  });
});

describe("CATEGORY_LABEL_KEYS", () => {
  it("全 ToolCategory に対応するラベルキーを持つこと", () => {
    const categories: ToolCategory[] = ["read", "edit", "write", "run", "search", "other"];
    for (const cat of categories) {
      expect(CATEGORY_LABEL_KEYS[cat]).toBeDefined();
    }
  });
});

describe("getCategory", () => {
  // when tool name exactly matches
  context("ツール名が完全一致する場合", () => {
    it("対応するカテゴリを返すこと", () => {
      expect(getCategory("read")).toBe("read");
    });

    it("bash は run を返すこと", () => {
      expect(getCategory("bash")).toBe("run");
    });

    it("grep は search を返すこと", () => {
      expect(getCategory("grep")).toBe("search");
    });

    it("write は write を返すこと", () => {
      expect(getCategory("write")).toBe("write");
    });
  });

  // when tool name has a prefix (MCP tools)
  context("プレフィクス付きのツール名の場合", () => {
    it("アンダースコア区切りの末尾でマッチすること", () => {
      expect(getCategory("mcp_read")).toBe("read");
    });

    it("スラッシュ区切りの末尾でマッチすること", () => {
      expect(getCategory("server/bash")).toBe("run");
    });
  });

  // when tool name is unknown
  context("未知のツール名の場合", () => {
    it("other を返すこと", () => {
      expect(getCategory("unknown_tool_xyz")).toBe("other");
    });
  });
});
