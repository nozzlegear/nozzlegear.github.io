/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./settings/SettingsController.ts" />
/// <reference path="./login/logincontroller.ts" />
/// <reference path="./home/homecontroller.ts" />
/// <reference path="./forms/formscontroller.ts" />
var ConvertKit;
(function (ConvertKit) {
    var Strings;
    (function (Strings) {
        Strings.SecretKeyId = "ConvertKit-Secret-Key";
    })(Strings = ConvertKit.Strings || (ConvertKit.Strings = {}));
    var Main = (function () {
        function Main() {
        }
        Main.State = {};
        Main.Start = function () {
            var app = WinJS.Application;
            console.log("Started");
            app.onactivated = function (args) {
                _.forOwn(ConvertKit, function (value, key) {
                    if (_.has(value, "DefinePage")) {
                        value.DefinePage();
                    }
                });
                if (args.detail.kind === "Windows.Launch") {
                    console.log("On Windows.Launch");
                    var appPromise = WinJS.UI.processAll().then(null, function (error) {
                        console.log("Error processing winjs ui.", error);
                    });
                    try {
                        ko.applyBindings(this);
                    }
                    catch (e) {
                        console.log("Failed to apply ko bindings.", e);
                    }
                    app.sessionState.Main = app.sessionState.Main || {};
                    Main.State = JSON.parse(app.sessionState.Main.StateJSON || "{}");
                    Main.CurrentPage(app.sessionState.Main.LastPage);
                    _.forOwn(Main.State, function (value, key) {
                        try {
                            if (_.has(ConvertKit[key], "MergeAndRestore")) {
                                Main.State[key] = ConvertKit[key].MergeAndRestore(value);
                            }
                            ;
                        }
                        catch (e) {
                            Main.State[key] = null;
                        }
                    });
                    appPromise = appPromise
                        .then(function () {
                        if (Utils.LocalStorage.Retrieve(Strings.SecretKeyId)) {
                            return WinJS.Navigation.navigate(Main.CurrentPage() ? ConvertKit[Main.CurrentPage()].PageUrl : ConvertKit.HomeController.PageUrl, WinJS.Navigation.state);
                        }
                        return WinJS.Navigation.navigate(ConvertKit.LoginController.PageUrl, WinJS.Navigation.state);
                    }).then(null, function (error) { console.log("Error loading page", error); });
                    appPromise.done(function () {
                        var updateReady = function () {
                            window.applicationCache.swapCache();
                            Utils.ShowDialog("Update available.", "An update has been installed for ConvertKit. Tap 'Activate' below to switch to the new version.", "Activate", function (event) {
                                window.location.reload(true);
                            });
                        };
                        window.applicationCache.addEventListener('updateready', updateReady);
                        window.applicationCache.update();
                    }, function (error) {
                        console.log("Error loading page 2", error);
                    });
                }
                ;
            };
            app.oncheckpoint = function (args) {
            };
            app.start();
        };
        Main.CurrentPage = ko.observable();
        Main.HandleNavigateToSubscribers = function (context, eventOrState) {
            if (Main.CurrentPage() !== ConvertKit.HomeController.PageId) {
                WinJS.Navigation.navigate(ConvertKit.HomeController.PageUrl, eventOrState);
                Main.CloseSplitviewPane();
            }
            ;
        };
        Main.HandleNavigateToForms = function (context, event) {
            if (Main.CurrentPage() !== ConvertKit.FormsController.PageId) {
                WinJS.Navigation.navigate(ConvertKit.FormsController.PageUrl);
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
            if (Main.CurrentPage() !== ConvertKit.SettingsController.PageId) {
                WinJS.Navigation.navigate(ConvertKit.SettingsController.PageUrl);
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
    ConvertKit.Main = Main;
})(ConvertKit || (ConvertKit = {}));
ConvertKit.Main.Start();
//# sourceMappingURL=main.js.map