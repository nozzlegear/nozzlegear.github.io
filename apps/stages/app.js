/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./financials/financialcontroller.ts" />
/// <reference path="./settings/settingscontroller.ts" />
/// <reference path="./login/logincontroller.ts" />
/// <reference path="./subscribers/subscribercontroller.ts" />
var Stages;
(function (Stages) {
    var Main = (function () {
        function Main() {
        }
        /**
        A static and magical object that persists controller states when navigating. Better than WinJS.navigation.state, which only works when using .back or .forward.
        */
        Main.State = {};
        /**
        Starts the application
        */
        Main.Start = function () {
            var app = WinJS.Application;
            app.onactivated = function (args) {
                //Define pages 
                _.forOwn(Stages, function (value, key) {
                    if (_.has(value, "DefinePage")) {
                        value.DefinePage();
                    }
                });
                if (args.detail.kind === "Windows.Launch") {
                    //Begin processing UI.
                    var appPromise = WinJS.UI.processAll();
                    //Apply page-level bindings to app. Will not trump view-specific bindings thanks to the custom stopBinding binding.
                    ko.applyBindings(this);
                    //Ensure sessionState.Main exists
                    app.sessionState.Main = app.sessionState.Main || {};
                    //Restore application state
                    Main.State = JSON.parse(app.sessionState.Main.StateJSON || "{}");
                    Main.CurrentPage(app.sessionState.Main.LastPage);
                    //Merge and restore previous controllers
                    _.forOwn(Main.State, function (value, key) {
                        try {
                            if (_.has(Stages[key], "MergeAndRestore")) {
                                Main.State[key] = Stages[key].MergeAndRestore(value);
                            }
                            ;
                        }
                        catch (e) {
                            //Delete the value from state. If app fails to recreate state, it can recover by creating a new controller from scratch.
                            Main.State[key] = null;
                        }
                    });
                    //Navigate to the home page
                    appPromise = appPromise
                        .then(function () {
                        //Check if the user has entered their API key
                        if (Utils.LocalStorage.Retrieve("X-Stages-API-Key")) {
                            //Navigate to the last known page if available, else go to home.
                            return WinJS.Navigation.navigate(Main.CurrentPage() ? Stages[Main.CurrentPage()].PageUrl : Stages.SubscriberController.PageUrl, WinJS.Navigation.state);
                        }
                        //Navigate to the login controller.
                        return WinJS.Navigation.navigate(Stages.LoginController.PageUrl, WinJS.Navigation.state);
                    }).then(null, function (error) { console.log("Error loading page", error); });
                    appPromise.done(function () { console.log("Done"); }, function (error) { console.log("Error loading page 2", error); });
                }
                ;
            };
            app.oncheckpoint = function (args) {
                // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
                // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
                // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
            };
            app.start();
        };
        Main.CurrentPage = ko.observable();
        /**
        Navigates the user to the subscribers page.
        */
        Main.HandleNavigateToSubscribers = function (context, eventOrState) {
            if (Main.CurrentPage() !== Stages.SubscriberController.PageId) {
                WinJS.Navigation.navigate(Stages.SubscriberController.PageUrl, eventOrState);
                Main.CloseSplitviewPane();
            }
            ;
        };
        /**
        Navigates the user to the financials page.
        */
        Main.HandleNavigateToFinancials = function (context, event) {
            if (Main.CurrentPage() !== Stages.FinancialController.PageId) {
                WinJS.Navigation.navigate(Stages.FinancialController.PageUrl);
                Main.CloseSplitviewPane();
            }
            ;
        };
        /**
        Attempts to refresh the current page by calling client.HandleRefreshEvent. It's up to the page controller
        to make itself available via WinJS.Namespace.define("client", ...);.
        */
        Main.HandleRefreshEvent = function (context, event) {
            var client = window["client"];
            if (client && client.HandleRefreshEvent) {
                client.HandleRefreshEvent(context, event);
            }
        };
        /**
        Navigates the user to the settings page.
        */
        Main.HandleNavigateToSettings = function (context, event) {
            if (Main.CurrentPage() !== Stages.SettingsController.PageId) {
                WinJS.Navigation.navigate(Stages.SettingsController.PageUrl);
                Main.CloseSplitviewPane();
            }
            ;
        };
        /**
        * Closes the splitview menu pane.
        */
        Main.CloseSplitviewPane = function () {
            var sv = document.getElementById("splitview").winControl;
            sv.closePane();
        };
        return Main;
    }());
    Stages.Main = Main;
})(Stages || (Stages = {}));
Stages.Main.Start();

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
                },
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

