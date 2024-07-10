"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import libs
var qs_1 = __importDefault(require("qs"));
// Import other CACCL libs
var caccl_error_1 = __importDefault(require("caccl-error"));
// Import shared types
var ErrorCode_1 = __importDefault(require("./ErrorCode"));
var ResponseType_1 = __importDefault(require("./ResponseType"));
/**
 * Sends and retries an http request
 * @author Gabriel Abrams
 * @param opts object containing all arguments
 * @param opts.path path to send request to
 * @param [opts.host] host to send request to
 * @param [opts.method=GET] http method to use
 * @param [opts.params] body/data to include in the request
 * @param [opts.headers] headers to include in the request
 * @param [opts.numRetries=0] number of times to retry the request if it
 *   fails
 * @param [opts.sendCrossDomainCredentials=true if in development mode] if true,
 *   send cross-domain credentials even if not in dev mode
 * @param [opts.responseType=ResponseType.JSON] expected response type
 * @returns { body, status, headers } on success
 */
var sendRequest = function (opts) { return __awaiter(void 0, void 0, void 0, function () {
    var thisIsDev, sendCrossDomainCredentials, numRetries, method, params, stringifiedParams, query, url, headers, data, encodedData, response, responseHeaders_1, responseBody, _a, err_1, err_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                thisIsDev = (opts.host === 'localhost:8080');
                sendCrossDomainCredentials = !!(opts.sendCrossDomainCredentials
                    || thisIsDev
                    || ((_b = opts.headers) === null || _b === void 0 ? void 0 : _b.credentials) === 'include');
                numRetries = (opts.numRetries ? opts.numRetries : 0);
                method = (opts.method || 'GET');
                if (opts.params) {
                    params = {};
                    Object.entries(opts.params).forEach(function (_a) {
                        var key = _a[0], val = _a[1];
                        if (typeof val === 'object' && !Array.isArray(val)) {
                            params[key] = JSON.stringify(val);
                        }
                        else {
                            params[key] = val;
                        }
                    });
                }
                stringifiedParams = qs_1.default.stringify(params || {}, {
                    encodeValuesOnly: true,
                    arrayFormat: 'brackets',
                });
                query = (method === 'GET' ? "?".concat(stringifiedParams) : '');
                if (!opts.host) {
                    // No host included at all. Just send to a path
                    url = "".concat(opts.path).concat(query);
                }
                else {
                    url = "https://".concat(opts.host).concat(opts.path).concat(query);
                }
                headers = opts.headers || {};
                data = null;
                if (!headers['Content-Type']) {
                    // Form encoded
                    headers['Content-Type'] = 'application/x-www-form-urlencoded';
                    // Add data if applicable
                    data = (method !== 'GET' ? stringifiedParams : null);
                }
                else {
                    // JSON encode
                    data = params;
                }
                if (data) {
                    if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
                        encodedData = new URLSearchParams(params);
                    }
                    else {
                        encodedData = JSON.stringify(data);
                    }
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 11, , 12]);
                return [4 /*yield*/, fetch(url, {
                        method: method,
                        mode: 'cors',
                        headers: headers !== null && headers !== void 0 ? headers : {},
                        body: ((method !== 'GET' && encodedData)
                            ? encodedData
                            : undefined),
                        credentials: (sendCrossDomainCredentials
                            ? 'include'
                            : 'same-origin'),
                        redirect: 'follow',
                        referrerPolicy: (sendCrossDomainCredentials ? 'origin' : undefined),
                    })];
            case 2:
                response = _c.sent();
                responseHeaders_1 = {};
                response.headers.forEach(function (value, key) {
                    responseHeaders_1[key] = value;
                });
                responseBody = void 0;
                _c.label = 3;
            case 3:
                _c.trys.push([3, 9, , 10]);
                _a = opts.responseType;
                switch (_a) {
                    case ResponseType_1.default.Text: return [3 /*break*/, 4];
                    case ResponseType_1.default.JSON: return [3 /*break*/, 6];
                }
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, response.text()];
            case 5:
                responseBody = _c.sent();
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, response.json()];
            case 7:
                responseBody = _c.sent();
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 10];
            case 9:
                err_1 = _c.sent();
                throw new caccl_error_1.default({
                    message: "Failed to parse response as ".concat(opts.responseType, ": ").concat(err_1 === null || err_1 === void 0 ? void 0 : err_1.message),
                    code: ErrorCode_1.default.ResponseParseError,
                });
            case 10: return [3 /*break*/, 12];
            case 11:
                err_2 = _c.sent();
                // Request failed! Check if we have more attempts
                if (numRetries > 0) {
                    // Update opts with one less retry
                    return [2 /*return*/, sendRequest(__assign(__assign({}, opts), { numRetries: opts.numRetries - 1 }))];
                }
                // Self-signed certificate error:
                if (err_2.message.includes('self signed certificate')) {
                    throw new caccl_error_1.default({
                        message: 'We refused to send a request because the receiver has self-signed certificates.',
                        code: ErrorCode_1.default.SelfSigned,
                    });
                }
                // No tries left
                throw new caccl_error_1.default({
                    message: "We encountered an error when trying to send a network request. If this issue persists, contact an admin. Error: ".concat(err_2 === null || err_2 === void 0 ? void 0 : err_2.message),
                    code: ErrorCode_1.default.NotConnected,
                });
            case 12: return [2 /*return*/];
        }
    });
}); };
exports.default = sendRequest;
//# sourceMappingURL=index.js.map