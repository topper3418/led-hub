import { useFetch } from "../../hooks/useFetch";
import { Room } from "../../types";

import { getLogger } from "../../logging";

const logger = getLogger('views/rooms/hooks');

export const useAllRooms = () => {
    const url = BACKEND_ROOT_URL
    const { state, api } = useFetch<Room[]>(url, undefined, "rooms");
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
        }, 500);
        return () => clearInterval(interval);
    }, [state.loading]);
    return { state, api };
}



