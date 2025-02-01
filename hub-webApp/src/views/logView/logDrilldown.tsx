import React, { useEffect, useState } from 'react';
import { LOGGING_SERVICE_ENDPOINT } from '../../config';
import axios from 'axios';
import { getLogger } from '../../logging';

const logger = getLogger("views/logView/logDrilldown");

interface LogDrilldownProps {
    logId: number | null;
}

const logDrilldownStyle: React.CSSProperties = {
    overflowY: "auto",
    flexGrow: 1,
}

const LogDrilldown: React.FC<LogDrilldownProps> = ({ logId }) => {
    const { data, loading, error } = useFetchLogData(logId);
    return (
        <div style={logDrilldownStyle}>
            <h1>Log Drilldown</h1>
            {loading ? <p>Loading...</p> :
                error ? <p>Error: {error}</p> :
                    data && <>
                        <p>Log ID: {logId}</p>
                        <p>Timestamp: {data?.timestamp}</p>
                        <p>Logger: {data?.logger}</p>
                        <p>Level: {data?.level}</p>
                        <p>Message: {data?.message}</p>
                        <p>Meta: </p>
                        <div>
                            <pre>{JSON.stringify(data?.meta, null, 2)}</pre>
                        </div>
                    </>}
        </div>
    )
}


const useFetchLogData = (logId: number | null) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (logId) {
            setLoading(true);
            const endpoint = `${LOGGING_SERVICE_ENDPOINT}/logs/${logId}`;
            axios.get(endpoint)
                .then((res) => {
                    if (res.statusText != "OK") {
                        throw new Error(
                            "Log request failed, status: " +
                            res.status +
                            " " +
                            res.statusText
                        );
                    }
                    return res.data;
                })
                .then((data) => {
                    setData(data);
                    logger.debugp("got log data", data);
                })
                .catch((err) => {
                    setError(err.message);
                    logger.errorp("error fetching log data", err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [logId])

    return { data, loading, error };
}

export default LogDrilldown;


