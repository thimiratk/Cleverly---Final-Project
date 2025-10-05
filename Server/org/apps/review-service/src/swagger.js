import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Review Service',
        description: 'Review Service API',
        version: "1.0.0"
    },
    host: 'localhost:6002',
    schemes: ['http']
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/review.router.ts'];

// generate swagger.json
swaggerAutogen( outputFile, endpointsFiles, doc);
