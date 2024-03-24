import {Task} from '../model/model.js';

export interface HelloApiTask extends Task {
  code: number;
  msg: string;
  cookie: string;
}
