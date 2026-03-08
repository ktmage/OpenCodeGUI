import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SkillPopup } from "../../../components/molecules/SkillPopup";

function createSkill(name: string, description?: string) {
  return {
    name,
    description,
    location: `/skills/${name}`,
  };
}

describe("SkillPopup", () => {
  context("スキル一覧がある場合", () => {
    const skills = [createSkill("coding-guidelines", "Coding skill"), createSkill("manage-task-plan", "Task plan")];

    it("スキル名を表示すること", () => {
      const { container } = render(
        <SkillPopup skills={skills} onSelectSkill={vi.fn()} skillPopupRef={{ current: null }} focusedIndex={-1} />,
      );
      const titles = container.querySelectorAll(".title");
      expect(titles[0]?.textContent).toBe("coding-guidelines");
      expect(titles[1]?.textContent).toBe("manage-task-plan");
    });

    it("クリックで onSelectSkill を呼ぶこと", async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <SkillPopup skills={skills} onSelectSkill={onSelect} skillPopupRef={{ current: null }} focusedIndex={-1} />,
      );
      const items = container.querySelectorAll(".root > div");
      await user.click(items[0]!);
      expect(onSelect).toHaveBeenCalledWith(skills[0]);
    });
  });

  context("focusedIndex が指定された場合", () => {
    const skills = [createSkill("coding-guidelines", "Coding skill"), createSkill("manage-task-plan", "Task plan")];

    it("対応するアイテムに data-focused 属性が付与されること", () => {
      const { container } = render(
        <SkillPopup skills={skills} onSelectSkill={vi.fn()} skillPopupRef={{ current: null }} focusedIndex={1} />,
      );
      const items = container.querySelectorAll("[data-focused]");
      expect(items).toHaveLength(1);
      expect(items[0]?.getAttribute("data-focused")).toBe("true");
    });
  });
});
