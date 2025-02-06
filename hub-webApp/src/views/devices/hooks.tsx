import { useEffect } from "react";
import { getLogger } from "../../logging";
import { Device } from "../../types";
import { BACKEND_ROOT_URL } from "../../config";
import { useFetch } from "../../hooks/useFetch";
import { usePost } from "../../hooks/usePost";
const logger = getLogger('views/devices/hooks');

export const useAllLedStrips = () => {
    const { state, api } = useFetch<Device[]>(BACKEND_ROOT_URL);
    useEffect(() => {
        if (state.loading) return;
        if (state.data) {
            logger.debug('got data:', state.data);
        }
        if (state.error) {
            logger.errorp(state.error);
        }
        const interval = setInterval(() => {
            api.refetch();
        }, 500);
        return () => clearInterval(interval);
    }, [state.loading]);
    return { state, api };
}

export const useSetAll = () => {
    const { state, api } = usePost<Device[]>(BACKEND_ROOT_URL + 'all');
    const setAll = (newState: boolean) => {
        api.post({ data: { on: newState } });
    }
    return { state, api: { setAll } };
}

export const useToggleLedStrip = (name: string) => {
    return usePost<Device>(BACKEND_ROOT_URL + name);
}
