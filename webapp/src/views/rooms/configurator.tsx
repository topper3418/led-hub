import React, { CSSProperties, useEffect } from 'react';
import Banner from '../../components/banner';
import { useNavigate, useParams } from 'react-router-dom';
import { Device, LedStrip, Room } from '../../types';
import { usePut } from '../../hooks/usePut';
import { useDelete } from '../../hooks/useDelete';
import { useFetch } from '../../hooks/useFetch';
import { BACKEND_ROOT_URL } from '../../config';


const RoomConfigurator: React.FC = () => {
    const roomId = Number(useParams<{ roomId: string }>().roomId)
    const url = BACKEND_ROOT_URL + "rooms/" + roomId;
    const [name, setName] = React.useState<string>("");
    const navigate = useNavigate();

    const { state: fetchState } = useFetch<Room>(url, undefined, 'room');
    const { api: deleteApi } = useDelete<Room>(url);
    const { api: updateApi } = usePut<Device, { device: LedStrip }>(url);

    const title = `Configure ${fetchState.data?.name || 'Unnamed Room'}`;

    useEffect(() => {
        if (fetchState.loading) return;
        if (fetchState.data) {
            setName(fetchState.data.name);
        }
    }, [fetchState.loading])


    const deviceData = {
        ...fetchState.data,
        name
    } as Device;

    const save = () => {
        updateApi.put({ data: deviceData });
        navigate(`/${roomId}`);
    }

    const destroy = () => {
        deleteApi.del({});
        navigate('/');
    }

    return (
        <div className="p-10 flex flex-col h-full w-full gap-2 bg-slate-900" >
            <Banner title={title} loading={fetchState.loading} >
                <button
                    onClick={() => navigate("/" + roomId)}
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
                        placeholder="Room name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-slate-800 text-slate-100 p-3 rounded-md" />
                </div>
                <button
                    onClick={save}
                    className="bg-slate-800 text-slate-100 p-3 rounded-md">
                    Save
                </button>
            </div>
        </div>
    )
}

export default RoomConfigurator;
