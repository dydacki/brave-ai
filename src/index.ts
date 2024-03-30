import {TaskHandlerFactory} from './utils/TaskHandlerFactory.ts';

if (process.argv.length < 3) {
  console.error('Task name is required, start your application with "npm run start [task-name]"');
  process.exit(1);
}

const taskName = process.argv[2];
TaskHandlerFactory.create(taskName)
  .then(handler => {
    handler
      .handleTask()
      .then(() => {
        console.info('Task completed');
      })
      .catch(error => {
        console.error(`Task failed: ${error}`);
      })
      .finally(() => {
        console.info('Application finished');
        process.exit(0);
      });
  })
  .catch(error => {
    console.error(`Could not create task handler for ${taskName} task: ${error}`);
    process.exit(1);
  });
