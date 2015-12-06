/// <reference path="../../../typings/tsd.d.ts" />
module App.Stages
{
    export class SubscriberController
    {
        constructor(state?: Entities.SubscriberController.ExpectedState)
        {
            this.RegisterKnockoutSubscriptions();

            if (state && state.Accounts)
            {
                this.HandleLoadSuccess(state.Accounts);

                return;
            };

            //Load the subscribers
            this.HandleRefreshEvent();
        }

        //#region Variables

        private Service = new Stages.AdminSubscriberService(Utils.LocalStorage.Retrieve("X-Stages-API-Key"));

        public SubscribedAccounts = ko.observableArray<Stages.Entities.API.Account>();

        public IsLoading = ko.observable(false);

        //#endregion        

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {
            this.IsLoading.subscribe((newValue) =>
            {
                var container = document.getElementById("data-container");
                WinJS.UI.Animation.enterContent(container);
            });
        }

        private HandleLoadSuccess = (accounts: Stages.Entities.API.Account[]) =>
        {
            this.SubscribedAccounts(accounts);
            
            this.IsLoading(false);
        };

        private HandleLoadFailure = (error) =>
        {
            this.IsLoading(false);

            Utils.ShowDialog("Error", "Failed to retrieve subscriber data.");
        };

        /**
        Hashes an email address and returns a gravatar URL.
        */
        public GravatarHash = (email: string) =>
        {
            var hash = md5(email.toLowerCase().trim());

            return `https://www.gravatar.com/avatar/{hash}?s=100`;
        };

        /**
        A client restored from JSON does not contain observables or functions. Use this 
        function to merge and restore a previous controller state. This method requires that 
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        static MergeAndRestore = (lastState) =>
        {
            var client = new SubscriberController();
 
            //Assign values from previous state.
            _.forOwn(lastState, (value, key) =>
            {
                var clientValue = client[key];

                if (ko.isObservable(clientValue))
                {
                    clientValue(value);

                    return;
                };

                client[key] = value;
            });

            return client;
        };

        //#endregion

        //#region Page event handlers
    
        public HandleAppBarUpdate = (context, element: HTMLElement) =>
        {
            //AppBars are kind of jerky, taking a bit to show up. Wait 1 second for it to get 
            //loaded into the dom, then slide it up.
            setTimeout(() =>
            {
                element.style.display = null;
                element.winControl.forceLayout();
                WinJS.UI.Animation.slideUp(element);
            }, 900);
        };

        /**
        Handles refreshing data.
        */
        public HandleRefreshEvent = (context?, event?) =>
        {
            if (!this.IsLoading())
            {
                this.IsLoading(true);

                if (!window.navigator.onLine)
                {
                    Utils.ShowDialog("No internet connection", "It looks like your device does not have an active internet connection. Please try again.");

                    this.IsLoading(false);

                    return;
                }

                this.Service.GetAsync("subscribed").done(this.HandleLoadSuccess, this.HandleLoadFailure);
            }
        };

        //#endregion

        /**
        The page's id.
        */
        static get PageId()
        {
            return "Subscribers";
        };

        /** 
         The page's URL, relative from the app's root. 
         */
        static get PageUrl()
        {
            return "subscribers/subscribers.html";
        }; 

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define(SubscriberController.PageUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    var client = App.Stages.Main.State.SubscriberController || new SubscriberController(options);

                    //Track the current page
                    App.Stages.Main.CurrentPage(SubscriberController.PageId);
                    App.Stages.Main.State.SubscriberController = client;
                    
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    App.Utils.ShowDialog("Error", "Failed to load SubscriberController");

                    console.log("Error loading SubscriberController", err);
                },
            });
        }
    }
}