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
    await exec.exec(`echo "Wehandle Serverless Env Action version ${version}"`);

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
    data.provider.environment = {
      ...data.provider.environment,
      ...Object.keys(dados).reduce((acc, key) => {
        acc[key] = dados[key];
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

    // Create a SourceFile object from the TypeScript source
    const sourceFile = ts.createSourceFile('serverless.ts', fileContents, ts.ScriptTarget.Latest, true);

    // Traverse and modify the AST
    const transformer = (context) => (rootNode) => {
      function visit(node) {
        if (ts.isObjectLiteralExpression(node)) {
          const environmentNode = node.properties.find(prop =>
            ts.isPropertyAssignment(prop) &&
            prop.name.getText() === 'environment'
          );

          if (environmentNode && ts.isPropertyAssignment(environmentNode)) {
            const updatedProperties = [
              ...environmentNode.initializer.properties,
              ...Object.keys(dados).map(key => ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier(key),
                ts.factory.createStringLiteral(dados[key])
              ))
            ];

            const newEnvironmentNode = ts.factory.updatePropertyAssignment(
              environmentNode,
              environmentNode.name,
              ts.factory.createObjectLiteralExpression(updatedProperties, true)
            );

            const newNode = ts.factory.updateObjectLiteralExpression(node,
              node.properties.map(prop => prop === environmentNode ? newEnvironmentNode : prop)
            );

            return newNode;
          }
        }
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(rootNode, visit);
    };

    const result = ts.transform(sourceFile, [transformer]);
    const printer = ts.createPrinter();
    const updatedTs = printer.printFile(result.transformed[0]);

    // Write the updated TypeScript code back to the file
    fs.writeFileSync('serverless.ts', updatedTs, 'utf8');

    console.log('serverless.ts updated successfully!');
  } catch (e) {
    console.log('Error:', e);
  }
}

run();