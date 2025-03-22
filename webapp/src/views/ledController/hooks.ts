import { Device, LedStrip } from "../../types";
import { getLogger } from "../../logging";
import { useFetch } from "../../hooks/useFetch";
import { useDelete } from "../../hooks/useDelete";
import { useEffect } from "react";
import { BACKEND_ROOT_URL } from "../../config";
import { usePut } from "../../hooks/usePut";
import { NavigateFunction } from "react-router-dom";

const logger = getLogger('views/ledController/hooks');

export const useLedStripHooks = (deviceId: number, navigate: NavigateFunction) => {
    const url = BACKEND_ROOT_URL + "devices/" + deviceId;
    const { state: fetchState, api: fetchApi } = useFetch<Device>(url, undefined, 'device');
    const { state: updateState, api: updateApi } = usePut<LedStrip, { led_strip: LedStrip }>(url + '/led_strip');
    const { state: deleteState, api: deleteApi } = useDelete<LedStrip>(url);
    const update = (newState: Partial<LedStrip>) => {
        logger.infop('updating state: ', newState);
        updateApi.put({ data: { ...newState } });
    }
    // function to delete the strip
    const destroy = () => {
        logger.infop('deleting device')
        deleteApi.del({});
        navigate('/');
    }
    useEffect(() => {
        if (updateState.loading) return;
        if (updateState.data) {
            logger.debug('got data from update:', updateState.data);
        }
        if (updateState.error) {
            logger.errorp(updateState.error);
        }
    }, [updateState.loading])
    useEffect(() => {
        if (deleteState.loading) return;
        if (deleteState.data) {
            logger.debug('got data from delete:', deleteState.data);
        }
        if (deleteState.error) {
            logger.errorp(deleteState.error);
        }
    }, [deleteState.loading])
    useEffect(() => {
        if (fetchState.loading) return;
        if (fetchState.data) {
            logger.debug('got data from fetch:', fetchState.data);
        }
        if (fetchState.error) {
            logger.errorp(fetchState.error);
        }
        const interval = setInterval(() => {
            fetchApi.refetch();
        }, 500);
        return () => clearInterval(interval);
    }, [fetchState.loading])
    return {
        fetchState, updateState, deleteState,
        api: {
            refetch: fetchApi.refetch,
            update,
            delete: destroy
        }
    }
}
