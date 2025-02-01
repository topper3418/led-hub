import { CSSProperties } from "react";
import { LogsApi } from "./logHooks";
import { formatDateString } from "../../util";

const LogTable: React.FC<{ logsApi: LogsApi }> = ({ logsApi: { data, loading, error } }) => {
    const tableWrapperStyle = {
        flex: "0 0 800px",
        overflowY: "auto",
    } as CSSProperties;

    return (
        <div className="column flex" style={tableWrapperStyle}>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Logger</th>
                        <th>level</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={4}>Loading...</td></tr>
                    ) : error ? (
                        <tr><td colSpan={4}>Error: {error}</td></tr>
                    ) : data && data.length > 0 ? (
                        data?.map((log) => (
                            <tr key={log.id}>
                                <td>{formatDateString(log.timestamp, false)}</td>
                                <td>{log.logger}</td>
                                <td>{log.level}</td>
                                <td>{log.message}</td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={4}>No logs to display</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default LogTable;
