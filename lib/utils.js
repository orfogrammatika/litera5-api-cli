"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = exports.setupActionAndGetApi = exports.loadConfigFromOpts = exports.loadObjectFile = exports.saveTextFile = exports.loadTextFile = void 0;
const fs_1 = __importDefault(require("fs"));
const js_logger_1 = __importDefault(require("js-logger"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const lodash_1 = __importDefault(require("lodash"));
const litera5_api_js_client_1 = require("litera5-api-js-client");
const log = js_logger_1.default.get('cli');
function loadTextFile(path) {
    const data = fs_1.default.readFileSync(`${process.cwd()}/${path}`);
    return data.toString();
}
exports.loadTextFile = loadTextFile;
function saveTextFile(name, content, path) {
    const filePath = `${path !== null && path !== void 0 ? path : process.cwd()}/${name}`;
    fs_1.default.writeFileSync(filePath, content);
    return filePath;
}
exports.saveTextFile = saveTextFile;
function loadObjectFile(path) {
    let result = {};
    const lpath = path.toLowerCase();
    const str = loadTextFile(path);
    if (lpath.endsWith('.json')) {
        result = JSON.parse(str);
    }
    else if (lpath.endsWith('.yaml') || lpath.endsWith('.yml')) {
        result = js_yaml_1.default.load(str);
    }
    return result;
}
exports.loadObjectFile = loadObjectFile;
function loadConfigFromOpts(opts) {
    const result = {
        url: 'https://litera5.ru',
        client: '',
        secret: '',
    };
    if (lodash_1.default.has(opts, 'cfg')) {
        if (lodash_1.default.has(opts.cfg, 'url')) {
            result.url = opts.cfg.url;
        }
        if (lodash_1.default.has(opts.cfg, 'client')) {
            result.client = opts.cfg.client;
        }
        if (lodash_1.default.has(opts.cfg, 'secret')) {
            result.secret = opts.cfg.secret;
        }
        if (lodash_1.default.has(opts.cfg, 'userPassword')) {
            result.userPassword = opts.cfg.userPassword;
        }
    }
    if (lodash_1.default.has(opts, 'url')) {
        result.url = opts.url;
    }
    if (lodash_1.default.has(opts, 'client')) {
        result.client = opts.client;
    }
    if (lodash_1.default.has(opts, 'secret')) {
        result.secret = opts.secret;
    }
    if (lodash_1.default.has(opts, 'userPassword')) {
        result.userPassword = opts.userPassword;
    }
    return result;
}
exports.loadConfigFromOpts = loadConfigFromOpts;
function setupActionAndGetApi(opts) {
    if (opts.debug) {
        js_logger_1.default.setLevel(js_logger_1.default.DEBUG);
    }
    else {
        js_logger_1.default.setLevel(js_logger_1.default.INFO);
    }
    const cfg = loadConfigFromOpts(opts);
    log.debug('Options:', opts);
    log.debug('Configuration:', cfg);
    return (0, litera5_api_js_client_1.createApi)({
        company: cfg.client,
        secret: cfg.secret,
        url: cfg.url,
        userApiPassword: cfg.userPassword,
    }, js_logger_1.default.getLevel());
}
exports.setupActionAndGetApi = setupActionAndGetApi;
function clean(obj) {
    return lodash_1.default.omit(obj, ['time', 'signature']);
}
exports.clean = clean;
