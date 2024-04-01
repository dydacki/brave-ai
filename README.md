# Project Documentation

## Overview

This project is a TypeScript application designed to handle specific course tasks. The main logic of the application is located within the `src/tasks` subfolder, which contains classes for each specific tasks.

## Task Handling

The core of the task handling logic is the `TaskHandler` abstract class. This class acts as a base for all specific task classes, providing a common interface and shared functionality. Internally, `TaskHandler` uses an instance of `TaskDevClient` class to communicate with the Brave Course API. This communication is facilitated by the Axios HTTP client under the hood.

## Project Setup

This project is built with Node.js version 21.x and TypeScript version 5.x. After cloning the repository from [https://github.com/dydacki/brave-ai](https://github.com/dydacki/brave-ai), you should run `npm install` to install the necessary dependencies.

## Environment Variables

The project uses environment variables to manage sensitive data and configuration settings. These variables are stored in a `.env` file located in the `src` directory. This file should not be included in the version control system and should be added to your `.gitignore` file to prevent accidental commits.

The `.env` file should contain the following fields:

```dotenv
AI_DEVS_API_KEY=[your_ai_devs_api_key]
BASE_URL=https://tasks.aidevs.pl
DEBUG=false
OPEN_AI_API_KEY=[your_open_ai_api_key]
```

- `AI_DEVS_API_KEY`: This is your personal API key for the AI Devs service. It is used to authenticate your requests to the AI Devs API.
- `BASE_URL`: This is the base URL for the AI Devs API. All API requests will be made to this URL.
- `DEBUG`: This is a boolean flag that controls the output of debug information. When set to `true`, additional debug information will be printed to the console.
- `OPEN_AI_API_KEY`: This is your personal API key for the OpenAI service. It is used to authenticate your requests to the OpenAI API.

## Running the Application

To run the application, use the following command:

```bash
npm run start _taskName_
```

Replace `_taskName_` with the name of the specific task you want to handle. This should correspond to the first word in the filename of the task class located in the `src/tasks` subfolder.

## Application Flow

The application starts by executing the `index.ts` file. This file uses `TaskHandlerFactory` to iterate through the `src/tasks` sub-folder, searching for a file whose name starts with the specified task name. If such a file is found, `TaskHandlerFactory` instantiates the corresponding task class from that file (with class name matching the file name) and calls its `handleTask` method. This method is an abstract method in the `TaskHandler` class, and should be implemented by all derived task classes.
