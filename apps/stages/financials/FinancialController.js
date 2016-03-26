/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../lib/custom/stagesclient/stagesclient.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var FinancialController = (function () {
        function FinancialController(state) {
            var _this = this;
            //#region Variables
            this.Service = new Stages.AdminFinancialService(Utils.LocalStorage.Retrieve("X-Stages-API-Key"));
            this.SubscribedPlans = ko.observableArray();
            this.IsLoading = ko.observable(false);
            this.HandleLoadSuccess = function (currentPlans) {
                _this.SubscribedPlans(currentPlans);
                _this.IsLoading(false);
            };
            this.HandleLoadFailure = function (error) {
                _this.IsLoading(false);
                Utils.ShowDialog("Error", "Failed to retrieve subscriber data.");
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
                    _this.Service.GetAsync().done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                }
            };
            this.RegisterKnockoutSubscriptions();
            if (state && state.Plans) {
                this.HandleLoadSuccess(state.Plans);
                return;
            }
            ;
            //Load the subscribers
            this.HandleRefreshEvent();
        }
        //#endregion        
        //#region Utility functions
        FinancialController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("data-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(FinancialController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Financials";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(FinancialController, "PageUrl", {
            /**
            The page's URL, relative from the app root.
            */
            get: function () {
                return "financials/financials.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
        Defines the controller's WinJS navigation functions.
        */
        FinancialController.DefinePage = function () {
            WinJS.UI.Pages.define(FinancialController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = Stages.Main.State.FinancialController || new FinancialController(options);
                    //Track the current page
                    Stages.Main.CurrentPage(FinancialController.PageId);
                    Stages.Main.State.FinancialController = client;
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading FinancialController.");
                },
            });
        };
        /**
        A client restored from JSON does not contain observables or functions. Use this
        function to merge and restore a previous controller state. This method requires that
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        FinancialController.MergeAndRestore = function (lastState) {
            var client = new FinancialController();
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
        return FinancialController;
    }());
    Stages.FinancialController = FinancialController;
})(Stages || (Stages = {}));
