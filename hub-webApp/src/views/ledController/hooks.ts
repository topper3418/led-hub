import { Device } from "../../types";
import { getLogger } from "../../logging";
import { useFetch } from "../../hooks/useFetch";
import { usePost } from "../../hooks/usePost";
import { useDelete } from "../../hooks/useDelete";
import { useEffect } from "react";

const logger = getLogger('views/ledController/hooks');

export interface Color {
    r: number;
    g: number;
    b: number;
}

interface LedStripState {
    on: boolean;
    brightness: number;
    color: Color;
}

export const useLedStripHooks = (url: string) => {
    const { state: fetchState, api: fetchApi } = useFetch<Device>(url);
    const { state: updateState, api: updateApi } = usePost<Device>(url);
    const { state: deleteState, api: deleteApi } = useDelete<Device>(url);
    const update = (newState: Partial<LedStripState>) => {
        logger.infop('updating state: ', newState);
        updateApi.post({ data: newState });
    }
    // function to delete the strip
    const destroy = () => {
        logger.infop('deleting device')
        deleteApi.del({});
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
