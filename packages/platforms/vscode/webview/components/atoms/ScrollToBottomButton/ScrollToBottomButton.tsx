import { IconButton } from "../IconButton";
import { ChevronDownIcon } from "../icons";
import styles from "./ScrollToBottomButton.module.css";

type Props = {
  visible: boolean;
  ariaLabel: string;
  onClick: () => void;
};

export function ScrollToBottomButton({ visible, ariaLabel, onClick }: Props) {
  return (
    <IconButton
      variant="outlined"
      className={[styles.root, visible && styles.visible].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      aria-hidden={!visible}
      title={ariaLabel}
      tabIndex={visible ? 0 : -1}
      onClick={onClick}
    >
      <ChevronDownIcon width={16} />
    </IconButton>
  );
}
