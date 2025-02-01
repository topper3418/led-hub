import { CSSProperties } from "react";
import { LogsApi } from "./logHooks";
import { formatDateString } from "../../util";

const tableWrapperStyle: CSSProperties = {
    overflowY: "auto",
    flexGrow: 1,
    maxWidth: "1000px",
    minWidth: "500px"
}

interface LogTableProps {
    logsApi: LogsApi;
    selectedLogId: number | null;
    setSelectedLogId?: (id: number | null) => void;
}

const LogTable: React.FC<LogTableProps> = ({ logsApi: { data, loading, error }, selectedLogId, setSelectedLogId }) => {
    const tableStyle: CSSProperties = {};
    if (loading) {
        tableStyle.borderColor = "yellow";
    }
    const toggleRowSelection = (logId: number) => {
        if (setSelectedLogId) {
            if (selectedLogId === logId) {
                setSelectedLogId(null);
            } else {
                setSelectedLogId(logId);
            }
        }
    }
    const getRowStyle = (logId: number): CSSProperties => {
        if (selectedLogId === logId) {
            return {
                backgroundColor: "#34ebc67a"
            }
        }
        return {};
    }
    return (
        <div style={tableWrapperStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th></th>
                        <th>Logger</th>
                        <th>level</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    {error ? (
                        <tr><td colSpan={4}>Error: {error}</td></tr>
                    ) : data && data.length > 0 ? (
                        data?.map((log) => (
                            <tr key={log.id} onClick={() => toggleRowSelection(log.id)} style={getRowStyle(log.id)}>
                                <td>{formatDateString(log.timestamp, false)}</td>
                                <td>{log.logger}</td>
                                <td>{log.level.toUpperCase()}</td>
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
