import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const env = {
	API_BASE_URL: process.env.API_BASE_URL || '',
	ONLYOFFICE_JS_URL: process.env.ONLYOFFICE_JS_URL || '',
	SUPPORTED_TYPES_VERSION: process.env.SUPPORTED_TYPES_VERSION || ''
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '../static/env.js');
fs.writeFileSync(outPath, `window.__env = ${JSON.stringify(env, null, 2)};\n`);
