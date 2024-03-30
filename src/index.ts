import {BloggerHandler} from './tasks/BloggerHandler.ts';
import {HelloApiHandler} from './tasks/HelloApiHandler.ts';
import {ModerationHandler} from './tasks/ModerationHandler.ts';
import {LiarHandler} from './tasks/LiarHandler.ts';
import {TaskHandler} from './tasks/TaskHandler.ts';
import {EmbeddingHandler} from './tasks/EmbeddingHandler.ts';
import {InpromptHandler} from './tasks/InpromptHandler.ts';

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
  case 'blogger':
    handler = new BloggerHandler();
    break;
  case 'liar':
    handler = new LiarHandler();
    break;
  case 'inprompt':
    handler = new InpromptHandler();
    break;
  case 'embedding':
    handler = new EmbeddingHandler();
    break;
  default:
    console.error(`Unknown task: ${taskName}`);
    process.exit(1);
}

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
