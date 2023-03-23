import { Command } from 'commander';
import Logger from 'js-logger';
import {
	CheckOgxtRequest,
	CheckRequest,
	CheckState,
	SetupRequest,
	UserRequest,
	UserApiPasswordRequest,
} from 'litera5-api-js-client';
import _ from 'lodash';
import { clean, loadObjectFile, loadTextFile, setupActionAndGetApi, saveTextFile } from './utils';
import { html2ogxt } from 'ogxt-utils';

const packageJson = require('../package.json');
const version: string = packageJson.version;

Logger.useDefaults({
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
Logger.setLevel(Logger.INFO);

const log = Logger.get('cli');

const program = new Command();

const logError = (error: Response) => {
	if (error.status && error.statusText) {
		log.error(`${error.status} - ${error.statusText}`);
		void error.text().then(txt => log.error(txt));
	} else {
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
	.option('-c, --cfg <json-yml-file>', 'JSON/YML файл с настройками API', loadObjectFile);

program
	.command('setup')
	.description('Работа с настройками.')
	.option(
		'-j, --json <json-string>',
		'JSON моделька настроек, которые надо установить',
		val => JSON.parse(val) as SetupRequest
	)
	.option(
		'-f, --file <json-yml-file>',
		'JSON/YAML моделька настроек, которые надо установить, взятая из файла',
		loadObjectFile
	)
	.action(args => {
		const api = setupActionAndGetApi(program.opts());
		log.info('Настройки:');
		const json: SetupRequest = args.json ?? args.file;
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
		} else {
			log.info('- получаем');
			api
				.setup({})
				.then(resp => {
					log.info('Готово, настройки получены:', clean(resp));
				})
				.catch(logError);
		}
	});

program
	.command('user')
	.description('Создание нового пользователя или настройка существующего')
	.option(
		'-j, --json <json-string>',
		'JSON модель пользователя, которого нужно создать/настроить',
		val => JSON.parse(val) as UserRequest
	)
	.option('-f, --file <json-yml-file>', 'JSON/YAML модель пользователя, взятая из файла', loadObjectFile)
	.action(args => {
		const api = setupActionAndGetApi(program.opts());
		log.info('Настриваем пользователя:');
		const json: UserRequest = args.json ?? args.file;
		if (json) {
			log.info('- настраиваем', json);
			api
				.user(json)
				.then(resp => {
					log.info('Готово, пользователь настроен:', clean(resp));
				})
				.catch(logError);
		} else {
			log.error('Необходимо задать модель пользователя в параметрах --json или --file');
		}
	});

program
	.command('user-api-password')
	.description('Управление специальным паролем пользователя для API')
	.option(
		'-j, --json <json-string>',
		'JSON модель запроса на работу с API паролем пользователя',
		val => JSON.parse(val) as UserApiPasswordRequest
	)
	.option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса, взятая из файла', loadObjectFile)
	.action(args => {
		const api = setupActionAndGetApi(program.opts());
		log.info('Настриваем API пароль пользователя:');
		const json: UserApiPasswordRequest = args.json ?? args.file;
		if (json) {
			log.info('- настраиваем', json);
			api
				.userApiPassword(json)
				.then(resp => {
					log.info('Готово, API пароль пользователя настроен:', clean(resp));
				})
				.catch(logError);
		} else {
			log.error('Необходимо задать модель запроса в параметрах --json или --file');
		}
	});

program
	.command('check')
	.description('Запуск интерактивной проверки документа')
	.option('-j, --json <json-string>', 'JSON модель запроса на проверку', val => JSON.parse(val) as CheckRequest)
	.option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса на проверку, взятая из файла', loadObjectFile)
	.option(
		'-t, --html <html-file>',
		'HTML файл с текстом на проверку, если указан, то переписывает содержимым файла параметр html запроса',
		loadTextFile
	)
	.action(args => {
		const api = setupActionAndGetApi(program.opts());
		const json: CheckRequest = args.json ?? args.file;
		if (json) {
			if (args.html) {
				json.html = args.html;
			}
			log.info('Начинаем проверку:', _.omit(json, ['html']));
			api
				.check(json)
				.then(resp => {
					log.info('Готово, проверка инициирована:', clean(resp));
				})
				.catch(logError);
		} else {
			log.error('Необходимо задать модель запроса на проверку в параметрах --json или --file');
		}
	});

program
	.command('user-check')
	.description('Запуск интерактивной проверки документа от лица пользователя')
	.option('-j, --json <json-string>', 'JSON модель запроса на проверку', val => JSON.parse(val) as CheckRequest)
	.option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса на проверку, взятая из файла', loadObjectFile)
	.option(
		'-t, --html <html-file>',
		'HTML файл с текстом на проверку, если указан, то переписывает содержимым файла параметр html запроса',
		loadTextFile
	)
	.action(args => {
		const api = setupActionAndGetApi(program.opts());
		const json: CheckRequest = args.json ?? args.file;
		if (json) {
			if (args.html) {
				json.html = args.html;
			}
			log.info('Начинаем проверку:', _.omit(json, ['html']));
			api
				.userCheck(json)
				.then(resp => {
					log.info('Готово, проверка инициирована:', clean(resp));
				})
				.catch(logError);
		} else {
			log.error('Необходимо задать модель запроса на проверку в параметрах --json или --file');
		}
	});

program
	.command('check-ogxt')
	.description('Неинтерактивная проверка документа, запрос, ожидание результатов, запись результатов проверки в файл.')
	.option('-j, --json <json-string>', 'JSON модель запроса на проверку', val => JSON.parse(val) as CheckRequest)
	.option('-f, --file <json-yml-file>', 'JSON/YAML модель запроса на проверку, взятая из файла', loadObjectFile)
	.option(
		'-t, --html <html-file>',
		'HTML файл с текстом на проверку, если указан, то переписывает содержимым файла параметр html запроса',
		loadTextFile
	)
	.option(
		'-o, --ogxt <ogxt-file>',
		'OGXT файл с текстом на проверку, если не указан, то текст для проверки будет сформирован из html текста при помощи ogxt-utils',
		loadTextFile
	)
	.option(
		'-r, --result <path>',
		'Каталог с результатами проверки (будет создан, если не существует), файлы с результатами называются по параметру check, если не указан, то результаты будут сохранены в текущем каталоге'
	)
	.action(args => {
		const api = setupActionAndGetApi(program.opts());
		const json: CheckOgxtRequest = args.json ?? args.file;
		if (args.html) {
			json.html = args.html;
		}
		if (args.ogxt) {
			json.ogxt = args.ogxt;
		}
		if (_.isNil(json.ogxt)) {
			json.ogxt = html2ogxt(json.html);
		}
		log.info('Проверяем текст:', json);
		api
			.checkOgxt(json)
			.then(resp => {
				log.info('Готово, проверка начата:', clean(resp));

				const checkResults = () => {
					log.info('Проверяем готовность проверки...');
					api
						.checkOgxtResults({
							check: resp.check,
						})
						.then(res => {
							log.info('Готовность:', clean(res));
							let result: any = {};
							switch (res.state) {
								case CheckState.CHECKED_SUCCESS:
									log.info('Проверка успешно завершена.');
									result = {
										html: saveTextFile(`${resp.check}.html`, res.html ?? '', args.result),
										annotations: saveTextFile(
											`${resp.check}.annotations.json`,
											JSON.stringify(res.annotations, null, 2),
											args.result
										),
										stats: saveTextFile(`${resp.check}.stats.json`, JSON.stringify(res.stats, null, 2), args.result),
									};
									log.info('Результаты сохранены в файлах', result);
									break;
								case CheckState.ESTIMATED_ERROR:
								case CheckState.ESTIMATED_REJECT:
								case CheckState.CANCELLED:
								case CheckState.REJECTED:
								case CheckState.CHECKED_ERROR:
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
