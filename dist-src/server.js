"use strict";

var _http = require("http");

var _index = _interopRequireDefault(require("./index.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var port = process.env.port || 4000;
var server = (0, _http.createServer)(_index["default"]);
server.listen(port);