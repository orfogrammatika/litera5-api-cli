"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const js_logger_1 = __importDefault(require("js-logger"));
const litera5_api_js_client_1 = require("litera5-api-js-client");
const lodash_1 = __importDefault(require("lodash"));
const utils_1 = require("./utils");
const ogxt_utils_1 = require("ogxt-utils");
const packageJson = require('../package.json');
const version = packageJson.version;
js_logger_1.default.useDefaults({
    formatter: (messages, context) => {
        // Prepend the logger's name to the log message for easy identification.
        if (context.name) {
            messages.unshift(`[${context.name}]`);
        }
        if (context.level) {
            messages.unshift(`${context.level.name}`);
        }
    },
});
js_logger_1.default.setLevel(js_logger_1.default.INFO);
const log = js_logger_1.default.get('cli');
const program = new commander_1.Command();
const logError = (error) => {
    if (error.status && error.statusText) {
        log.error(`${error.status} - ${error.statusText}`);
        void error.text().then(txt => log.error(txt));
    }
    else {
        log.error(error);
    }
};
program
    .version(version)
    .name('l5-api')
    .description('Консольный клиент для работы с API Литера5')
    .option('-d, --debug', 'включает дополнительные отладочные сообщения', false)
    .option('-u, --url <string>', 'базовый адрес сервера')
    .option('-l, --client <strint>', 'имя входа клиента')
    .option('-s, --secret <string>', 'секретный ключ клиента')
    .option('-p, --userPassword <string>', 'специальный пароль пользователя для API')
    .option('-c, --cfg <json-yml-file>', 'JSON/YML файл с настройками API', utils_1.loadObjectFile);
