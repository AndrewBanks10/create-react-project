/* eslint no-console: 0 */
const express = require('express')
const app = express()

const port = process.env.PORT || 3001
const host = process.env.HOST || 'localhost'

if (typeof process.env.PUBLIC_PATH === 'undefined') {
  throw new Error('process.env.PUBLIC_PATH is not set.')
}

app.use(express.static(process.env.PUBLIC_PATH))

// Remove the STARTPROXY comment below if you customized your proxy definitions so that the configure program
// does not overwrite it.
// STARTPROXY
// ENDPROXY

try {
  app.listen(port, host, function () {
    console.log(`devtools/pserver.js listening at http://${host}:${port}.`)
  })
} catch (ex) {
  console.log(`Server error ${ex}.`)
}
