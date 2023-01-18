import { useCallback, useEffect, useState, RefObject } from "react";
import { UseFocusableConfig, UseFocusableResult, useFocusable } from "./useFocusable"

export interface UseNavigatableResult extends UseFocusableResult, UseHoverableResult, UseClickableResult {}
interface UseHoverableResult { hovered: boolean }
interface UseClickableResult {}

export interface UseNavigatableConfig extends UseFocusableConfig, UseHoverableConfig, UseClickableConfig {}
interface UseHoverableConfig { hoverable?: boolean }
interface UseClickableConfig { clickable?: boolean, requireFocus?: boolean }

const useHoverable = (ref: RefObject<any>, { hoverable = true }: UseHoverableConfig = {}): UseHoverableResult => {
  const [hovered, setHovered] = useState(false);
  const handleMouseOver = () => setHovered(true);
  const handleMouseOut = () => setHovered(false);

  useEffect(
    () => {
      const node = ref.current;
      if (hoverable && node) {
        node.addEventListener('mouseover', handleMouseOver);
        node.addEventListener('mouseout', handleMouseOut);
        return () => {
          node.removeEventListener('mouseover', handleMouseOver);
          node.removeEventListener('mouseout', handleMouseOut);
        };
      }
      return () => {}
    },
    [ref, hoverable]
  );
    
  return {
    hovered
  };
}

const useClickable = (ref: RefObject<any>, { clickable = true }: UseClickableConfig = {}, callback?: () => void): UseClickableResult => {
  useEffect(
    () => {
      const node = ref.current;
      if (clickable && node && callback) {
        node.addEventListener('click', callback);
        return () => {
          node.removeEventListener('click', callback);
        };
      }
      return () => {}
    }, [ref, clickable, callback]);
  
  return {};
}

const useNavigatableHook = (config: UseNavigatableConfig = {}): UseNavigatableResult => {
  const focusable = useFocusable(config);
  const { onEnterPress, extraProps, requireFocus = false } = config;
  const { ref, focused, focusSelf: elementFocus } = focusable;

  const elementAction = useCallback(() => {
    onEnterPress(extraProps, { pressedKeys: {}})
  }, [onEnterPress, extraProps])

  const clickedCallback = useCallback(() => {
    if (!requireFocus) {
      elementFocus()
      elementAction()
      return
    }

    if (focused) {
      elementAction();
    } else {
      elementFocus();
    }
  }, [focused, requireFocus, elementAction, elementFocus]);

  const hoverable = useHoverable(ref, config);
  const clickable = useClickable(ref, config, clickedCallback);

  return {
    ...focusable, ...hoverable, ...clickable
  };
}

export const useNavigatableParent = useFocusable
export const useNavigatableChild = useNavigatableHook