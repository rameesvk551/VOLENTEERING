import { useReducer, useCallback } from 'react';
const reducer = (state, event) => {
    switch (state.status) {
        case 'idle': {
            if (event.type === 'LOCATE')
                return { status: 'locating' };
            if (event.type === 'OPTIMIZE')
                return { status: 'optimizing' };
            return state;
        }
        case 'locating': {
            if (event.type === 'LOCATE_SUCCESS')
                return { status: 'idle' };
            if (event.type === 'LOCATE_ERROR')
                return { status: 'error', message: event.message };
            if (event.type === 'OPTIMIZE')
                return { status: 'optimizing' };
            return state;
        }
        case 'optimizing': {
            if (event.type === 'OPTIMIZE_SUCCESS')
                return { status: 'ready' };
            if (event.type === 'OPTIMIZE_ERROR')
                return { status: 'error', message: event.message };
            return state;
        }
        case 'ready': {
            if (event.type === 'OPEN_SHEET')
                return { status: 'inspecting', seq: event.seq };
            if (event.type === 'OPTIMIZE')
                return { status: 'optimizing' };
            return state;
        }
        case 'inspecting': {
            if (event.type === 'CLOSE_SHEET')
                return { status: 'ready' };
            if (event.type === 'OPTIMIZE')
                return { status: 'optimizing' };
            return state;
        }
        case 'error': {
            if (event.type === 'OPTIMIZE')
                return { status: 'optimizing' };
            if (event.type === 'LOCATE')
                return { status: 'locating' };
            return state;
        }
        default:
            return state;
    }
};
export const useRouteExperienceMachine = () => {
    const [state, dispatch] = useReducer(reducer, { status: 'idle' });
    const send = useCallback((event) => {
        dispatch(event);
    }, []);
    return { state, send };
};
