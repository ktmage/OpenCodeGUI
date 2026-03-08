import type { SkillInfo } from "@opencodegui/core";
import { useLocale } from "../../../locales";
import { GearIcon } from "../../atoms/icons";
import { ListItem } from "../../atoms/ListItem";
import styles from "./SkillPopup.module.css";

type Props = {
  skills: SkillInfo[];
  onSelectSkill: (skill: SkillInfo) => void;
  skillPopupRef: React.RefObject<HTMLDivElement | null>;
  focusedIndex: number;
};

export function SkillPopup({ skills, onSelectSkill, skillPopupRef, focusedIndex }: Props) {
  const t = useLocale();

  return (
    <div className={styles.root} ref={skillPopupRef} data-testid="skill-popup">
      {skills.length > 0 ? (
        skills.map((skill, i) => (
          <ListItem
            key={skill.name}
            title={skill.name}
            description={skill.description}
            icon={<GearIcon width={14} height={14} />}
            onClick={() => onSelectSkill(skill)}
            focused={i === focusedIndex}
          />
        ))
      ) : (
        <div className={styles.empty}>{t["input.noSkills"]}</div>
      )}
    </div>
  );
}
