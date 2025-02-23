import { useEffect } from "react";
import { getLogger } from "../../logging";
import { Device, LedStrip } from "../../types";
import { BACKEND_ROOT_URL } from "../../config";
import { useFetch } from "../../hooks/useFetch";
import { usePost } from "../../hooks/usePost";
import { usePut } from "../../hooks/usePut";

const logger = getLogger('views/devices/hooks');

export const useAllLedStrips = () => {
    const url = BACKEND_ROOT_URL + "led_strips"
    const { state, api } = useFetch<Device[]>(url, undefined, "devices");
    logger.debug(`rendering led strip hook for url ${url}`)
    useEffect(() => {
        if (state.loading) return;
        if (state.data) {
            logger.debug('got data:', state.data);
        }
        if (state.error) {
            logger.error("error fetching all led strips", { error: state.error });
        }
        const interval = setInterval(() => {
            api.refetch();
        }, 5000);
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

export const useToggleLedStrip = (deviceId: number) => {
    return usePut<LedStrip>(BACKEND_ROOT_URL + 'devices/' + deviceId + '/led_strip');
}
