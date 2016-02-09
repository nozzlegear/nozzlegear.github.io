/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
/// <reference path="./../../../lib/custom/ConvertKitClient/ConvertKit.ts" />
var ConvertKit;
(function (ConvertKit) {
    var LoginController = (function () {
        function LoginController() {
            var _this = this;
            this.IsLoading = ko.observable(false);
            this.SecretKey = ko.observable("");
            this.HandleLoginEvent = function (context, event) {
                if (!_this.SecretKey()) {
                    Utils.ShowDialog("Error", "You must enter a valid API key or access token to continue.");
                    return;
                }
                _this.IsLoading(true);
                _this.Service = new ConvertKit.SubscriberService(_this.SecretKey());
                var getSubs = _this.Service.GetAsync();
                var success = function (resp) {
                    Utils.LocalStorage.Save(ConvertKit.Strings.SecretKeyId, _this.SecretKey());
                    var state = {
                        SubscriberList: resp
                    };
                    ConvertKit.Main.HandleNavigateToSubscribers(_this, state);
                };
                var fail = function (reason) {
                    console.log("Failed to get subscribers. Reason: ", reason);
                    Utils.ShowDialog("Error", "It looks like your secret key or access token is invalid. Please try again.");
                    _this.IsLoading(false);
                };
                getSubs.done(success, fail);
            };
            this.RegisterKnockoutSubscriptions();
        }
        LoginController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        Object.defineProperty(LoginController, "PageId", {
            get: function () {
                return "Login";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(LoginController, "PageUrl", {
            get: function () {
                return "login/login.html";
            },
            enumerable: true,
            configurable: true
        });
        LoginController.DefinePage = function () {
            WinJS.UI.Pages.define(LoginController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = new LoginController();
                    ConvertKit.Main.CurrentPage(LoginController.PageId);
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading LoginController.");
                }
            });
        };
        return LoginController;
    })();
    ConvertKit.LoginController = LoginController;
})(ConvertKit || (ConvertKit = {}));
//# sourceMappingURL=logincontroller.js.map