"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
// @ts-ignore | This npm package have no @types
const simple_youtube_api_1 = tslib_1.__importDefault(require("simple-youtube-api"));
/**
 * Tests every option inside .envv file.
 * @returns {Promise<void>}
 */
async function validateConfig() {
    console.log(`Running ${chalk_1.default.bold('dotenv-config.ts')} test script. This code will check .env file and generate config object.\n`);
    let testParam = undefined;
    // Check Discord bot token
    testParam = process.env.CONFIG_DISCORD_BOT_TOKEN;
    if (testParam && testParam !== '' && typeof testParam === 'string' && testParam.length > 40) {
        success('Discord bot token seems to be valid.');
    }
    else {
        fail('Discord bot token is invalid.');
    }
    // Check youtube API key
    testParam = process.env.CONFIG_YT_API_KEY;
    if (testParam && testParam !== '' && typeof testParam === 'string' && testParam.length > 15) {
        try {
            const youtube = new simple_youtube_api_1.default(testParam);
            const video = await youtube.searchVideos('Aeden - Holding On', 1);
            if (!video || video === '') {
                fail('Youtube API key is invalid.');
            }
            else {
                success('Youtube API key is valid.');
            }
        }
        catch (error) {
            fail('Youtube API key is invalid.');
        }
    }
    else {
        fail('Youtube API key is invalid.');
    }
    // Check owners
    testParam = process.env.CONFIG_OWNERS;
    if (testParam && typeof testParam === 'string' && testParam.length > 5) {
        success('Option owners array seems to be valid.');
    }
    else if (testParam && typeof testParam !== 'string') {
        fail('Option owners array is invalid.');
    }
    else {
        unknown('Option owners array is undefined or under unknown status.');
    }
    // Check prefix
    testParam = process.env.CONFIG_PREFIX;
    if (testParam && typeof testParam === 'string' && testParam !== '') {
        success('Option prefix is valid.');
    }
    else {
        fail('Option prefix is invalid.');
    }
    // Check is personal
    testParam = process.env.CONFIG_IS_PERSONAL;
    if (testParam && typeof testParam === 'string' && ['true', 'false', 'yes', 'no'].includes(testParam)) {
        success('Option is personal is valid.');
    }
    else {
        fail('Option is personal is invalid.');
    }
    // Check enable cooldowns
    testParam = process.env.CONFIG_ENABLE_COOLDOWNS;
    if (testParam && typeof testParam === 'string' && ['true', 'false', 'yes', 'no'].includes(testParam)) {
        success('Option enable cooldowns is valid.');
    }
    else {
        fail('Option enable cooldowns is invalid.');
    }
    // Check default volume
    testParam = process.env.CONFIG_DEFAULT_VOLUME;
    if (testParam &&
        typeof testParam === 'string' &&
        testParam !== '' &&
        /^[0-9]+$/gi.test(testParam) &&
        parseInt(testParam) >= 0 &&
        parseInt(testParam) <= 100) {
        success('Option default volume is valid.');
    }
    else {
        fail('Option default volume is invalid.');
    }
    // Check DJ role name
    testParam = process.env.CONFIG_DJ_ROLE_NAME;
    if (testParam && typeof testParam === 'string' && testParam.length > 0) {
        success('Option DJ role name seems to be valid.');
    }
    else if (!testParam || (testParam && typeof testParam === 'string' && testParam.length === 0)) {
        unknown('Option DJ role name is undefined or under unknown status.');
    }
    else {
        fail('Option DJ role name is invalid.');
    }
    // Check playlist limit
    testParam = process.env.CONFIG_PLAYLIST_LIMIT;
    if (testParam && typeof testParam === 'string' && testParam !== '' && /^[0-9]+$/gi.test(testParam)) {
        success('Option playlist limit seems to be valid.');
    }
    else {
        fail('Option playlist limit is invalid.');
    }
    // Check enable presets
    testParam = process.env.CONFIG_ENABLE_PRESETS;
    if (testParam && typeof testParam === 'string' && ['true', 'false', 'yes', 'no'].includes(testParam)) {
        success('Option enable presets is valid.');
    }
    else {
        fail('Option enable presets is invalid.');
    }
    return console.log('\nTest script finished! Everything inside .env file seems to be valid.\n');
}
exports.default = validateConfig;
/**
 * Used to make color logs easily!
 * @param content {string}
 * @returns {void}
 */
function success(content) {
    return console.log(`${chalk_1.default.greenBright.bold('[SUCCESS]')} ${content}`);
}
/**
 * Used to make color logs easily!
 * @param content {string}
 * @returns {void}
 */
function fail(content) {
    console.log(`${chalk_1.default.redBright.bold('[FAIL]')} ${content} Check your [.env] file.`);
    return process.exit(-1);
}
/**
 * Used to make color logs easily!
 * @param content {string}
 * @returns {void}
 */
function unknown(content) {
    return console.log(`${chalk_1.default.yellow.bold('[UNKNOWN]')} ${content}`);
}
