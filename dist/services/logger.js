"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
class Logger {
    /**
     * Uses chalk to color logs.
     * @param content {string}
     * @param type {string}
     * @returns {void}
     */
    log(content, type = 'info') {
        switch (type) {
            case 'info': {
                return console.log(`${chalk_1.default.blue('[INFO]')} ${chalk_1.default.gray(content)}`);
            }
            case 'warn': {
                return console.log(`${chalk_1.default.yellow.bold('[WARN]')} ${content}`);
            }
            case 'error': {
                return console.log(`${chalk_1.default.red.bold('[ERROR]')} ${content}`);
            }
            case 'ready': {
                return console.log(`${chalk_1.default.green.bold('[READY]')} ${content}`);
            }
            default:
                throw new TypeError('Logger must be type either info, warn, error or ready.');
        }
    }
}
exports.default = Logger;
