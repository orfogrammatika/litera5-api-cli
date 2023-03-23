import { OptionValues } from 'commander';
import fs from 'fs';
import Logger from 'js-logger';
import yaml from 'js-yaml';
import _ from 'lodash';
import { Config } from './models';
import { createApi, Litera5Api } from 'litera5-api-js-client';

const log = Logger.get('cli');

export function loadTextFile(path: string): string {
	const data = fs.readFileSync(`${process.cwd()}/${path}`);
	return data.toString();
}

export function saveTextFile(name: string, content: string, path?: string): string {
	const filePath = `${path ?? process.cwd()}/${name}`;
	fs.writeFileSync(filePath, content);
	return filePath;
}

export function loadObjectFile(path: string): unknown {
	let result: unknown = {};
	const lpath = path.toLowerCase();
	const str = loadTextFile(path);
	if (lpath.endsWith('.json')) {
		result = JSON.parse(str);
	} else if (lpath.endsWith('.yaml') || lpath.endsWith('.yml')) {
		result = yaml.load(str);
	}
	return result;
}

export function loadConfigFromOpts(opts: any): Config {
	const result: Config = {
		url: 'https://litera5.ru',
		client: '',
		secret: '',
	};
	if (_.has(opts, 'cfg')) {
		if (_.has(opts.cfg, 'url')) {
			result.url = opts.cfg.url;
		}
		if (_.has(opts.cfg, 'client')) {
			result.client = opts.cfg.client;
		}
		if (_.has(opts.cfg, 'secret')) {
			result.secret = opts.cfg.secret;
		}
		if (_.has(opts.cfg, 'userPassword')) {
			result.userPassword = opts.cfg.userPassword;
		}
	}
	if (_.has(opts, 'url')) {
		result.url = opts.url;
	}
	if (_.has(opts, 'client')) {
		result.client = opts.client;
	}
	if (_.has(opts, 'secret')) {
		result.secret = opts.secret;
	}
	if (_.has(opts, 'userPassword')) {
		result.userPassword = opts.userPassword;
	}
	return result;
}

export function setupActionAndGetApi(opts: OptionValues): Litera5Api {
	if (opts.debug) {
		Logger.setLevel(Logger.DEBUG);
	} else {
		Logger.setLevel(Logger.INFO);
	}

	const cfg = loadConfigFromOpts(opts);

	log.debug('Options:', opts);

	log.debug('Configuration:', cfg);

	return createApi(
		{
			company: cfg.client,
			secret: cfg.secret,
			url: cfg.url,
			userApiPassword: cfg.userPassword,
		},
		Logger.getLevel()
	);
}

export function clean(obj: any): any {
	return _.omit(obj, ['time', 'signature']);
}
