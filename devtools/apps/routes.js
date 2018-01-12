/* eslint no-console: 0 */
const handleConfigureRoutes = require('./api/configure')
const handleComponentRoutes = require('./api/component')
const handleDirectoryRoutes = require('./api/directory')
const express = require('express')
const path = require('path')
const rimraf = require('rimraf')
const fs = require('fs')
const config = require('../webpack.config.config')
const configurationFile = './devtools/projectconfig.json'

function handleRoutes (app) {
  // cors
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '"Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  // exit server
  app.get('/exit', () => { console.log('Server Exit.'); process.exit(0) })

  // Error occured. Start from the beginning
  app.get('/clean', (req, res) => {
    let src = config.sourceDir
    if (
      typeof src === 'undefined' ||
      src.indexOf(':') !== -1
    ) {
      console.log(`Invalid src path,  src path=${src}`)
      return
    }
    while (src.charAt(0) === '.' || src.charAt(0) === '/' || src.charAt(0) === '\\') {
      src = src.slice(1)
    }
    if (src === '') {
      console.log(`Invalid src path,  src path=${src}`)
      return
    }
    try {
      fs.unlinkSync(configurationFile)
      src = path.join(process.cwd(), src)
      rimraf.sync(src)
    } catch (ex) {
    }

    res.send({ success: true })
  })

  // scripts
  const scriptPath = path.join(__dirname, 'scripts')
  app.use('/scripts', express.static(scriptPath))

  // root
  app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname})
  })

  // other routes
  handleConfigureRoutes(app)
  handleComponentRoutes(app)
  handleDirectoryRoutes(app)
}

module.exports = handleRoutes
