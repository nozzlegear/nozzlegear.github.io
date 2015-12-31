/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />

namespace ConvertKit
{
    export class HomeController
    {
        constructor(state?: Entities.HomeController.ExpectedState)
        {
            this.RegisterKnockoutSubscriptions();

            if (state && state.SubscriberList)
            {
                this.HandleLoadSuccess(state.SubscriberList);

                return;
            };

            //Load the subscribers
            this.HandleRefreshEvent();
        }

        //#region Variables

        private Service = new ConvertKit.SubscriberService(Utils.LocalStorage.Retrieve(Strings.SecretKeyId));

        public SubscriberList = ko.observable<ConvertKit.Entities.SubscriberList>((<any>{}));

        public IsLoading = ko.observable(false);

        //#endregion        

        //#region Utility functions

        private RegisterKnockoutSubscriptions()
        {
            this.IsLoading.subscribe((newValue) =>
            {
                var container = document.getElementById("subscriber-container");
                WinJS.UI.Animation.enterContent(container);
            });
        }

        private HandleLoadSuccess = (response: ConvertKit.Entities.SubscriberList) =>
        {
            if (_.isEqual(this.SubscriberList(), response) === false)
            {
                this.SubscriberList(response);
            }

            this.IsLoading(false);
        };

        private HandleLoadFailure = (error) =>
        {
            this.IsLoading(false);

            Utils.ShowDialog("Error", "Failed to retrieve list of subscribers.");
        };

        public GravatarHash = (email: string) =>
        {
            return md5(email.toLowerCase().trim());
        };

        /**
        A client restored from JSON does not contain observables or functions. Use this 
        function to merge and restore a previous controller state. This method requires that 
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        static MergeAndRestore = (lastState) =>
        {
            var client = new HomeController();
 
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
        Handles refreshing the list of subscribers.
        */
        public HandleRefreshEvent = (context?, event?) =>
        {
            if (!this.IsLoading())
            {
                this.IsLoading(true);

                this.Service.GetAsync().done(this.HandleLoadSuccess, this.HandleLoadFailure);
            }
        };

        //#endregion

        /**
        The page's id. Must be identical to the name of the controller so it can be used from App[PageId].Method
        */
        static get PageId()
        {
            return "HomeController";
        };
        
        /** 
        The page's URL, relative from the app root.
        */
        static get PageUrl()
        {
            return "home/home.html";
        }

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define(HomeController.PageUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    //A previous version of the HomeController may still be attached to the WinJS state.
                    var client = Main.State.HomeController || new HomeController(options);

                    //Track the current page
                    Main.CurrentPage(HomeController.PageId);
                    Main.State.HomeController = client;
                    
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    window["client"] = client;

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading HomeController.");
                },
            });
        }
    }
}
