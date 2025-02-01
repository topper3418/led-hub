
import React from "react";
import { LogFilters } from "./logHooks";

interface LogFiltersProps {
    logFilters: LogFilters;
}

const Filters: React.FC<LogFiltersProps> = ({ logFilters: { get, set, clear } }) => {

    return (
        <div className="row gapped">
            <label>
                Min Time:
                <input
                    type="datetime-local"
                    value={get.minTime}
                    onChange={(e) => set.minTime(e.target.value)}
                />
            </label>
            <label>
                Max Time:
                <input
                    type="datetime-local"
                    value={get.maxTime}
                    onChange={(e) => set.maxTime(e.target.value)}
                />
            </label>
            <label>
                Offset:
                <input
                    type="number"
                    value={get.offset}
                    onChange={(e) => set.offset(parseInt(e.target.value))}
                />
            </label>
            <label>
                Limit:
                <input
                    type="number"
                    value={get.limit}
                    onChange={(e) => set.limit(parseInt(e.target.value))}
                />
            </label>
            <label>
                Search:
                <input
                    type="text"
                    value={get.search}
                    onChange={(e) => set.search(e.target.value)}
                />
            </label>
            <button onClick={clear}>Clear</button>
        </div>
    )
}

export default Filters;
