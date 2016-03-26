/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var SubscriberController = (function () {
        function SubscriberController(state) {
            var _this = this;
            //#region Variables
            this.Service = new Stages.AdminSubscriberService(Utils.LocalStorage.Retrieve("X-Stages-API-Key"));
            this.SubscribedAccounts = ko.observableArray();
            this.IsLoading = ko.observable(false);
            this.HandleLoadSuccess = function (accounts) {
                _this.SubscribedAccounts(accounts);
                _this.IsLoading(false);
            };
            this.HandleLoadFailure = function (error) {
                _this.IsLoading(false);
                Utils.ShowDialog("Error", "Failed to retrieve subscriber data.");
            };
            /**
            Hashes an email address and returns a gravatar URL.
            */
            this.GravatarHash = function (email) {
                var hash = md5(email.toLowerCase().trim());
                return "https://www.gravatar.com/avatar/{hash}?s=100";
            };
            this.GetNextChargeDate = function (subscriber) {
                return subscriber.NextChargeDate ? 'Charge: ' + moment(subscriber.NextChargeDate).format('MMMM Do, YYYY') : '(Failed to get charge data)';
            };
            //#endregion
            //#region Page event handlers
            this.HandleAppBarUpdate = function (context, element) {
                //AppBars are kind of jerky, taking a bit to show up. Wait 1 second for it to get 
                //loaded into the dom, then slide it up.
                setTimeout(function () {
                    element.style.display = null;
                    element.winControl.forceLayout();
                    WinJS.UI.Animation.slideUp(element);
                }, 900);
            };
            /**
            Handles refreshing data.
            */
            this.HandleRefreshEvent = function (context, event) {
                if (!_this.IsLoading()) {
                    _this.IsLoading(true);
                    if (!window.navigator.onLine) {
                        Utils.ShowDialog("No internet connection", "It looks like your device does not have an active internet connection. Please try again.");
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
            //Load the subscribers
            this.HandleRefreshEvent();
        }
        //#endregion        
        //#region Utility functions
        SubscriberController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("data-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(SubscriberController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Subscribers";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(SubscriberController, "PageUrl", {
            /**
             The page's URL, relative from the app's root.
             */
            get: function () {
                return "subscribers/subscribers.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
        Defines the controller's WinJS navigation functions.
        */
        SubscriberController.DefinePage = function () {
            WinJS.UI.Pages.define(SubscriberController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = Stages.Main.State.SubscriberController || new SubscriberController(options);
                    //Track the current page
                    Stages.Main.CurrentPage(SubscriberController.PageId);
                    Stages.Main.State.SubscriberController = client;
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    Utils.ShowDialog("Error", "Failed to load SubscriberController");
                    console.log("Error loading SubscriberController", err);
                }
            });
        };
        /**
        A client restored from JSON does not contain observables or functions. Use this
        function to merge and restore a previous controller state. This method requires that
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        SubscriberController.MergeAndRestore = function (lastState) {
            var client = new SubscriberController();
            //Assign values from previous state.
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
    }());
    Stages.SubscriberController = SubscriberController;
})(Stages || (Stages = {}));
