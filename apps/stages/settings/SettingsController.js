/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var SettingsController = (function () {
        function SettingsController() {
            this.IsLoading = ko.observable(false);
            this.Notifications = {
                Enabled: ko.observable(true),
                Timer: ko.observable(15),
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
                    var client = Stages.Main.State.SettingsController || new SettingsController();
                    Stages.Main.CurrentPage(SettingsController.PageId);
                    Stages.Main.State.SettingsController = client;
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
    Stages.SettingsController = SettingsController;
})(Stages || (Stages = {}));
//# sourceMappingURL=settingscontroller.js.map