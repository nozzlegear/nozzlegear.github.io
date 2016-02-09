/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var ConvertKit;
(function (ConvertKit) {
    var FormsController = (function () {
        function FormsController(state) {
            var _this = this;
            this.Service = new ConvertKit.FormService(Utils.LocalStorage.Retrieve(ConvertKit.Strings.SecretKeyId));
            this.Forms = ko.observableArray([]);
            this.IsLoading = ko.observable(false);
            this.HandleLoadSuccess = function (response) {
                _this.Forms([]);
                _this.Forms.push.apply(_this.Forms, response.forms);
                _this.IsLoading(false);
            };
            this.HandleLoadFailure = function (error) {
                _this.IsLoading(false);
                Utils.ShowDialog("Error", "Failed to retrieve list of forms.");
            };
            this.HandleRefreshEvent = function (context, event) {
                if (!_this.IsLoading()) {
                    _this.IsLoading(true);
                    _this.Service.GetAsync().done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                }
            };
            this.RegisterKnockoutSubscriptions();
            if (state && state.FormsResponse) {
                this.HandleLoadSuccess(state.FormsResponse);
                return;
            }
            ;
            this.HandleRefreshEvent();
        }
        FormsController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(FormsController, "PageId", {
            get: function () {
                return "FormsController";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(FormsController, "PageUrl", {
            get: function () {
                return "forms/forms.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        FormsController.DefinePage = function () {
            WinJS.UI.Pages.define(FormsController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = ConvertKit.Main.State.FormsController || new FormsController(options);
                    ConvertKit.Main.CurrentPage(FormsController.PageId);
                    ConvertKit.Main.State.FormsController = client;
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading FormsController.");
                },
            });
        };
        FormsController.MergeAndRestore = function (lastState) {
            var client = new FormsController();
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
        return FormsController;
    })();
    ConvertKit.FormsController = FormsController;
})(ConvertKit || (ConvertKit = {}));
//# sourceMappingURL=FormsController.js.map