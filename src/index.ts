import {getTask} from './tasks/taskHandler.ts';

console.log('Hello AI');
const a = await getTask('helloapi');
console.log(a);
