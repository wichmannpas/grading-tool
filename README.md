# Grading Tool

A tool to automate the workflow of grading submissions, such as exams, tasks, etc.

Separate Tasks can be graded by assigning comments to each subtask, each comment causing a specific number of points to be added or taken.

By default, all data is locally stored in the browser.

## Data Synchronization Between Multiple Users

The tool provides rudimentary support for synchronization of tasks and comments over WebSockets.
This requires a server-side backend that may be published in a separate repository on GitHub in the future.

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
