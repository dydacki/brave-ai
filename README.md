# Project Documentation

## Overview

This project is a TypeScript application designed to handle specific course tasks. The main logic of the application is located within the `src/tasks` subfolder, which contains classes for each specific tasks.

## Task Handling

The core of the task handling logic is the `TaskHandler` abstract class. This class acts as a base for all specific task classes, providing a common interface and shared functionality. Internally, `TaskHandler` uses an instance of `TaskDevClient` class to communicate with the brave course API. This communication is facilitated by the Axios HTTP client under the hood.

## Project Setup

This project is built with Node.js version 21.x and TypeScript version 5.x. After cloning the repository from [https://github.com/dydacki/brave-ai](https://github.com/dydacki/brave-ai), you should run `npm install` to install the necessary dependencies.

## Running the Application

To run the application, use the following command:

```bash
npm run start _taskName_
```

Replace `_taskName_` with the name of the specific task you want to handle. This should correspond to the first word in the filename of the task class located in the `src/tasks` subfolder.

## Application Flow

The application starts by executing the `index.ts` file. This file uses `TaskHandlerFactory` to iterate through the `src/tasks` sub-folder, searching for a file whose name starts with the specified task name. If such a file is found, `TaskHandlerFactory` instantiates the corresponding task class from that file (with class name matching the file name) and calls its `handleTask` method. This method is an abstract method in the `TaskHandler` class, and should be implemented by all derived task classes.
