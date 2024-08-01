## REQUIREMENTS
You must Have Node and NPM installed -> https://nodejs.org/en/download
### INSTALL IONIC CLI IF ISN'T INSTALLED YET

```
    npm install -g @ionic/cli
```

### INSTALL DEPENDENCIES

```
    npm i
```

### SERVE

```
    ionic serve
```


## CONFIGURATION AND VARIABLES
Can be found in src/environments (for API keys, endpoint configuration and other small parameters). 
NOTE: There should be an API key provided by Union Avatars to allow the usage of their API. This API key should be injected in the front-end via Server Injection, but since this was only a test and that was not the scope of the project, the API key is simply loaded in the environment.ts file. This would not be production ready code, but again, this was not a part of the exercise.
