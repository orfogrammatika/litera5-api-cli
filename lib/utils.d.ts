import { OptionValues } from 'commander';
import { Config } from './models';
import { Litera5Api } from 'litera5-api-js-client';
export declare function loadTextFile(path: string): string;
export declare function saveTextFile(name: string, content: string, path?: string): void;
export declare function loadObjectFile(path: string): unknown;
export declare function loadConfigFromOpts(opts: any): Config;
export declare function setupActionAndGetApi(opts: OptionValues): Litera5Api;
export declare function clean(obj: any): any;
