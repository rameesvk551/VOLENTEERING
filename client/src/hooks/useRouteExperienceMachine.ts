import { useReducer, useCallback } from 'react';

type RouteMachineState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'optimizing' }
  | { status: 'ready' }
  | { status: 'inspecting'; seq: number | null }
  | { status: 'error'; message: string };

type RouteMachineEvent =
  | { type: 'LOCATE' }
  | { type: 'LOCATE_SUCCESS' }
  | { type: 'LOCATE_ERROR'; message: string }
  | { type: 'OPTIMIZE' }
  | { type: 'OPTIMIZE_SUCCESS' }
  | { type: 'OPTIMIZE_ERROR'; message: string }
  | { type: 'OPEN_SHEET'; seq: number }
  | { type: 'CLOSE_SHEET' };

const reducer = (state: RouteMachineState, event: RouteMachineEvent): RouteMachineState => {
  switch (state.status) {
    case 'idle': {
      if (event.type === 'LOCATE') return { status: 'locating' };
      if (event.type === 'OPTIMIZE') return { status: 'optimizing' };
      return state;
    }
    case 'locating': {
      if (event.type === 'LOCATE_SUCCESS') return { status: 'idle' };
      if (event.type === 'LOCATE_ERROR') return { status: 'error', message: event.message };
      if (event.type === 'OPTIMIZE') return { status: 'optimizing' };
      return state;
    }
    case 'optimizing': {
      if (event.type === 'OPTIMIZE_SUCCESS') return { status: 'ready' };
      if (event.type === 'OPTIMIZE_ERROR') return { status: 'error', message: event.message };
      return state;
    }
    case 'ready': {
      if (event.type === 'OPEN_SHEET') return { status: 'inspecting', seq: event.seq };
      if (event.type === 'OPTIMIZE') return { status: 'optimizing' };
      return state;
    }
    case 'inspecting': {
      if (event.type === 'CLOSE_SHEET') return { status: 'ready' };
      if (event.type === 'OPTIMIZE') return { status: 'optimizing' };
      return state;
    }
    case 'error': {
      if (event.type === 'OPTIMIZE') return { status: 'optimizing' };
      if (event.type === 'LOCATE') return { status: 'locating' };
      return state;
    }
    default:
      return state;
  }
};

export const useRouteExperienceMachine = () => {
  const [state, dispatch] = useReducer(reducer, { status: 'idle' } as RouteMachineState);

  const send = useCallback((event: RouteMachineEvent) => {
    dispatch(event);
  }, []);

  return { state, send };
};
