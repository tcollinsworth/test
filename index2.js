const app = require('express')()

app.get('/', getWidget)

app.listen(3000, () => console.log('Listening on 3000!'))

function getWidget(req, resp) {
  resp.json(createWidget(123, 'top', true))
}

const myList = []
const myMap = {}

function createWidget(id, name, inStock) {
  return {
    id, // auto-expanded into "id":123
    name,
    inStock,
  }
}

$ curl -i http://localhost:3000
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 38
ETag: W/"26-CwQuUeAn9KRpLMWrdtCgV9vI56o"
Date: Tue, 14 Nov 2017 23:30:30 GMT
Connection: keep-alive

{"id":123,"name":"top","inStock":true}
