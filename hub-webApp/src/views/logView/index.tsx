import React, { CSSProperties, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useFetchLogs, useFilters } from "./logHooks";
import Banner from "../../components/banner";
import Filters from "./filters";
import LogTable from "./logTable";
import { useFetchLoggers } from "./loggerHooks";
import LoggerTable from "./loggerTable";
import LogDrilldown from "./logDrilldown";

const wrapperStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: "10px",
    height: "100%",
    margin: "0",
    padding: "10px",
    flexGrow: 1,
    overflow: "hidden",
    alignItems: "stretch",
}

const contentRowStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    margin: "0",
    flexGrow: 1,
    overflow: "hidden",
    justifyContent: "flex-start",
}

const LogView: React.FC = () => {
    const navigate = useNavigate();
    const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
    const logFilters = useFilters();

    const logs = useFetchLogs(logFilters.get);
    const loggers = useFetchLoggers();

    const refreshView = () => {
        logs.refetch();
        loggers.refetch();
    }

    return (
        <div id="wrapper" style={wrapperStyle}>
            <Banner title="Log View">
                <button onClick={() => navigate("/")}>Back</button>
                <button onClick={refreshView}>Refresh</button>
            </Banner>
            <Filters logFilters={logFilters} />
            <div style={contentRowStyle}>
                <LoggerTable
                    loggersApi={loggers}
                    logFilters={logFilters}
                    refreshView={refreshView} />
                <LogTable
                    logsApi={logs}
                    selectedLogId={selectedLogId}
                    setSelectedLogId={setSelectedLogId} />
                <LogDrilldown logId={selectedLogId} />
            </div>
        </div >
    )
}


export default LogView;