/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var SettingsController = (function () {
        function SettingsController() {
            //#region Variables
            this.IsLoading = ko.observable(false);
            this.Notifications = {
                Enabled: ko.observable(true),
                Timer: ko.observable(15),
            };
            this.RegisterKnockoutSubscriptions();
        }
        //#endregion
        //#region Utility functions
        SettingsController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        Object.defineProperty(SettingsController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Settings";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(SettingsController, "PageUrl", {
            /**
            The page's URL, relative from the app root.
            */
            get: function () {
                return "settings/settings.html";
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**
        Defines the controller's WinJS navigation functions.
        */
        SettingsController.DefinePage = function () {
            WinJS.UI.Pages.define(SettingsController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = Stages.Main.State.SettingsController || new SettingsController();
                    //Track the current page
                    Stages.Main.CurrentPage(SettingsController.PageId);
                    Stages.Main.State.SettingsController = client;
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading SettingsController.");
                }
            });
        };
        /**
        A client restored from JSON does not contain observables or functions. Use this
        function to merge and restore a previous controller state. This method requires that
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        SettingsController.MergeAndRestore = function (lastState) {
            var client = new SettingsController();
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
        return SettingsController;
    }());
    Stages.SettingsController = SettingsController;
})(Stages || (Stages = {}));

/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />
var Stages;
(function (Stages) {
    var LoginController = (function () {
        function LoginController() {
            var _this = this;
            //#region Variables
            this.IsLoading = ko.observable(false);
            this.SecretKey = ko.observable("");
            //#endregion
            //#region Page event handlers
            this.HandleLoginEvent = function (context, event) {
                if (!_this.SecretKey()) {
                    Utils.ShowDialog("Error", "You must enter a valid API key or access token to continue.");
                    return;
                }
                _this.IsLoading(true);
                _this.Service = new Stages.AdminSubscriberService(_this.SecretKey());
                //Try to pull in subscribers. If it fails, API key was incorrect.
                var getSubs = _this.Service.GetAsync("subscribed");
                var success = function (subs) {
                    //Save the key in localstorage
                    Utils.LocalStorage.Save("X-Stages-API-Key", _this.SecretKey());
                    var state = {
                        Accounts: subs
                    };
                    //Navigate to home page, passing along the subscriber list
                    Stages.Main.HandleNavigateToSubscribers(_this, state);
                };
                var fail = function (reason) {
                    console.log("Failed to get subscribers. Reason: ", reason);
                    Utils.ShowDialog("Error", "It looks like your secret key or access token is invalid. Please try again.");
                    _this.IsLoading(false);
                };
                getSubs.done(success, fail);
            };
            this.RegisterKnockoutSubscriptions();
        }
        //#endregion
        //#region Utility functions
        LoginController.prototype.RegisterKnockoutSubscriptions = function () {
        };
        Object.defineProperty(LoginController, "PageId", {
            //#endregion
            /**
            The page's id.
            */
            get: function () {
                return "Login";
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(LoginController, "PageUrl", {
            /**
            The page's URL, relative from the app root.
            */
            get: function () {
                return "login/login.html";
            },
            enumerable: true,
            configurable: true
        });
        /**
        Defines the controller's WinJS navigation functions.
        */
        LoginController.DefinePage = function () {
            WinJS.UI.Pages.define(LoginController.PageUrl, {
                init: function (element, options) {
                },
                processed: function (element, options) {
                },
                ready: function (element, options) {
                    var client = new LoginController();
                    //Track the current page
                    Stages.Main.CurrentPage(LoginController.PageId);
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);
                    ko.applyBindings(client, element);
                },
                error: function (err) {
                    alert("Error loading LoginController.");
                }
            });
        };
        return LoginController;
    }());
    Stages.LoginController = LoginController;
})(Stages || (Stages = {}));

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

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../../typings/tsd.d.ts" />
var Stages;
(function (Stages) {
    /**
    A generic Stages service, used by all other services. You should not be using this directly.
    */
    var _Service = (function () {
        function _Service(_AccessToken) {
            this._AccessToken = _AccessToken;
        }
        Object.defineProperty(_Service.prototype, "_BaseUrl", {
            /**
            The base URL for all requests.
            */
            get: function () { return "https://getstages.com/api/"; },
            enumerable: true,
            configurable: true
        });
        ;
        //#region Utility functions
        /**
        Builds headers for a request, including the Content-Type header.
        */
        _Service.prototype.BuildRequestHeaders = function (contentType, extraHeaders) {
            if (extraHeaders === void 0) { extraHeaders = {}; }
            var headers = _.extend({
                "Content-Type": contentType,
                "X-Stages-Access-Token": this._AccessToken,
                "X-Stages-API-Version": "1",
                "Accept": "application/json"
            }, extraHeaders);
            return headers;
        };
        ;
        /**
        Creates a webrequest to the given path and appends the client's SecretKey.
        */
        _Service.prototype.CreateRequest = function (method, path, data) {
            var req = reqwest({
                url: this._BaseUrl + path,
                method: method,
                data: data && JSON.stringify(data) || null,
                headers: this.BuildRequestHeaders("application/json"),
                contentType: "application/json"
            });
            return req;
        };
        ;
        /**
        * Finishes a web request and automatically resolves or rejects it. Pass an optional callback to receive the
        * response's string content and the promise resolver.
        * @param message The web request method.
        * @param resolve The promise resolver.
        * @param reject The promise rejecter.
        * @param callback Optional callback. Receives the response's string content. Promise resolver will not be called when this callback is used.
        */
        _Service.prototype.FinishRequest = function (req, resolve, reject, callback) {
            if (callback === void 0) { callback = null; }
            req.fail(reject);
            req.then(function (resp) {
                if (req.request.status > 205 || req.request.status < 200) {
                    reject("Response for request did not indicate success. Status code: " + req.request.status + ".");
                    return;
                }
                ;
                if (!callback) {
                    resolve(resp);
                    return;
                }
                callback(resp);
            });
        };
        ;
        return _Service;
    }());
    /**
    * A service for interacting with the Stages subscribers API.
    */
    var AdminSubscriberService = (function (_super) {
        __extends(AdminSubscriberService, _super);
        function AdminSubscriberService(accessToken) {
            var _this = this;
            _super.call(this, accessToken);
            /**
             * Retrieves a list of Stages accounts with the given status.
             * @param {string = "all"} status The status of accounts to retrieve. Valid values are 'all' or 'subscribed'.
             * @returns The list of Stages subscribers.
             */
            this.GetAsync = function (status) {
                if (status === void 0) { status = "all"; }
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest("GET", "admin/subscribers?status=" + status);
                    _this.FinishRequest(message, resolve, reject);
                });
            };
            /**
            * Retrieves a count of Stages subscribers with the given status.
            * @param {string = "all"} status The status of accounts to retrieve. Valid values are 'all' or 'subscribed'.
            * @returns The count of Stages subscribers with the given status.
            */
            this.CountAsync = function (status) {
                if (status === void 0) { status = "all"; }
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest("GET", "admin/subscribers/count?status=" + status);
                    _this.FinishRequest(message, resolve, reject, function (content) {
                        resolve(content.count);
                    });
                });
            };
        }
        return AdminSubscriberService;
    }(_Service));
    Stages.AdminSubscriberService = AdminSubscriberService;
    /**
    A service for interacting with the admin/financials API.
    */
    var AdminFinancialService = (function (_super) {
        __extends(AdminFinancialService, _super);
        function AdminFinancialService(accessToken) {
            var _this = this;
            _super.call(this, accessToken);
            /**
            * Retrieves a list of Stages accounts.
            */
            this.GetAsync = function () {
                return new WinJS.Promise(function (resolve, reject) {
                    var message = _this.CreateRequest("GET", "admin/financials");
                    _this.FinishRequest(message, resolve, reject);
                });
            };
        }
        return AdminFinancialService;
    }(_Service));
    Stages.AdminFinancialService = AdminFinancialService;
})(Stages || (Stages = {}));