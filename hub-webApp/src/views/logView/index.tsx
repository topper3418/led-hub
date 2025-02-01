import React from "react"
import { useNavigate } from "react-router-dom";
import { useFetchLogs, useFilters } from "./logHooks";
import Banner from "../../components/banner";
import Filters from "./filters";
import LogTable from "./logTable";
import { useFetchLoggers } from "./loggerHooks";
import LoggerTable from "./loggerTable";

const LogView: React.FC = () => {
    const navigate = useNavigate();
    const logFilters = useFilters();

    const logs = useFetchLogs(logFilters.get);
    const loggers = useFetchLoggers();

    const refreshView = () => {
        logs.refetch();
        loggers.refetch();
    }

    return (
        <div className="row flex">
            <div className="wrapper view column gapped">
                <Banner title="Log View">
                    <button onClick={() => navigate("/")}>Back</button>
                    <button onClick={() => logs.refetch()}>Refresh</button>
                </Banner>
                <Filters logFilters={logFilters} />
                <div className="row gapped">
                    <LoggerTable loggersApi={loggers} logFilters={logFilters} refreshView={refreshView} />
                    <LogTable logsApi={logs} />
                </div>
            </div>
        </div >
    )
}


export default LogView;
