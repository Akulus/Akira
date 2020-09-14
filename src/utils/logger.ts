import chalk from 'chalk';

/**
 * Custom Akira bot logger.
 * @param {string} [msg]
 * @param {number} [type]
 * @returns {void}
 */
export default function (msg: string, type = 0): void {
    if (!msg) return;

    if (!['.', '!', '?', ']', ')', '>', '%', '$', '#'].includes(msg[msg.length - 1])) msg = msg + '.';
    const timestamp: string = new Date().toUTCString();

    switch (type) {
        case 0: {
            return console.log(`${chalk.gray(`[${timestamp}]`)} ${chalk.blue('[INFO]')} ${msg}`);
        }
        case 1: {
            return console.warn(`${chalk.gray(`[${timestamp}]`)} ${chalk.yellow.bold('[WARN]')} ${msg}`);
        }
        case 2: {
            return console.error(`${chalk.gray(`[${timestamp}]`)} ${chalk.red.bold('[ERROR]')} ${msg}`);
        }
        case -1: {
            return console.log(`${chalk.gray(`[${timestamp}]`)} ${chalk.whiteBright.bold('[INIT]')} ${msg}`);
        }
        case -2: {
            return console.log(`${chalk.gray(`[${timestamp}]`)} ${chalk.whiteBright.bold('[INIT] [CMD MANAGER]')} ${msg}`);
        }
        case -3: {
            return console.log(`${chalk.gray(`[${timestamp}]`)} ${chalk.whiteBright.bold('[INIT] [DATABASE]')} ${msg}`);
        }
        case -4: {
            return console.log(`${chalk.gray(`[${timestamp}]`)} ${chalk.whiteBright.bold('[INIT] [RADIO MANAGER]')} ${msg}`);
        }
        case -5: {
            return console.log(`${chalk.gray(`[${timestamp}]`)} ${chalk.magenta('[RADIO MANAGER]')} ${msg}`);
        }
        case -10: {
            console.error(`${chalk.gray(`[${timestamp}]`)} ${chalk.redBright.bold.underline('[CRITICAL ERROR]')} ${msg}`);
            return process.exit(74);
        }
        default: {
            return console.debug(`${chalk.gray(`[${timestamp}]`)} ${chalk.cyanBright.italic('[DEBUG]')} ${msg}`);
        }
    }
}
