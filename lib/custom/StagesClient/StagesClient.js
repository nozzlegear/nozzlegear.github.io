var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../../typings/tsd.d.ts" />
var Stages;
(function (Stages) {
    /**
    A generic Stages service, used by all other services. You should not be using this directly.
    */
    var _Service = (function () {
        function _Service(_AccessToken) {
            this._AccessToken = _AccessToken;
        }
        Object.defineProperty(_Service.prototype, "_BaseUrl", {
            /**
            The base URL for all requests.
            */
            get: function () { return "https://getstages.com/api/"; },
            enumerable: true,
            configurable: true
        });
        ;
        //#region Utility functions
        /**
        Builds headers for a request, including the Content-Type header.
        */
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
        /**
        Creates a webrequest to the given path and appends the client's SecretKey.
        */
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
        /**
        * Finishes a web request and automatically resolves or rejects it. Pass an optional callback to receive the
        * response's string content and the promise resolver.
        * @param message The web request method.
        * @param resolve The promise resolver.
        * @param reject The promise rejecter.
        * @param callback Optional callback. Receives the response's string content. Promise resolver will not be called when this callback is used.
        */
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
    }());
    /**
    * A service for interacting with the Stages subscribers API.
    */
    var AdminSubscriberService = (function (_super) {
        __extends(AdminSubscriberService, _super);
        function AdminSubscriberService(accessToken) {
            var _this = this;
            _super.call(this, accessToken);
            /**
             * Retrieves a list of Stages accounts with the given status.
             * @param {string = "all"} status The status of accounts to retrieve. Valid values are 'all' or 'subscribed'.
             * @returns The list of Stages subscribers.
             */
            this.GetAsync = function (status) {
                if (status === void 0) { status = "all"; }
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest("GET", "admin/subscribers?status=" + status);
                    _this.FinishRequest(message, resolve, reject);
                });
            };
            /**
            * Retrieves a count of Stages subscribers with the given status.
            * @param {string = "all"} status The status of accounts to retrieve. Valid values are 'all' or 'subscribed'.
            * @returns The count of Stages subscribers with the given status.
            */
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
    }(_Service));
    Stages.AdminSubscriberService = AdminSubscriberService;
    /**
    A service for interacting with the admin/financials API.
    */
    var AdminFinancialService = (function (_super) {
        __extends(AdminFinancialService, _super);
        function AdminFinancialService(accessToken) {
            var _this = this;
            _super.call(this, accessToken);
            /**
            * Retrieves a list of Stages accounts.
            */
            this.GetAsync = function () {
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest("GET", "admin/financials");
                    _this.FinishRequest(message, resolve, reject);
                });
            };
        }
        return AdminFinancialService;
    }(_Service));
    Stages.AdminFinancialService = AdminFinancialService;
})(Stages || (Stages = {}));
