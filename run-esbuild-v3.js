/**
 * Ok! Goal: faster and configurable file-watcher.
 * Ok! Goal: load files from a buffer.
 * Goal: works with virtual files.
 */
const chokidar = require('chokidar');

const path = require('path');
const fs = require('fs');
const http = require('http');
const { exec } = require('child_process');

const { build } = require('esbuild');
const { WebSocketServer } = require('ws');

const log = console.log;

let timeStamp = new Date().getTime();

let dryRun = true;

let cssCache = '';

const sass = require('sass');

let angularSettings = {};

const outDir = path.join(__dirname, 'dist/esbuild');

const componentBuffer = {};

const getValueByPattern = (regex = new RegExp(''), str = '') => {
  let m;
  let results = [];

  while ((array1 = regex.exec(str)) !== null) {
    results.push(array1[1]);
  }

  return results.pop();
};

const addInjects = (contents) => {
  if (/constructor *\(([^\)]*)/gm.test(contents)) {
    let requireInjectImport = false;
    const matches = contents.matchAll(/constructor *\(([^\)]*)/gm);
    for (let match of matches) {
      if (match[1] && /\:/gm.test(match[1])) {
        requireInjectImport = true;
        let flat = match[1].replace(/[\n\r]/gm, '');
        const flatArray = flat.split(',').map(inject => {
          const parts = inject.split(':');
          return parts.length === 2
            ? `@Inject(${parts[1]}) ${inject}`
            : inject;
        });

        contents = contents.replace(
          /constructor *\([^\)]*\)/gm,
          `constructor(${flatArray.join(',')})`
        );
      }
    }

    if (requireInjectImport && !/Inject[ ,\}\n\r].*'@angular\/core.*\;/.test(contents)) {
      contents = `import { Inject } from '@angular/core';\n\r${contents}`;
    }

  }

  return contents;
};

const copyDir = async (src, dest) => {
  await fs.promises.mkdir(dest, { recursive: true });
  let entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    entry.isDirectory() ?
      await copyDir(srcPath, destPath) :
      await fs.promises.copyFile(srcPath, destPath);
  }
};

const isScss = (cssPath) => /\.scss$/.test(cssPath);

