// const fs = require('fs');
// const path = require('path');
// const Yaml = require('yaml');
// const swaggerParser = require('@apidevtools/swagger-parser');

// const filePath = path.join(__dirname, 'openApi.yaml');
// const componentsPath = path.join(__dirname);


// const parseYamlFile = (file) => {
//     const content = fs.readFileSync(file, 'utf8');

//     try {
//         return Yaml.parse(content);
//     } catch (error) {
//         const position = error.linePos?.[0];

//         const location = position
//             ? `line ${position.line}, column ${position.col}`
//             : 'unknown location';

//         throw new Error(
//             `YAML error in file: ${file}\n` +
//             `Location: ${location}\n` +
//             `Details: ${error.message}`
//         );
//     }
// };

// const getYamlFiles = (directory) => {
//     let files = [];

//     for (const entry of fs.readdirSync(directory, {
//         withFileTypes: true
//     })) {
//         const fullPath = path.join(directory, entry.name);

//         if (entry.isDirectory()) {
//             // Skip the Schemas directory
//             if (entry.name === 'Schemas') continue;

//             files.push(...getYamlFiles(fullPath));
//         } else if (
//             /\.(yaml|yml)$/i.test(entry.name) &&
//             entry.name !== 'openApi.yaml' &&
//             entry.name !== 'openapi.yaml'
//         ) {
//             files.push(fullPath);
//         }
//     }

//     return files;
// };



// const loadApi = async () => {
//     // Read the main OpenAPI document
//     const api = parseYamlFile(filePath);
//     api.paths ??= {};

//     // Read all route documentation files
//     const routeFiles = getYamlFiles(componentsPath);

//     for (const file of routeFiles) {
//         const routeDocument = parseYamlFile(file);

//         for (const [routePath, pathItem] of Object.entries(routeDocument ?? {})) {
//             api.paths[routePath] ??= {};

//             for (const [method, operation] of Object.entries(pathItem ?? {})) {
//                 if (api.paths[routePath][method]) {
//                     throw new Error(
//                         `Duplicate method "${method}" for path "${routePath}" in ${file}`
//                     );
//                 }

//                 api.paths[routePath][method] = operation;
//             }
//         }
//     }

//     // Bundle the merged document using the original file as the reference base
//     return await swaggerParser.bundle(filePath, {
//         dereference: false
//     }).then(async () => {
//         // Return the merged document, not the original document
//         return api;
//     });
// };


// module.exports = loadApi;

const fs = require('fs');
const path = require('path');
const Yaml = require('yaml');
const swaggerParser = require('@apidevtools/swagger-parser');

const filePath = path.join(__dirname, 'openApi.yaml');
const docsPath = __dirname;

// Parse YAML files and provide useful errors.
const parseYamlFile = (file) => {
    const content = fs.readFileSync(file, 'utf8');

    try {
        return Yaml.parse(content);
    } catch (error) {
        const position = error.linePos?.[0];

        const location = position
            ? `line ${position.line}, column ${position.col}`
            : 'unknown location';

        throw new Error(
            `YAML error in file: ${file}\n` +
            `Location: ${location}\n` +
            `Details: ${error.message}`
        );
    }
};

// Recursively find route documentation files.
// Schemas are excluded because openApi.yaml references them separately.
const getYamlFiles = (directory) => {
    let files = [];

    for (const entry of fs.readdirSync(directory, {
        withFileTypes: true
    })) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            if (entry.name === 'Schemas') {
                continue;
            }

            files.push(...getYamlFiles(fullPath));
        } else if (
            /\.(yaml|yml)$/i.test(entry.name) &&
            !/^openapi\.ya?ml$/i.test(entry.name)
        ) {
            files.push(fullPath);
        }
    }

    return files;
};

// Load and combine the API documentation.
const loadApi = async () => {
    // Load the main OpenAPI document.
    const api = parseYamlFile(filePath);

    api.paths ??= {};

    // Find all route documentation files.
    const routeFiles = getYamlFiles(docsPath);

    // Merge route documentation into the main paths object.
    for (const file of routeFiles) {
        const routeDocument = parseYamlFile(file);

        for (const [routePath, pathItem] of Object.entries(
            routeDocument ?? {}
        )) {
            if (!pathItem || typeof pathItem !== 'object') {
                throw new Error(
                    `Invalid path definition "${routePath}" in ${file}`
                );
            }

            api.paths[routePath] ??= {};

            for (const [method, operation] of Object.entries(pathItem)) {
                if (api.paths[routePath][method]) {
                    throw new Error(
                        `Duplicate method "${method}" for path ` +
                        `"${routePath}" in ${file}`
                    );
                }

                api.paths[routePath][method] = operation;
            }
        }
    }

    // Bundle the main OpenAPI document.
    // This resolves the external schema references declared in openApi.yaml.
    const bundledApi = await swaggerParser.bundle(filePath, {
        dereference: false
    });

    // Use the merged paths rather than the original paths from openApi.yaml.
    bundledApi.paths = api.paths;

    return bundledApi;
};

module.exports = loadApi;
