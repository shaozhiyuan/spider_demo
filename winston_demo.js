const winston = require('winston');
require('winston-daily-rotate-file');

const {Logger, transports} = winston;



const reqLogger = new Logger({
    transports: [
        new transports.Console(),
        new transports.DailyRotateFile({
            filename: './logs/req_log.log',
            datePattern: 'YYYY-MM-DD-HH',
            prepend: true,
            level: 'info'
        })
    ]
});

reqLogger.info('request from client');