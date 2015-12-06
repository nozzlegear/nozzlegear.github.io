var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../../typings/tsd.d.ts" />
var App;
(function (App) {
    var Stages;
    (function (Stages) {
        var _Service = (function () {
            function _Service(_AccessToken) {
                this._AccessToken = _AccessToken;
            }
            Object.defineProperty(_Service.prototype, "_BaseUrl", {
                get: function () { return "https://getstages.com/api/"; },
                enumerable: true,
                configurable: true
            });
            ;
            _Service.prototype.BuildRequestHeaders = function (contentType, extraHeaders) {
                if (extraHeaders === void 0) { extraHeaders = {}; }
                var headers = _.extend({
                    "Content-Type": contentType,
                    "X-Stages-Access-Token": this._AccessToken,
                    "X-Stages-API-Version": "1",
                    "Accept": "application/json"
                }, extraHeaders);
                return headers;
            };
            ;
            _Service.prototype.CreateRequest = function (method, path, data) {
                var req = reqwest({
                    url: this._BaseUrl + path,
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
        var AdminSubscriberService = (function (_super) {
            __extends(AdminSubscriberService, _super);
            function AdminSubscriberService(accessToken) {
                var _this = this;
                _super.call(this, accessToken);
                this.GetAsync = function (status) {
                    if (status === void 0) { status = "all"; }
                    return new WinJS.Promise(function (resolve, reject) {
                        var message = _this.CreateRequest("GET", "admin/subscribers?status=" + status);
                        _this.FinishRequest(message, resolve, reject);
                    });
                };
                this.CountAsync = function (status) {
                    if (status === void 0) { status = "all"; }
                    return new WinJS.Promise(function (resolve, reject) {
                        var message = _this.CreateRequest("GET", "admin/subscribers/count?status=" + status);
                        _this.FinishRequest(message, resolve, reject, function (content) {
                            resolve(content.count);
                        });
                    });
                };
            }
            return AdminSubscriberService;
        })(_Service);
        Stages.AdminSubscriberService = AdminSubscriberService;
        var AdminFinancialService = (function (_super) {
            __extends(AdminFinancialService, _super);
            function AdminFinancialService(accessToken) {
                var _this = this;
                _super.call(this, accessToken);
                this.GetAsync = function () {
                    return new WinJS.Promise(function (resolve, reject) {
                        var message = _this.CreateRequest("GET", "admin/financials");
                        _this.FinishRequest(message, resolve, reject);
                    });
                };
            }
            return AdminFinancialService;
        })(_Service);
        Stages.AdminFinancialService = AdminFinancialService;
    })(Stages = App.Stages || (App.Stages = {}));
})(App || (App = {}));
//# sourceMappingURL=StagesClient.js.map