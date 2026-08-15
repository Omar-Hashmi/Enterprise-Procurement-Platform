require('dotenv').config();

const { server } = require('./server');
const { startEmailWorker } = require('./src/queues/email.queue');
const { scheduleBudgetAlertJob } = require('./src/jobs/budgetAlert.job');
const { scheduleContractReminderJob } = require('./src/jobs/contractReminder.job');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startEmailWorker();
  scheduleBudgetAlertJob();
  scheduleContractReminderJob();
});
