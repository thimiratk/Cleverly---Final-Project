import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Auth Service',
        description: 'Auth Service API',
        version: "1.0.0"
    },
    host: 'animated-space-umbrella-g4x9q94q5gv53p47-6001.app.github.dev',
    schemes: ['https']
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/auth.router.ts'];

// generate swagger.json
swaggerAutogen( outputFile, endpointsFiles, doc);