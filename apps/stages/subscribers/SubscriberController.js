/// <reference path="../../../typings/tsd.d.ts" />
var App;
(function (App) {
    var Stages;
    (function (Stages) {
        var SubscriberController = (function () {
            function SubscriberController(state) {
                var _this = this;
                this.Service = new Stages.AdminSubscriberService(App.Utils.LocalStorage.Retrieve("X-Stages-API-Key"));
                this.SubscribedAccounts = ko.observableArray();
                this.IsLoading = ko.observable(false);
                this.HandleLoadSuccess = function (accounts) {
                    _this.SubscribedAccounts(accounts);
                    _this.IsLoading(false);
                };
                this.HandleLoadFailure = function (error) {
                    _this.IsLoading(false);
                    App.Utils.ShowDialog("Error", "Failed to retrieve subscriber data.");
                };
                this.GravatarHash = function (email) {
                    var hash = md5(email.toLowerCase().trim());
                    return "https://www.gravatar.com/avatar/{hash}?s=100";
                };
                this.HandleAppBarUpdate = function (context, element) {
                    setTimeout(function () {
                        element.style.display = null;
                        element.winControl.forceLayout();
                        WinJS.UI.Animation.slideUp(element);
                    }, 900);
                };
                this.HandleRefreshEvent = function (context, event) {
                    if (!_this.IsLoading()) {
                        _this.IsLoading(true);
                        if (!window.navigator.onLine) {
                            App.Utils.ShowDialog("No internet connection", "It looks like your device does not have an active internet connection. Please try again.");
                            _this.IsLoading(false);
                            return;
                        }
                        _this.Service.GetAsync("subscribed").done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                    }
                };
                this.RegisterKnockoutSubscriptions();
                if (state && state.Accounts) {
                    this.HandleLoadSuccess(state.Accounts);
                    return;
                }
                ;
                this.HandleRefreshEvent();
            }
            SubscriberController.prototype.RegisterKnockoutSubscriptions = function () {
                this.IsLoading.subscribe(function (newValue) {
                    var container = document.getElementById("data-container");
                    WinJS.UI.Animation.enterContent(container);
                });
            };
            Object.defineProperty(SubscriberController, "PageId", {
                get: function () {
                    return "Subscribers";
                },
                enumerable: true,
                configurable: true
            });
            ;
            Object.defineProperty(SubscriberController, "PageUrl", {
                get: function () {
                    return "subscribers/subscribers.html";
                },
                enumerable: true,
                configurable: true
            });
            ;
            SubscriberController.DefinePage = function () {
                WinJS.UI.Pages.define(SubscriberController.PageUrl, {
                    init: function (element, options) {
                    },
                    processed: function (element, options) {
                    },
                    ready: function (element, options) {
                        var client = App.Stages.Main.State.SubscriberController || new SubscriberController(options);
                        App.Stages.Main.CurrentPage(SubscriberController.PageId);
                        App.Stages.Main.State.SubscriberController = client;
                        WinJS.Namespace.define("client", client);
                        ko.applyBindings(client, element);
                    },
                    error: function (err) {
                        alert("Error loading SubscriberController.");
                    },
                });
            };
            SubscriberController.MergeAndRestore = function (lastState) {
                var client = new SubscriberController();
                _.forOwn(lastState, function (value, key) {
                    var clientValue = client[key];
                    if (ko.isObservable(clientValue)) {
                        clientValue(value);
                        return;
                    }
                    ;
                    client[key] = value;
                });
                return client;
            };
            return SubscriberController;
        })();
        Stages.SubscriberController = SubscriberController;
    })(Stages = App.Stages || (App.Stages = {}));
})(App || (App = {}));
//# sourceMappingURL=SubscriberController.js.map