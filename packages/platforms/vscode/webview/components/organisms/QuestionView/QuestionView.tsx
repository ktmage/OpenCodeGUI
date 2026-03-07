import type { QuestionAnswer, QuestionRequest } from "@opencodegui/core";
import { useCallback, useState } from "react";
import { useLocale } from "../../../locales";
import { postMessage } from "../../../vscode-api";
import { ActionButton } from "../../atoms/ActionButton";
import styles from "./QuestionView.module.css";

type Props = {
  question: QuestionRequest;
};

export function QuestionView({ question }: Props) {
  const t = useLocale();
  // 各質問に対する選択状態を管理する。answers[i] は i 番目の質問の選択されたラベル配列
  const [answers, setAnswers] = useState<QuestionAnswer[]>(() => question.questions.map(() => []));
  // カスタムテキスト入力の値を管理
  const [customTexts, setCustomTexts] = useState<string[]>(() => question.questions.map(() => ""));

  const toggleOption = useCallback((questionIndex: number, label: string, multiple: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      const current = next[questionIndex];
      if (multiple) {
        // 複数選択: トグル
        next[questionIndex] = current.includes(label) ? current.filter((l) => l !== label) : [...current, label];
      } else {
        // 単一選択: 排他切り替え
        next[questionIndex] = current.includes(label) ? [] : [label];
      }
      return next;
    });
  }, []);

  const handleCustomTextChange = useCallback((questionIndex: number, value: string) => {
    setCustomTexts((prev) => {
      const next = [...prev];
      next[questionIndex] = value;
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // カスタムテキストが入力されている場合、回答に追加する
    const finalAnswers = answers.map((answer, i) => {
      const customText = customTexts[i].trim();
      if (customText && !answer.includes(customText)) {
        return [...answer, customText];
      }
      return answer;
    });
    postMessage({
      type: "replyQuestion",
      requestId: question.id,
      answers: finalAnswers,
    });
  }, [answers, customTexts, question.id]);

  const handleReject = useCallback(() => {
    postMessage({
      type: "rejectQuestion",
      requestId: question.id,
    });
  }, [question.id]);

  return (
    <div className={styles.root}>
      {question.questions.map((q, i) => {
        // custom はデフォルト true
        const allowCustom = q.custom !== false;
        return (
          <div key={i} className={styles.questionCard}>
            <div className={styles.header}>{q.header}</div>
            <div className={styles.questionText}>{q.question}</div>
            <div className={styles.options}>
              {q.options.map((opt) => {
                const selected = answers[i].includes(opt.label);
                return (
                  <button
                    key={opt.label}
                    type="button"
                    className={`${styles.option} ${selected ? styles.selected : ""}`}
                    onClick={() => toggleOption(i, opt.label, !!q.multiple)}
                  >
                    <span className={styles.optionLabel}>{opt.label}</span>
                    {opt.description && <span className={styles.optionDesc}>{opt.description}</span>}
                  </button>
                );
              })}
            </div>
            {allowCustom && (
              <input
                type="text"
                className={styles.customInput}
                placeholder={t["question.customPlaceholder"]}
                value={customTexts[i]}
                onChange={(e) => handleCustomTextChange(i, e.target.value)}
              />
            )}
          </div>
        );
      })}
      <div className={styles.actions}>
        <ActionButton onClick={handleSubmit}>{t["question.submit"]}</ActionButton>
        <ActionButton variant="secondary" onClick={handleReject}>
          {t["question.reject"]}
        </ActionButton>
      </div>
    </div>
  );
}
