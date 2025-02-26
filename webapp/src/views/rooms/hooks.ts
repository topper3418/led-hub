import { useFetch } from "../../hooks/useFetch";
import { LedStrip, Room } from "../../types";

import { getLogger } from "../../logging";
import { useEffect } from "react";
import { BACKEND_ROOT_URL } from "../../config";
import { usePost } from "../../hooks/usePost";
import { usePut } from "../../hooks/usePut";

const logger = getLogger('views/rooms/hooks');


export const useAllRooms = () => {
    const url = BACKEND_ROOT_URL + "rooms";
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
    return { rooms: state, api };
}


export const useGetRoom = (roomId: number) => {
    const url = BACKEND_ROOT_URL + "rooms/" + roomId
    return useFetch<Room>(url)
}


export const useAddRoom = () => {
    const url = BACKEND_ROOT_URL + "rooms";
    const { state, api } = usePost<Room>(url);
    const addRoom = (room: Room) => {
        api.post({ data: room });
    }
    const addGenericRoom = () => {
        api.post({ data: {} })
    }
    return { state, addRoom, addGenericRoom };
}

export const useWriteToRoom = (roomId: number) => {
    const url = BACKEND_ROOT_URL + "rooms/" + roomId + "/led_strips"
    const { state, api } = usePut<LedStrip, { data: LedStrip }>(url);
    return { state, setRoom: api.put }
}



