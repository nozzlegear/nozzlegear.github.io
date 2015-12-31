/// <reference path="../../../typings/tsd.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ConvertKit;
(function (ConvertKit) {
    var _Service = (function () {
        function _Service(_SecretKey) {
            this._SecretKey = _SecretKey;
        }
        Object.defineProperty(_Service.prototype, "_BaseUrl", {
            get: function () { return "https://api.convertkit.com/v3/"; },
            enumerable: true,
            configurable: true
        });
        ;
        _Service.prototype.BuildRequestHeaders = function (contentType, extraHeaders) {
            if (extraHeaders === void 0) { extraHeaders = {}; }
            var headers = _.extend({
                "Content-Type": contentType,
                "Accept": "application/json"
            }, extraHeaders);
            return headers;
        };
        ;
        _Service.prototype.CreateRequest = function (method, path, data) {
            var req = reqwest({
                url: this._BaseUrl + path + '?api_secret=' + this._SecretKey,
                method: method,
                data: data && JSON.stringify(data) || null,
                headers: this.BuildRequestHeaders("application/json"),
                contentType: "application/json"
            });
            return req;
        };
        ;
        _Service.prototype.FinishRequest = function (req, resolve, reject, callback) {
            if (callback === void 0) { callback = null; }
            req.fail(reject);
            req.then(function (resp) {
                if (req.request.status > 205 || req.request.status < 200) {
                    reject("Response for request did not indicate success. Status code: " + req.request.status + ".");
                    return;
                }
                ;
                if (!callback) {
                    resolve(resp);
                    return;
                }
                callback(resp);
            });
        };
        ;
        return _Service;
    })();
    var SubscriberService = (function (_super) {
        __extends(SubscriberService, _super);
        function SubscriberService(secretKey) {
            var _this = this;
            _super.call(this, secretKey);
            this.GetAsync = function (page) {
                if (page === void 0) { page = 1; }
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest("GET", "subscribers");
                    _this.FinishRequest(message, resolve, reject);
                });
            };
        }
        return SubscriberService;
    })(_Service);
    ConvertKit.SubscriberService = SubscriberService;
    var FormService = (function (_super) {
        __extends(FormService, _super);
        function FormService(secretKey) {
            var _this = this;
            _super.call(this, secretKey);
            this.GetAsync = function (page) {
                if (page === void 0) { page = 1; }
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest("GET", "forms");
                    _this.FinishRequest(message, resolve, reject);
                });
            };
        }
        return FormService;
    })(_Service);
    ConvertKit.FormService = FormService;
})(ConvertKit || (ConvertKit = {}));
//# sourceMappingURL=ConvertKit.js.map