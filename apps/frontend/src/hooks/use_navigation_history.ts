import { useEffect, useReducer, useRef } from "react";

import { useLocation, useNavigate } from "react-router";

interface HistoryState {
  readonly stack: readonly string[];
  readonly currentIndex: number;
}

type HistoryAction =
  | { readonly type: "NAVIGATE"; readonly path: string }
  | { readonly type: "GO_BACK" }
  | { readonly type: "GO_FORWARD" };

function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "NAVIGATE": {
      if (state.stack.length === 0) {
        return {
          stack: [action.path],
          currentIndex: 0,
        };
      }

      if (state.stack[state.currentIndex] === action.path) {
        return state;
      }

      const newStack = state.stack.slice(0, state.currentIndex + 1);
      return {
        stack: [...newStack, action.path],
        currentIndex: newStack.length,
      };
    }
    case "GO_BACK": {
      if (state.currentIndex > 0) {
        return {
          ...state,
          currentIndex: state.currentIndex - 1,
        };
      }
      return state;
    }
    case "GO_FORWARD": {
      if (state.currentIndex < state.stack.length - 1) {
        return {
          ...state,
          currentIndex: state.currentIndex + 1,
        };
      }
      return state;
    }
    default:
      return state;
  }
}

export interface NavigationHistoryState {
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
  readonly goBack: () => void;
  readonly goForward: () => void;
}

/**
 * Hook to manage browser history navigation with back/forward support.
 *
 * Tracks visited paths and provides navigation methods with disabled states.
 * Uses react-router's navigation and location APIs to synchronize with browser history.
 *
 * @returns Navigation state and handlers
 */
export function useNavigationHistory(): NavigationHistoryState {
  const navigate = useNavigate();
  const location = useLocation();

  const [historyState, dispatch] = useReducer(historyReducer, {
    stack: [],
    currentIndex: -1,
  });

  const isNavigatingRef = useRef(false);

  useEffect(() => {
    if (!isNavigatingRef.current) {
      const currentPath = location.pathname + location.search + location.hash;
      dispatch({ type: "NAVIGATE", path: currentPath });
    }
    isNavigatingRef.current = false;
  }, [location]);

  const canGoBack = historyState.currentIndex > 0;
  const canGoForward =
    historyState.currentIndex < historyState.stack.length - 1;

  const goBack = () => {
    if (canGoBack) {
      isNavigatingRef.current = true;
      dispatch({ type: "GO_BACK" });
      void navigate(-1);
    }
  };

  const goForward = () => {
    if (canGoForward) {
      isNavigatingRef.current = true;
      dispatch({ type: "GO_FORWARD" });
      void navigate(1);
    }
  };

  return {
    canGoBack,
    canGoForward,
    goBack,
    goForward,
  };
}
