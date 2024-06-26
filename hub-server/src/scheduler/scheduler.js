
class Scheduler {
    constructor() {
        this.jobs = [];
    }

    addJob(schedule, task) {
        const job = cron.schedule(schedule, task, {
            scheduled: false
        });
        this.jobs.push(job);
    }

    start() {
        this.jobs.forEach(job => job.start());
    }

    stop() {
        this.jobs.forEach(job => job.stop());
    }
}

module.exports = Scheduler;
