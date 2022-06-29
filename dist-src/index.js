"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
app.use((0, _morgan["default"])("combined"));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use((0, _cookieParser["default"])()); //handling CORS error

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (res.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST,PUT,GET,DELETE,PATCH");
    res.status(200).json({});
  }

  next();
});
app.get("/", function (req, res, next) {
  res.status(200).json({
    message: "Welcome to Coffee-N-Meet"
  });
});
var _default = app;
exports["default"] = _default;