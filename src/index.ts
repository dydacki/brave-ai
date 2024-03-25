import {HelloApiHandler} from './tasks/HelloApiHandler.ts';
import {ModerationHandler} from './tasks/ModerationHandler.js';
import {TaskHandler} from './tasks/TaskHandler.js';

if (process.argv.length < 3) {
  console.error('Task name is required, start your application with "npm run start [task-name]"');
  process.exit(1);
}

const taskName = process.argv[2];
let handler: TaskHandler;

switch (taskName) {
  case 'helloapi':
    handler = new HelloApiHandler();
    break;
  case 'moderation':
    handler = new ModerationHandler();
    break;
  default:
    console.error(`Unknown task: ${taskName}`);
    process.exit(1);
}

handler
  .handleTask()
  .then(response => {
    console.info('Task completed');
    console.log(JSON.stringify(response, null, 2));
  })
  .catch(error => {
    console.error(`Task failed: ${error}`);
  })
  .finally(() => {
    console.info('Application finished');
    process.exit(0);
  });