const scssProcessor = async scssPath => {
  const workDir = path.dirname(scssPath);

  const result = sass.renderSync({
    file: scssPath,
    includePaths: [workDir],
  });

  let cssContent = result.css.toString();

  const matches = cssContent.matchAll(/url\(['"]?([^\)'"\?]*)[\"\?\)]?/gm);
  for (let match of matches) {
    if (!/data\:/.test(match[0])) {
      try {
        const sourcePath = path.join(workDir, match[1]);
        const fileName = path.basename(sourcePath);
        const targetPath = path.join(outDir, fileName);
        fs.copyFileSync(
          sourcePath,
          targetPath,
        );
        cssContent = cssContent.replace(match[1], fileName);
      } catch (e) {
        console.error('ERROR: ', e);
      }
    }
  }

  cssCache += `\n\n${cssContent}`;
};

const cssProcessor = async cssPath => {
  const result = await fs.promises.readFile(cssPath, 'utf8');
  cssCache += `\n\n${result}`;
};

const minimalLiveServer = (root = process.cwd(), port = 4200, socketPort = 8080) => {

  const wss = new WebSocketServer({ port: socketPort });
  wss.on('connection', function connection(ws) {
    ws.on('message', function message(data) {
      console.log('received: %s', data);
    });

    ws.send('Esbuild live server started');
  });

  const broadcast = message => {
    wss.clients.forEach(function each(client) {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  };

  const clientScript = `<script>
    const ws = new WebSocket('ws://127.0.0.1:8080');
    ws.onmessage = m => {
      if (m.data === 'location:refresh') {
        location.reload();
      }
    }
  </script>`;

  const server = http.createServer(async (request, response) => {

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, PATCH, DELETE",
      "Access-Control-Max-Age": 0, // No Cache
    };

    let isIndexPage = false;

    let filePath = '.' + request.url;
    if (filePath == './') {
      filePath = path.join(__dirname, root, 'index.html');
      isIndexPage = true;
    } else {
      filePath = path.join(__dirname, root, request.url);
      isIndexPage = false;
    }

    filePath = filePath.split('?')[0];

    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';
    const encoding = ['.html', '.js', '.css'].includes(extname)
      ? 'utf8'
      : null;

    try {
      let content = await fs.promises.readFile(filePath, encoding);
      response.writeHead(200, ({ ...headers, 'Content-Type': contentType }));
      if (isIndexPage) {
        content = content.replace(/\<\/body\>/g, `${clientScript}\n</body>`);
      }
      response.end(content);
    } catch (e) {
      if (e.code == 'ENOENT') {
        response.writeHead(404, ({ ...headers, 'Content-Type': 'text/html' }));
        response.end('Page Not Found!', 'utf8');
      } else {
        response.writeHead(500);
        response.end('Sorry, check with the site admin for error: ' + e.code + ', ' + e);
      }
    }

  }).listen(4200);
  console.log(`Angular running at http://127.0.0.1:${port}/`);

  const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
  exec(start + ` http://127.0.0.1:${port}/`);

  return {
    server,
    wss,
    broadcast,
  };
};


const times = [new Date().getTime(), new Date().getTime()];

let convertMessage = ({ message, start, end }) => {
  let location
  if (start && end) {
    let lineText = source.split(/\r\n|\r|\n/g)[start.line - 1]
    let lineEnd = start.line === end.line ? end.column : lineText.length
    location = {
      file: filename,
      line: start.line,
      column: start.column,
      length: lineEnd - start.column,
      lineText,
    }
  }
  return { text: message, location }
}

const zoneJsPlugin = {
  name: "zoneJs",
  setup(build) {
    const fs = require('fs');
    build.onLoad({ filter: /main\.ts$/ }, async (args) => {
      try {
        if (!lastUpdatedFileList.includes(args.path) && componentBuffer[args.path]) {
          return { contents: componentBuffer[args.path], loader: 'ts' };
        }

        const source = await fs.promises.readFile(args.path, 'utf8');
        const contents = `import 'zone.js';\n${source}`;
        componentBuffer[args.path] = contents;
        return { contents, loader: 'ts' };
      } catch (e) {
        return { errors: [convertMessage(e)] }
      }
    });
  },
};

const indexFileProcessor = {
  name: 'indexProcessor',
  async setup(build) {
    build.onStart(async () => {
      let path = require('path');
      let fs = require('fs');

      const distPath = path.join(__dirname, 'dist');
      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
      }

      const esbuildPath = path.join(__dirname, 'dist/esbuild');
      if (!fs.existsSync(esbuildPath)) {
        fs.mkdirSync(esbuildPath);
      }

      let indexFileContent = await fs.promises.readFile(
        path.join(__dirname, 'src/index.html'),
        'utf8',
      );

      indexFileContent = indexFileContent.replace(
        /\<\/body\>/gm,
        `<script data-version="0.2" src="vendor.js"></script>
        <script data-version="0.2" src="main.js"></script>
        </body>`
      );

      indexFileContent = indexFileContent.replace(
        /\<\/head\>/gm,
        `<link rel="stylesheet" href="main.css">
        </head>`
      );

      await fs.promises.writeFile(
        path.join(__dirname, 'dist/esbuild/index.html'),
        indexFileContent,
        'utf8',
      );
    });
  }
};

let angularComponentDecoratorPlugin = {
  name: 'angularComponentProcessor',
  async setup(build) {
    const fs = require('fs');

    build.onLoad({ filter: /src.*\.(component|pipe|service)\.ts$/ }, async (args) => {
      // const filename = path.relative(process.cwd(), args.path);

      if (!lastUpdatedFileList.includes(args.path) && componentBuffer[args.path]) {
        return { contents: componentBuffer[args.path], loader: 'ts' };
      }

      // Load the file from the file system
      let source = await fs.promises.readFile(args.path, 'utf8');

      // Convert Svelte syntax to JavaScript
      try {

        let contents = source;

        const templateUrl = getValueByPattern(/^ *templateUrl *\: *['"]*([^'"]*)/gm, source);

        if (/^ *templateUrl *\: *['"]*([^'"]*)/gm.test(contents)) {
          contents = `
          import templateSource from '${templateUrl}';
          ${contents}`;
        }

        if (/^ *styleUrls *\: *\[['"]([^'"\]]*)/gm.test(contents)) {
          const styleUrls = getValueByPattern(
            /^ *styleUrls *\: *\[['"]([^'"\]]*)/gm,
            source
          );
          if (isScss(styleUrls)) {
            await scssProcessor(args.path.replace(/\.ts$/, '.scss'));
          } else {
            await cssProcessor(args.path.replace(/\.ts$/, '.css'));
          }
        }

        contents = addInjects(contents);

        contents = contents.replace(
          /^ *templateUrl *\: *['"]*([^'"]*)['"]/gm,
          "template: templateSource || ''"
        );

        contents = contents.replace(
          /^ *styleUrls *\: *\[['"]([^'"\]]*)['"]\]\,*/gm, ''
        );

        componentBuffer[args.path] = contents;

        return { contents, loader: 'ts' };
      } catch (e) {
        return { errors: [convertMessage(e)] }
      }
    });
  },
};

const settingsResolver = {
  name: 'angularSettingsResolver',
  async setup(build) {
    if (!dryRun ) {
      return;
    }

    angularSettings = JSON.parse(await fs.promises.readFile(
      path.join(__dirname, 'angular.json'),
      'utf8',
    ));
  }
};

const cssResolver = {
  name: 'angularCSSProcessor',
  async setup(build) {
    build.onEnd(async () => {
      if (!dryRun ) {
        return;
      }

      let cache = '';

      const project = Object.entries(angularSettings.projects)[0][1];
      const baseStylePaths = project.architect.build.options.styles;
      baseStylePaths.forEach((item = '') => {
        const itemPath = item.includes('/')
          ? path.join(__dirname, item)
          : path.join(__dirname, 'src', item);
        scssProcessor(itemPath);
      });

      const cssOutputPath = path.join(__dirname, `dist/esbuild/main.css`);
      await fs.promises.writeFile(cssOutputPath, cssCache, 'utf8');
    });
  }
};

const jsResolver = {
  name: 'angularVendorJSResolver',
  async setup(build) {
    build.onEnd(async () => {
      if (!dryRun) {
        return;
      }

      let cache = '';

      const project = Object.entries(angularSettings.projects)[0][1];
      const baseStylePaths = project.architect.build.options.scripts;
      baseStylePaths.forEach((item = '') => {
        const itemPath = item.includes('/')
          ? path.join(__dirname, item)
          : path.join(__dirname, 'src', item);
        const content = fs.readFileSync(itemPath, 'utf8');
        cache += `\n\n${content}`;
      });

      const jsOutputPath = path.join(__dirname, `dist/esbuild/vendor.js`);
      await fs.promises.writeFile(jsOutputPath, cache, 'utf8');
    });
  }
};

const assetsResolver = {
  name: 'angularAssestsResolver',
  async setup(build) {
    if ( !lastUpdatedFileList.find(f => /src\\assets|src\/assets/.test(f)) && !dryRun ) {
      return;
    }

    await copyDir(
      path.join(__dirname, 'src/assets'),
      path.join(__dirname, 'dist/esbuild/assets'),
    );
    await fs.promises.copyFile(
      path.join(__dirname, 'src/favicon.ico'),
      path.join(__dirname, 'dist/esbuild/favicon.ico'),
    );
  }
};

let liveServerIsRunning = false;
let buildInProgress = false;
let minimalServer = null;
let lastUpdatedFileList = [];
const builder = () => {
  buildInProgress = true;
  build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outfile: `dist/esbuild/main.js`,
    treeShaking: true,
    loader: {
      '.html': 'text',
      '.css': 'text',
    },
    sourcemap: true,
    minify: true,
    plugins: [
      settingsResolver,
      indexFileProcessor,
      zoneJsPlugin,
      angularComponentDecoratorPlugin,
      cssResolver,
      jsResolver,
      assetsResolver,
    ],
  }).then(async (result) => {
    if (!liveServerIsRunning) {
      minimalServer = minimalLiveServer('dist/esbuild/');
      liveServerIsRunning = true;
    }
    buildInProgress = false;
    minimalServer.broadcast('location:refresh');
    lastUpdatedFileList = [];
    cssCache = '';
    dryRun = false;

    times[1] = new Date().getTime();
    log(`EsBuild complete in ${times[1] - times[0]}ms`);
  });
};

let buildTimeout = 0;
const startBuild = (filePath = '') => {
  if (filePath) {
    lastUpdatedFileList.push(
      path.join(process.cwd(), filePath)
    );
  }

  clearTimeout(buildTimeout);

  if (buildInProgress) {
    return;
  }

  buildTimeout = setTimeout( () => {
    clearTimeout(buildTimeout);
    times[0] = new Date().getTime();
    builder();
  }, 500);
}


const watcher = chokidar.watch(['src/**/*.(css|scss|less|sass|js|ts|tsx|html)'], {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
});
watcher
  .on('add', filePath => startBuild(filePath))
  .on('change', filePath => startBuild(filePath))
  .on('unlink', filePath => startBuild());

