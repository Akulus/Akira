import chalk from 'chalk';

export default class Logger {
    /**
     * Uses chalk to color logs.
     * @param content {string}
     * @param type {string}
     * @returns {void}
     */
    log(content: string, type = 'info'): void {
        switch (type) {
            case 'info': {
                return console.log(`${chalk.blue('[INFO]')} ${chalk.gray(content)}`);
            }
            case 'warn': {
                return console.log(`${chalk.yellow.bold('[WARN]')} ${content}`);
            }
            case 'error': {
                return console.log(`${chalk.red.bold('[ERROR]')} ${content}`);
            }
            case 'ready': {
                return console.log(`${chalk.green.bold('[READY]')} ${content}`);
            }

            default:
                throw new TypeError('Logger must be type either info, warn, error or ready.');
        }
    }
}
