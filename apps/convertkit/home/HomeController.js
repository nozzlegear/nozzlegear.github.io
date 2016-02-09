/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var ConvertKit;
(function (ConvertKit) {
    var HomeController = (function () {
        function HomeController(state) {
            var _this = this;
            this.Service = new ConvertKit.SubscriberService(Utils.LocalStorage.Retrieve(ConvertKit.Strings.SecretKeyId));
            this.SubscriberList = ko.observable({});
            this.IsLoading = ko.observable(false);
            this.HandleLoadSuccess = function (response) {
                if (_.isEqual(_this.SubscriberList(), response) === false) {
                    _this.SubscriberList(response);
                }
                _this.IsLoading(false);
            };
            this.HandleLoadFailure = function (error) {
                _this.IsLoading(false);
                Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
            };
            this.GravatarHash = function (email) {
                return md5(email.toLowerCase().trim());
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
                    _this.Service.GetAsync().done(_this.HandleLoadSuccess, _this.HandleLoadFailure);
                }
            };
            this.RegisterKnockoutSubscriptions();
            if (state && state.SubscriberList) {
                this.HandleLoadSuccess(state.SubscriberList);
                return;
            }
            ;
            this.HandleRefreshEvent();
        }
        HomeController.prototype.RegisterKnockoutSubscriptions = function () {
            this.IsLoading.subscribe(function (newValue) {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        };
        Object.defineProperty(HomeController, "PageId", {
            get: function () {
                return "HomeController";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(HomeController, "PageUrl", {
            get: function () {
                return "home/home.html";
            },
            enumerable: true,
            configurable: true
        });
        HomeController.DefinePage = function () {
            WinJS.UI.Pages.define(HomeController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = ConvertKit.Main.State.HomeController || new HomeController(options);
                    ConvertKit.Main.CurrentPage(HomeController.PageId);
                    ConvertKit.Main.State.HomeController = client;
                    window["client"] = client;
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading HomeController.");
                },
            });
        };
        HomeController.MergeAndRestore = function (lastState) {
            var client = new HomeController();
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
        return HomeController;
    })();
    ConvertKit.HomeController = HomeController;
})(ConvertKit || (ConvertKit = {}));
//# sourceMappingURL=homecontroller.js.map