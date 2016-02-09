/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../../../lib/custom/stagesclient/stagesclient.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var FinancialController = (function () {
        function FinancialController(state) {
            var _this = this;
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
            this.HandleRefreshEvent();
        }
        FinancialController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("data-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(FinancialController, "PageId", {
            get: function () {
                return "Financials";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(FinancialController, "PageUrl", {
            get: function () {
                return "financials/financials.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        FinancialController.DefinePage = function () {
            WinJS.UI.Pages.define(FinancialController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = Stages.Main.State.FinancialController || new FinancialController(options);
                    Stages.Main.CurrentPage(FinancialController.PageId);
                    Stages.Main.State.FinancialController = client;
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading FinancialController.");
                },
            });
        };
        FinancialController.MergeAndRestore = function (lastState) {
            var client = new FinancialController();
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
    })();
    Stages.FinancialController = FinancialController;
})(Stages || (Stages = {}));
//# sourceMappingURL=FinancialController.js.map