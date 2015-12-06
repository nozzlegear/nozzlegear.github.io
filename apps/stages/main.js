/// <reference path="../../typings/tsd.d.ts" />
var App;
(function (App) {
    var Stages;
    (function (Stages) {
        var Main = (function () {
            function Main() {
            }
            Main.State = {};
            Main.Start = function () {
                var app = WinJS.Application;
                app.onactivated = function (args) {
                    _.forOwn(App.Stages, function (value, key) {
                        if (_.has(value, "DefinePage")) {
                            value.DefinePage();
                        }
                    });
                    if (args.detail.kind === "Windows.Launch") {
                        var appPromise = WinJS.UI.processAll();
                        ko.applyBindings(this);
                        app.sessionState.Main = app.sessionState.Main || {};
                        Main.State = JSON.parse(app.sessionState.Main.StateJSON || "{}");
                        Main.CurrentPage(app.sessionState.Main.LastPage);
                        _.forOwn(Main.State, function (value, key) {
                            try {
                                if (_.has(App.Stages[key], "MergeAndRestore")) {
                                    Main.State[key] = App.Stages[key].MergeAndRestore(value);
                                }
                                ;
                            }
                            catch (e) {
                                Main.State[key] = null;
                            }
                        });
                        appPromise = appPromise
                            .then(function () {
                            if (App.Utils.LocalStorage.Retrieve("X-Stages-API-Key")) {
                                return WinJS.Navigation.navigate(Main.CurrentPage() ? App.Stages[Main.CurrentPage()].PageUrl : Stages.SubscriberController.PageUrl, WinJS.Navigation.state);
                            }
                            return WinJS.Navigation.navigate(Stages.LoginController.PageUrl, WinJS.Navigation.state);
                        }).then(null, function (error) { console.log("Error loading page", error); });
                        appPromise.done(function () { console.log("Done"); }, function (error) { console.log("Error loading page 2", error); });
                    }
                    ;
                };
                app.oncheckpoint = function (args) {
                };
                app.start();
            };
            Main.CurrentPage = ko.observable();
            Main.HandleNavigateToSubscribers = function (context, eventOrState) {
                if (Main.CurrentPage() !== Stages.SubscriberController.PageId) {
                    WinJS.Navigation.navigate(Stages.SubscriberController.PageUrl, eventOrState);
                    Main.CloseSplitviewPane();
                }
                ;
            };
            Main.HandleNavigateToFinancials = function (context, event) {
                if (Main.CurrentPage() !== Stages.FinancialController.PageId) {
                    WinJS.Navigation.navigate(Stages.FinancialController.PageUrl);
                    Main.CloseSplitviewPane();
                }
                ;
            };
            Main.HandleRefreshEvent = function (context, event) {
                var client = window["client"];
                if (client && client.HandleRefreshEvent) {
                    client.HandleRefreshEvent(context, event);
                }
            };
            Main.HandleNavigateToSettings = function (context, event) {
                if (Main.CurrentPage() !== Stages.SettingsController.PageId) {
                    WinJS.Navigation.navigate(Stages.SettingsController.PageUrl);
                    Main.CloseSplitviewPane();
                }
                ;
            };
            Main.CloseSplitviewPane = function () {
                var sv = document.getElementById("splitview").winControl;
                sv.closePane();
            };
            return Main;
        })();
        Stages.Main = Main;
    })(Stages = App.Stages || (App.Stages = {}));
})(App || (App = {}));
App.Stages.Main.Start();
//# sourceMappingURL=main.js.map