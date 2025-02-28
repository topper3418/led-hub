import React, { CSSProperties, useEffect } from 'react';
import Banner from '../../components/banner';
import { useNavigate, useParams } from 'react-router-dom';
import { useLedStripHooks } from './hooks';
import { getDeviceIdentifier } from '../../util';
import { Device, LedStrip, Room } from '../../types';
import { usePut } from '../../hooks/usePut';
import { useDelete } from '../../hooks/useDelete';
import { useFetch } from '../../hooks/useFetch';
import { BACKEND_ROOT_URL } from '../../config';


const DeviceConfigurator: React.FC = () => {
    const deviceId = Number(useParams<{ deviceId: string }>().deviceId)
    const url = BACKEND_ROOT_URL + "devices/" + deviceId;
    const [name, setName] = React.useState<string>("");
    const [roomId, setRoomId] = React.useState<number>(0);
    const [numLeds, setNumLeds] = React.useState<number>(0);
    const [ledPin, setLedPin] = React.useState<number>(16);
    const navigate = useNavigate();

    const { state: fetchState, api: fetchApi } = useFetch<Device>(url, undefined, 'device');
    const { state: roomsState, api: roomsApi } = useFetch<Room[]>(BACKEND_ROOT_URL + 'rooms', undefined, 'rooms');
    const { state: deleteState, api: deleteApi } = useDelete<LedStrip>(url);
    const { state: updateState, api: updateApi } = usePut<Device, { device: LedStrip }>(url);

    const deviceName = getDeviceIdentifier(fetchState.data || {} as Device)
    const title = `Configure ${deviceName}`

    useEffect(() => {
        if (fetchState.loading) return;
        if (fetchState.data) {
            setName(fetchState.data.name || "");
            setRoomId(fetchState.data.room_id || 0);
            setNumLeds(fetchState.data.led_strip?.num_leds || 0);
            setLedPin(fetchState.data.led_strip?.led_pin || 16);
        }
    }, [fetchState.loading])

    const deviceData = {
        ...fetchState.data,
        name,
        room_id: roomId,
        num_leds: numLeds,
        led_pin: ledPin
    } as Device;

    const save = () => {
        updateApi.put({ data: deviceData });
        navigate(`/${deviceData?.room_id || 0}/devices/${deviceId}`);
    }

    const destroy = () => {
        deleteApi.del({});
        navigate('/');
    }

    return (
        <div className="p-10 flex flex-col h-full w-full gap-2 bg-slate-900" >
            <Banner title={title} loading={fetchState.loading} >
                <button
                    onClick={() => navigate("/" + (fetchState.data?.room_id) + "/devices/" + deviceId)}
                    className="bg-slate-800 text-slate-100 p-3 rounded-md">
                    Back
                </button>
                <button
                    onClick={destroy}
                    className="bg-red-800 text-slate-100 p-3 rounded-md h-12">
                    <span className="text-3xl leading-none relative" style={{
                        lineHeight: 0,
                        top: "6px"
                    } as CSSProperties}>
                        &#x1F5D1;
                    </span>
                </button>
            </Banner>
            <div className='flex flex-col justify-between h-full'>
                <div className='flex flex-col gap-2'>
                    <input
                        type="text"
                        placeholder="Device name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-800 text-slate-100 p-3 rounded-md" />
                    <select
                        className='bg-slate-800 text-slate-100 p-3 h-12 rounded-md'
                        style={{ appearance: 'none' }}
                        value={roomId}
                        onChange={(e) => {
                            setRoomId(Number(e.target.value));
                        }} >
                        <option value={0}>Select a room &#x25BC;</option>
                        {roomsState.data !== undefined && roomsState.data?.map((room: Room) => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        placeholder="Num LEDs"
                        value={numLeds}
                        onChange={(e) => setNumLeds(Number(e.target.value))}
                        className="bg-slate-800 text-slate-100 p-3 rounded-md" />
                    <input
                        type="number"
                        placeholder="LED Pin"
                        value={ledPin}
                        onChange={(e) => setLedPin(Number(e.target.value))}
                        className="bg-slate-800 text-slate-100 p-3 rounded-md" />
                </div>
                <button
                    onClick={save}
                    className="bg-slate-800 text-slate-100 p-3 rounded-md">
                    Save
                </button>
            </div>
        </div >
    )
}

export default DeviceConfigurator;
