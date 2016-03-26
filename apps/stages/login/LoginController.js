/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var LoginController = (function () {
        function LoginController() {
            var _this = this;
            //#region Variables
            this.IsLoading = ko.observable(false);
            this.SecretKey = ko.observable("");
            //#endregion
            //#region Page event handlers
            this.HandleLoginEvent = function (context, event) {
                if (!_this.SecretKey()) {
                    Utils.ShowDialog("Error", "You must enter a valid API key or access token to continue.");
                    return;
                }
                _this.IsLoading(true);
                _this.Service = new Stages.AdminSubscriberService(_this.SecretKey());
                //Try to pull in subscribers. If it fails, API key was incorrect.
                var getSubs = _this.Service.GetAsync("subscribed");
                var success = function (subs) {
                    //Save the key in localstorage
                    Utils.LocalStorage.Save("X-Stages-API-Key", _this.SecretKey());
                    var state = {
                        Accounts: subs
                    };
                    //Navigate to home page, passing along the subscriber list
                    Stages.Main.HandleNavigateToSubscribers(_this, state);
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
        //#endregion
        //#region Utility functions
        LoginController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        Object.defineProperty(LoginController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Login";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(LoginController, "PageUrl", {
            /**
            The page's URL, relative from the app root.
            */
            get: function () {
                return "login/login.html";
            },
            enumerable: true,
            configurable: true
        });
        /**
        Defines the controller's WinJS navigation functions.
        */
        LoginController.DefinePage = function () {
            WinJS.UI.Pages.define(LoginController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = new LoginController();
                    //Track the current page
                    Stages.Main.CurrentPage(LoginController.PageId);
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading LoginController.");
                }
            });
        };
        return LoginController;
    }());
    Stages.LoginController = LoginController;
})(Stages || (Stages = {}));
