import { useFetch } from "../../hooks/useFetch";
import { LedStrip, Room } from "../../types";

import { getLogger } from "../../logging";
import { useEffect } from "react";
import { BACKEND_ROOT_URL } from "../../config";
import { usePost } from "../../hooks/usePost";
import { usePut } from "../../hooks/usePut";

const logger = getLogger('views/rooms/hooks');


export const useRoomHooks = () => {
    const url = BACKEND_ROOT_URL + "rooms";
    const { state: roomsState, api: roomsApi } = useFetch<Room[]>(url, undefined, "rooms");
    const { state: miscRoomState, api: miscRoomApi } = useFetch<Room>(url + "/0", undefined, "devices")
    useEffect(() => {
        if (roomsState.loading) return;
        if (roomsState.data) {
            logger.debug('got room data:', roomsState.data);
        }
        if (roomsState.error) {
            logger.error("error fetching all led strips", { error: roomsState.error });
        }
        const interval = setInterval(() => {
            roomsApi.refetch();
        }, 500);
        return () => clearInterval(interval);
    }, [roomsState.loading]);
    useEffect(() => {
        if (miscRoomState.loading) return;
        if (miscRoomState.data) {
            logger.debug('got misc data:', miscRoomState.data);
        }
        if (miscRoomState.error) {
            logger.error("error fetching all led strips", { error: miscRoomState.error });
        }
        const interval = setInterval(() => {
            miscRoomApi.refetch();
        }, 500);
        return () => clearInterval(interval);
    }, [miscRoomState.loading])
    const refetch = () => {
        roomsApi.refetch();
        miscRoomApi.refetch();
    }
    return { rooms: roomsState, miscRoom: miscRoomState, api: { refetch } };
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



