import { act, renderHook } from "@testing-library/react";
import { type RefObject, createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useClickOutside } from "../../hooks/useClickOutside";

/** mousedown イベントを指定ターゲットで発火するヘルパー */
function fireMousedown(target: EventTarget) {
  const event = new MouseEvent("mousedown", { bubbles: true });
  Object.defineProperty(event, "target", { value: target });
  document.dispatchEvent(event);
}

/** ダミー DOM 要素を作成し、contains を制御できるようにする */
function createMockElement(containsTarget: boolean): Element {
  const el = document.createElement("div");
  vi.spyOn(el, "contains").mockReturnValue(containsTarget);
  return el;
}

describe("useClickOutside", () => {
  // single ref — click outside fires callback
  context("単一 ref で外側をクリックした場合", () => {
    // fires callback on outside click
    it("コールバックが呼ばれること", () => {
      const callback = vi.fn();
      const ref = createRef<Element>() as RefObject<Element | null>;
      (ref as { current: Element }).current = createMockElement(false);

      renderHook(() => useClickOutside(ref, callback));
      act(() => fireMousedown(document.body));

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // single ref — click inside does not fire callback
  context("単一 ref で内側をクリックした場合", () => {
    // does not fire callback on inside click
    it("コールバックが呼ばれないこと", () => {
      const callback = vi.fn();
      const ref = createRef<Element>() as RefObject<Element | null>;
      (ref as { current: Element }).current = createMockElement(true);

      renderHook(() => useClickOutside(ref, callback));
      act(() => fireMousedown(document.body));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // enabled = false — does not fire callback
  context("enabled が false の場合", () => {
    // does not register listener when disabled
    it("コールバックが呼ばれないこと", () => {
      const callback = vi.fn();
      const ref = createRef<Element>() as RefObject<Element | null>;
      (ref as { current: Element }).current = createMockElement(false);

      renderHook(() => useClickOutside(ref, callback, false));
      act(() => fireMousedown(document.body));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // enabled toggles — registers and unregisters listener
  context("enabled が true から false に変わった場合", () => {
    // unregisters listener when disabled
    it("リスナーが解除されコールバックが呼ばれないこと", () => {
      const callback = vi.fn();
      const ref = createRef<Element>() as RefObject<Element | null>;
      (ref as { current: Element }).current = createMockElement(false);

      const { rerender } = renderHook(({ enabled }) => useClickOutside(ref, callback, enabled), {
        initialProps: { enabled: true },
      });

      // 有効時: 外部クリックで発火
      act(() => fireMousedown(document.body));
      expect(callback).toHaveBeenCalledTimes(1);

      // 無効に切り替え
      rerender({ enabled: false });
      act(() => fireMousedown(document.body));

      // 追加で呼ばれていないこと
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // multiple refs — click outside all refs fires callback
  context("複数 ref で全要素の外側をクリックした場合", () => {
    // fires callback when outside all refs
    it("コールバックが呼ばれること", () => {
      const callback = vi.fn();
      const ref1 = createRef<Element>() as RefObject<Element | null>;
      const ref2 = createRef<Element>() as RefObject<Element | null>;
      (ref1 as { current: Element }).current = createMockElement(false);
      (ref2 as { current: Element }).current = createMockElement(false);

      renderHook(() => useClickOutside([ref1, ref2], callback));
      act(() => fireMousedown(document.body));

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // multiple refs — click inside one ref does not fire callback
  context("複数 ref でいずれかの要素の内側をクリックした場合", () => {
    // does not fire callback when inside one of the refs
    it("コールバックが呼ばれないこと", () => {
      const callback = vi.fn();
      const ref1 = createRef<Element>() as RefObject<Element | null>;
      const ref2 = createRef<Element>() as RefObject<Element | null>;
      (ref1 as { current: Element }).current = createMockElement(false);
      (ref2 as { current: Element }).current = createMockElement(true); // inside ref2

      renderHook(() => useClickOutside([ref1, ref2], callback));
      act(() => fireMousedown(document.body));

      expect(callback).not.toHaveBeenCalled();
    });
  });

  // ref.current is null — fires callback (element not mounted)
  context("ref.current が null の場合", () => {
    // treats null ref as outside
    it("コールバックが呼ばれること", () => {
      const callback = vi.fn();
      const ref = createRef<Element>() as RefObject<Element | null>;
      // ref.current is null by default

      renderHook(() => useClickOutside(ref, callback));
      act(() => fireMousedown(document.body));

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // callback update is picked up without re-subscribing
  context("コールバックが更新された場合", () => {
    // uses the latest callback
    it("最新のコールバックが呼ばれること", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const ref = createRef<Element>() as RefObject<Element | null>;
      (ref as { current: Element }).current = createMockElement(false);

      const { rerender } = renderHook(({ cb }) => useClickOutside(ref, cb), {
        initialProps: { cb: callback1 },
      });

      rerender({ cb: callback2 });
      act(() => fireMousedown(document.body));

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });
});
