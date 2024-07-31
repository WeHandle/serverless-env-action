const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');
const dotenv = require('dotenv');
const yaml = require('js-yaml');
const ts = require('typescript');

async function run() {
  try {
    const version = core.getInput('tool-version');

    // Display the action version
    await exec.exec(`echo "Wehandle ServerlessYml Env Action version ${version}"`);

    // Load variables from the .env file
    const envConfig = dotenv.config().parsed;

    if(fs.existsSync('serverless.yml')){
      updateServerlessYaml(envConfig);
    }else if(fs.existsSync('serverless.ts')){
      updateServerlessTs(envConfig);
    }else{
      console.log('serverless file not located!');
    }

    
  } catch (error) {
    core.setFailed(error.message);
  }
}

function updateServerlessYaml(dados) {
  try {
    // Read the contents of the serverless.yml file
    const fileContents = fs.readFileSync('serverless.yml', 'utf8');
    const data = yaml.load(fileContents);

    // Add environment variables from .env to serverless.yml
    const envVars = process.env;
    data.provider.environment = {
      ...data.provider.environment,
      ...Object.keys(dados).reduce((acc, key) => {
        acc[key] = envVars[key];
        return acc;
      }, {})
    };

    // Convert the object back to YAML
    const yamlStr = yaml.dump(data);

    // Write the updated YAML back to the file
    fs.writeFileSync('serverless.yml', yamlStr, 'utf8');
    console.log('serverless.yml updated successfully!');
  } catch (e) {
    console.log(e);
  }
}

function updateServerlessTs(dados) {
  try {
    // Read the contents of the serverless.ts file
    const fileContents = fs.readFileSync('serverless.ts', 'utf8');

    // Compile TypeScript to JavaScript
    const result = ts.transpileModule(fileContents, {
      compilerOptions: { module: ts.ModuleKind.CommonJS }
    });

    // Evaluate the transpiled JavaScript to get the serverless config object
    let serverlessConfig = eval(result.outputText);

    // Add environment variables from dados to serverlessConfig
    const envVars = process.env;
    serverlessConfig.provider.environment = {
      ...serverlessConfig.provider.environment,
      ...Object.keys(dados).reduce((acc, key) => {
        acc[key] = envVars[key];
        return acc;
      }, {})
    };

    // Convert the modified object back to TypeScript
    const updatedTs = `export default ${JSON.stringify(serverlessConfig, null, 2)};`;

    // Write the updated TypeScript back to the file
    fs.writeFileSync('serverless.ts', updatedTs, 'utf8');
    console.log('serverless.ts updated successfully!');
  } catch (e) {
    console.log(e);
  }
}

run();