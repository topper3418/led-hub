import React, { CSSProperties } from 'react';
import { Logger, LoggersApi, useSetLoggerLevel } from './loggerHooks';
import { LogFilters } from './logHooks';
import { getLogger } from '../../logging';

const logger = getLogger('views/logView/loggerList');


interface LoggerTableProps {
    loggersApi: LoggersApi;
    logFilters: LogFilters;
    refreshView: () => void;
}

const loggerWrapperStyle: CSSProperties = {
    overflowY: "auto",
    flexShrink: .5
}

const LoggerTable: React.FC<LoggerTableProps> = ({ loggersApi: { data, loading, error }, logFilters, refreshView }) => {
    // value being true means "include", false means "exclude"
    const setLoggerExclusion = (excludeLogger: Logger, value: boolean) => {
        logger.debug(`setting logger filter: ${excludeLogger.name}, value: ${value}`);
        if (value) {
            logFilters.set.excludeLoggers.remove(excludeLogger.id);
        } else {
            logFilters.set.excludeLoggers.add(excludeLogger.id);
        }
        refreshView();
    }
    const allChecked = logFilters.get.excludeLoggers.length === 0;
    const allLoggerIds = data.map((logger) => logger.id);
    const handleMasterCheckbox = () => {
        if (allChecked) {
            console.log("all checked, unchecking all");
            logFilters.set.excludeLoggers.raw(allLoggerIds);
        } else {
            console.log("not all checked, checking all");
            logFilters.set.excludeLoggers.raw([]);
        }
        refreshView();
    }
    const tableStyle: CSSProperties = {};
    if (loading) {
        tableStyle.borderColor = "yellow";
    }
    return (
        <div style={loggerWrapperStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={handleMasterCheckbox} />
                        </th>
                        <th>Logger</th>
                        <th>Level</th>
                    </tr>
                </thead>
                <tbody>
                    {error ? (
                        <tr><td colSpan={4}>Error: {error}</td></tr>
                    ) : data && data.length > 0 ? data.map((logger) => (
                        <tr key={logger.id}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={!logFilters.get.excludeLoggers.includes(logger.id)}
                                    onChange={(event) => setLoggerExclusion(logger, event.target.checked)} />
                            </td>
                            <td>{logger.name}</td>
                            <td>
                                <LoggerLevelDropdown
                                    loggerId={logger.id}
                                    currentLevel={logger.level}
                                    refreshCallback={refreshView} />
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={4}>No logs to display</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

interface LoggerLevelDropdownProps {
    loggerId: number;
    currentLevel: string;
    refreshCallback: () => void;
}

const LoggerLevelDropdown: React.FC<LoggerLevelDropdownProps> = ({ loggerId, currentLevel, refreshCallback }) => {
    const [setLoggerLevel, { loading, error }] = useSetLoggerLevel();
    const levels = ['debug', 'info', 'warn', 'error'];
    const changeLevel = (level: string) => {
        logger.debug(`changing level for logger id ${loggerId} to ${level}`);
        setLoggerLevel(loggerId, level, refreshCallback);
    }
    return (<>
        {loading ? <p>Setting level...</p> :
            error ? <p>Error: {error}</p> :
                <select value={currentLevel} onChange={(e) => changeLevel(e.target.value)}>
                    {levels.map((level) => (
                        <option key={level} value={level}>{level.toUpperCase()}</option>
                    ))}
                </select>}
    </>)
}

export default LoggerTable;
