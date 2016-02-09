/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var ConvertKit;
(function (ConvertKit) {
    var SettingsController = (function () {
        function SettingsController() {
            this.IsLoading = ko.observable(false);
            this.Notifications = {
                Enabled: ko.observable(true),
                Timer: ko.observable(15),
            };
            this.HandleSignoutEvent = function (context, event) {
                Utils.ShowDialog("Are you sure you want to sign out?", "Signing out will erase your secret key from this app's local storage. You'll need to enter it again to use the app.", "Sign out", function (e) {
                    if (e.detail.result === "primary") {
                        Utils.LocalStorage.Delete(ConvertKit.Strings.SecretKeyId);
                        WinJS.Navigation.navigate(ConvertKit.LoginController.PageUrl).done(function () {
                            WinJS.Navigation.history = [];
                            ConvertKit.Main.State.FormsController = null;
                            ConvertKit.Main.State.HomeController = null;
                            ConvertKit.Main.State.SettingsController = null;
                        });
                    }
                    ;
                }, true);
            };
            this.RegisterKnockoutSubscriptions();
        }
        SettingsController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        Object.defineProperty(SettingsController, "PageId", {
            get: function () {
                return "Settings";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(SettingsController, "PageUrl", {
            get: function () {
                return "settings/settings.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        SettingsController.DefinePage = function () {
            WinJS.UI.Pages.define(SettingsController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = ConvertKit.Main.State.SettingsController || new SettingsController();
                    ConvertKit.Main.CurrentPage(SettingsController.PageId);
                    ConvertKit.Main.State.SettingsController = client;
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading SettingsController.");
                }
            });
        };
        SettingsController.MergeAndRestore = function (lastState) {
            var client = new SettingsController();
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
        return SettingsController;
    })();
    ConvertKit.SettingsController = SettingsController;
})(ConvertKit || (ConvertKit = {}));
//# sourceMappingURL=SettingsController.js.map