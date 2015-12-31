/// <reference path="./../../../typings/tsd.d.ts" />
/// <reference path="./../main.ts" />

namespace ConvertKit
{
    export class FormsController
    {
        constructor(state?: { FormsResponse: ConvertKit.Entities.FormResponse })
        {
            this.RegisterKnockoutSubscriptions();

            if (state && state.FormsResponse)
            {
                this.HandleLoadSuccess(state.FormsResponse);

                return;
            };

            //Load the forms
            this.HandleRefreshEvent();
        }

        //#region Variables

        private Service = new ConvertKit.FormService(Utils.LocalStorage.Retrieve(Strings.SecretKeyId));

        public Forms = ko.observableArray<ConvertKit.Entities.Form>([]);

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

        private HandleLoadSuccess = (response: ConvertKit.Entities.FormResponse) =>
        {
            this.Forms([]);
            this.Forms.push.apply(this.Forms, response.forms);

            this.IsLoading(false);
        };

        private HandleLoadFailure = (error) =>
        {
            this.IsLoading(false);

            Utils.ShowDialog("Error", "Failed to retrieve list of forms.");
        };

        /**
        A client restored from JSON does not contain observables or functions. Use this 
        function to merge and restore a previous controller state. This method requires that 
        creating the new controller sets up ALL knockout observables. They cannot be null after
        constructing.
        */
        static MergeAndRestore = (lastState) =>
        {
            var client = new FormsController();
 
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

        /**
        Handles refreshing the list of forms.
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
            return "FormsController";
        };

        /**
        The page's URL, relative from the app root.
        */
        static get PageUrl()
        {
            return "forms/forms.html";
        };

        /**
        Defines the controller's WinJS navigation functions.
        */
        static DefinePage()
        {
            WinJS.UI.Pages.define(FormsController.PageUrl, {
                init: (element, options) =>
                {

                },
                processed: (element, options) =>
                {

                },
                ready: (element, options) =>
                {
                    //A previous version of the FormsController may still be attached to the WinJS state.
                    var client = Main.State.FormsController || new FormsController(options);

                    //Track the current page
                    Main.CurrentPage(FormsController.PageId);
                    Main.State.FormsController = client;
                    
                    //Define the 'client' namespace, which makes this controller available to the JS console debugger.
                    WinJS.Namespace.define("client", client);

                    ko.applyBindings(client, element);
                },
                error: (err) =>
                {
                    alert("Error loading FormsController.");
                },
            });
        }
    }
}