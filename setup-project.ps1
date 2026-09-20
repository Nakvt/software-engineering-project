$ErrorActionPreference = 'Stop'

Write-Host 'Khoi tao du an Node.js thuyet minh tu dong da ngon ngu...' -ForegroundColor Cyan

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw 'Khong tim thay npm. Hay cai Node.js truoc khi chay script.'
}

npm init -y
npm install express pg dotenv cors swagger-ui-express yamljs
npm install --save-dev nodemon eslint prettier

$directories = @(
    'src',
    'src/controllers',
    'src/services',
    'src/repositories',
    'src/routes',
    'src/config',
    'src/docs'
)

foreach ($directory in $directories) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

@'
require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API server dang chay tai http://localhost:${port}`);
});
'@ | Set-Content -Path 'src/server.js' -Encoding utf8

@'
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

module.exports = app;
'@ | Set-Content -Path 'src/app.js' -Encoding utf8

@'
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'poi_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

module.exports = pool;
'@ | Set-Content -Path 'src/config/db.js' -Encoding utf8

@'
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=poi_db
DB_USER=postgres
DB_PASSWORD=change_me
'@ | Set-Content -Path '.env' -Encoding utf8

@'
node_modules/
.env
npm-debug.log*
*.log
coverage/
dist/
.vscode/
'@ | Set-Content -Path '.gitignore' -Encoding utf8

npm pkg set scripts.start='node src/server.js'
npm pkg set scripts.dev='nodemon src/server.js'
npm pkg set scripts.lint='eslint .'
npm pkg set scripts.format='prettier --write .'

Write-Host 'Khoi tao thanh cong.' -ForegroundColor Green
Write-Host 'Chay API phat trien: npm run dev' -ForegroundColor Yellow
Write-Host 'Kiem tra lint: npm run lint' -ForegroundColor Yellow