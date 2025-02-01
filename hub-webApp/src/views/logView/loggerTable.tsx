import React from 'react';
import { Logger, LoggersApi, useSetLoggerLevel } from './loggerHooks';
import { LogFilters } from './logHooks';
import { getLogger } from '../../logging';

const logger = getLogger('views/logView/loggerList');


interface LoggerListProps {
    loggersApi: LoggersApi;
    logFilters: LogFilters;
    refreshView: () => void;
}


const LoggerTable: React.FC<LoggerListProps> = ({ loggersApi: { data, loading, error }, logFilters, refreshView }) => {
    // value being true means "include", false means "exclude"
    const setLoggerExclusion = (excludeLogger: Logger, value: boolean) => {
        logger.debugp(`setting logger filter: ${excludeLogger.name}, value: ${value}`);
        if (value) {
            logFilters.set.excludeLoggers.remove(excludeLogger.id);
        } else {
            logFilters.set.excludeLoggers.add(excludeLogger.id);
        }
        refreshView();
    }
    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : data && data.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Logger</th>
                            <th>Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((logger) => (
                            <tr key={logger.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={!logFilters.get.excludeLoggers.includes(logger.id)}
                                        onChange={(event) => setLoggerExclusion(logger, event.target.checked)} />
                                </td>
                                <td>{logger.name}</td>
                                <td><LoggerLevelDropdown loggerId={logger.id} currentLevel={logger.level} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No loggers to display</p>
            )}
        </div>
    )
}


const LoggerLevelDropdown: React.FC<{ loggerId: number, currentLevel: string }> = ({ loggerId, currentLevel }) => {
    const [setLoggerLevel, { loading, error }] = useSetLoggerLevel();
    const levels = ['debug', 'info', 'warn', 'error'];
    const changeLevel = (level: string) => {
        logger.debugp(`changing level for logger id ${loggerId} to ${level}`);
        setLoggerLevel(loggerId, level);
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