program
    .command('setup')
    .description('Работа с настройками.')
    .option('-j, --json <json-string>', 'JSON моделька настроек, которые надо установить', val => JSON.parse(val))
    .option('-f, --file <json-yml-file>', 'JSON/YAML моделька настроек, которые надо установить, взятая из файла', utils_1.loadObjectFile)
    .action(args => {
    var _a;
    const api = (0, utils_1.setupActionAndGetApi)(program.opts());
    log.info('Настройки:');
    const json = (_a = args.json) !== null && _a !== void 0 ? _a : args.file;
    if (json) {
        log.info('- устанавливаем', json);
        api
            .setup(json)
            .then(resp => {
            delete resp.time;
            delete resp.signature;
            log.info('Готово, настройки установлены:', resp);
        })
            .catch(logError);
    }
    else {
        log.info('- получаем');
        api
            .setup({})
            .then(resp => {
            log.info('Готово, настройки получены:', (0, utils_1.clean)(resp));
        })
            .catch(logError);
    }
});
program
    .command('user')
    .description('Создание нового пользователя или настройка существующего')
    .option('-j, --json <json-string>', 'JSON модель пользователя, которого нужно создать/настроить', val => JSON.parse(val))
    .option('-f, --file <json-yml-file>', 'JSON/YAML модель пользователя, взятая из файла', utils_1.loadObjectFile)
    .action(args => {
    var _a;
    const api = (0, utils_1.setupActionAndGetApi)(program.opts());
    log.info('Настриваем пользователя:');
    const json = (_a = args.json) !== null && _a !== void 0 ? _a : args.file;
    if (json) {
        log.info('- настраиваем', json);
        api
            .user(json)
            .then(resp => {
            log.info('Готово, пользователь настроен:', (0, utils_1.clean)(resp));
        })
            .catch(logError);
    }
    else {
        log.error('Необходимо задать модель пользователя в параметрах --json или --file');
    }
});
program
    .command('user-api-password')
    .description('Управление специальным паролем пользователя для API')
    .option('-j, --json <json-string>', 'JSON модель запроса на работу с API паролем пользователя', val => JSON.parse(val))
    .option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса, взятая из файла', utils_1.loadObjectFile)
    .action(args => {
    var _a;
    const api = (0, utils_1.setupActionAndGetApi)(program.opts());
    log.info('Настриваем API пароль пользователя:');
    const json = (_a = args.json) !== null && _a !== void 0 ? _a : args.file;
    if (json) {
        log.info('- настраиваем', json);
        api
            .userApiPassword(json)
            .then(resp => {
            log.info('Готово, API пароль пользователя настроен:', (0, utils_1.clean)(resp));
        })
            .catch(logError);
    }
    else {
        log.error('Необходимо задать модель запроса в параметрах --json или --file');
    }
});
program
    .command('check')
    .description('Запуск интерактивной проверки документа')
    .option('-j, --json <json-string>', 'JSON модель запроса на проверку', val => JSON.parse(val))
    .option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса на проверку, взятая из файла', utils_1.loadObjectFile)
    .option('-t, --html <html-file>', 'HTML файл с текстом на проверку, если указан, то переписывает содержимым файла параметр html запроса', utils_1.loadTextFile)
    .action(args => {
    var _a;
    const api = (0, utils_1.setupActionAndGetApi)(program.opts());
    const json = (_a = args.json) !== null && _a !== void 0 ? _a : args.file;
    if (json) {
        if (args.html) {
            json.html = args.html;
        }
        log.info('Начинаем проверку:', lodash_1.default.omit(json, ['html']));
        api
            .check(json)
            .then(resp => {
            log.info('Готово, проверка инициирована:', (0, utils_1.clean)(resp));
        })
            .catch(logError);
    }
    else {
        log.error('Необходимо задать модель запроса на проверку в параметрах --json или --file');
    }
});
program
    .command('user-check')
    .description('Запуск интерактивной проверки документа от лица пользователя')
    .option('-j, --json <json-string>', 'JSON модель запроса на проверку', val => JSON.parse(val))
    .option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса на проверку, взятая из файла', utils_1.loadObjectFile)
    .option('-t, --html <html-file>', 'HTML файл с текстом на проверку, если указан, то переписывает содержимым файла параметр html запроса', utils_1.loadTextFile)
    .action(args => {
    var _a;
    const api = (0, utils_1.setupActionAndGetApi)(program.opts());
    const json = (_a = args.json) !== null && _a !== void 0 ? _a : args.file;
    if (json) {
        if (args.html) {
            json.html = args.html;
        }
        log.info('Начинаем проверку:', lodash_1.default.omit(json, ['html']));
        api
            .userCheck(json)
            .then(resp => {
            log.info('Готово, проверка инициирована:', (0, utils_1.clean)(resp));
        })
            .catch(logError);
    }
    else {
        log.error('Необходимо задать модель запроса на проверку в параметрах --json или --file');
    }
});
program
    .command('check-ogxt')
    .description('Неинтерактивная проверка документа, запрос, ожидание результатов, запись результатов проверки в файл.')
    .option('-j, --json <json-string>', 'JSON модель запроса на проверку', val => JSON.parse(val))
    .option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса на проверку, взятая из файла', utils_1.loadObjectFile)
    .option('-t, --html <html-file>', 'HTML файл с текстом на проверку, если указан, то переписывает содержимым файла параметр html запроса', utils_1.loadTextFile)
    .option('-o, --ogxt <ogxt-file>', 'OGXT файл с текстом на проверку, если не указан, то текст для проверки будет сформирован из html текста при помощи ogxt-utils', utils_1.loadTextFile)
    .option('-r, --result <path>', 'Каталог с результатами проверки (будет создан, если не существует), файлы с результатами называются по параметру check, если не указан, то результаты будут сохранены в текущем каталоге')
    .action(args => {
    var _a;
    const api = (0, utils_1.setupActionAndGetApi)(program.opts());
    const json = (_a = args.json) !== null && _a !== void 0 ? _a : args.file;
    if (args.html) {
        json.html = args.html;
    }
    if (args.ogxt) {
        json.ogxt = args.ogxt;
    }
    if (lodash_1.default.isNil(json.ogxt)) {
        json.ogxt = (0, ogxt_utils_1.html2ogxt)(json.html);
    }
    log.info('Проверяем текст:', json);
    api
        .checkOgxt(json)
        .then(resp => {
        log.info('Готово, проверка начата:', (0, utils_1.clean)(resp));
        const checkResults = () => {
            log.info('Проверяем готовность проверки...');
            api
                .checkOgxtResults({
                check: resp.check,
            })
                .then(res => {
                var _a;
                log.info('Готовность:', (0, utils_1.clean)(res));
                let result = {};
                switch (res.state) {
                    case litera5_api_js_client_1.CheckState.CHECKED_SUCCESS:
                        log.info('Проверка успешно завершена.');
                        result = {
                            html: (0, utils_1.saveTextFile)(`${resp.check}.html`, (_a = res.html) !== null && _a !== void 0 ? _a : '', args.result),
                            annotations: (0, utils_1.saveTextFile)(`${resp.check}.annotations.json`, JSON.stringify(res.annotations, null, 2), args.result),
                            stats: (0, utils_1.saveTextFile)(`${resp.check}.stats.json`, JSON.stringify(res.stats, null, 2), args.result),
                        };
                        log.info('Результаты сохранены в файлах', result);
                        break;
                    case litera5_api_js_client_1.CheckState.ESTIMATED_ERROR:
                    case litera5_api_js_client_1.CheckState.ESTIMATED_REJECT:
                    case litera5_api_js_client_1.CheckState.CANCELLED:
                    case litera5_api_js_client_1.CheckState.REJECTED:
                    case litera5_api_js_client_1.CheckState.CHECKED_ERROR:
                        log.info('Во время проверки произошла ошибка.');
                        break;
                    default:
                        setTimeout(checkResults, 1000);
                }
            })
                .catch(logError);
        };
        setTimeout(checkResults, 1000);
    })
        .catch(logError);
});
program.parse(process.argv);
