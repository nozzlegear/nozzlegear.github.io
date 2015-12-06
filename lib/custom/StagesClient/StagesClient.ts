/// <reference path="../../../typings/tsd.d.ts" />
module App.Stages
{
    /**
    A generic Stages service, used by all other services. You should not be using this directly.
    */
    class _Service
    {
        constructor(private _AccessToken) { }

        /**
        The base URL for all requests.
        */
        private get _BaseUrl(): string { return "https://getstages.com/api/" };
        
        //#region Utility functions

        /**
        Builds headers for a request, including the Content-Type header.
        */
        private BuildRequestHeaders(contentType: string, extraHeaders: Object = {})
        {
            var headers = _.extend({
                "Content-Type": contentType,
                "X-Stages-Access-Token": this._AccessToken,
                "X-Stages-API-Version": "1",
                "Accept": "application/json"
            }, extraHeaders);
            
            return headers;
        };

        /**
        Creates a webrequest to the given path and appends the client's SecretKey.
        */
        public CreateRequest<T>(method: string, path: string, data?: Object)
        {
            var req = reqwest<T>({
                url: this._BaseUrl + path,
                method: method,
                data: data && JSON.stringify(data) || null,
                headers: this.BuildRequestHeaders("application/json"),
                contentType: "application/json"
            });
            
            return req
        };

        /**
        * Finishes a web request and automatically resolves or rejects it. Pass an optional callback to receive the 
        * response's string content and the promise resolver.
        * @param message The web request method.
        * @param resolve The promise resolver.
        * @param reject The promise rejecter.
        * @param callback Optional callback. Receives the response's string content. Promise resolver will not be called when this callback is used.
        */
        public FinishRequest<T>(req: Reqwest.ReqwestPromise<T>, resolve, reject, callback: (content: T) => void = null)
        {
            req.fail(reject);

            req.then((resp) =>
            {
                if (req.request.status > 205 || req.request.status < 200)
                {
                    reject(`Response for request did not indicate success. Status code: ${req.request.status}.`);

                    return;
                };

                if (!callback)
                {
                    resolve(resp);

                    return;
                }

                callback(resp);
            });
        };

        //#endregion
    }

    /**
    * A service for interacting with the Stages subscribers API.
    */
    export class AdminSubscriberService extends _Service
    {
        constructor(accessToken)
        {
            super(accessToken);
        }

        /**
         * Retrieves a list of Stages accounts with the given status.
         * @param {string = "all"} status The status of accounts to retrieve. Valid values are 'all' or 'subscribed'.
         * @returns The list of Stages subscribers.
         */
        public GetAsync = (status: string = "all") =>
        {
            return new WinJS.Promise<Entities.API.Account[]>((resolve, reject) =>
            {
                var message = this.CreateRequest("GET", "admin/subscribers?status=" + status);

                this.FinishRequest(message, resolve, reject);
            });
        }

        /**
        * Retrieves a count of Stages subscribers with the given status.
        * @param {string = "all"} status The status of accounts to retrieve. Valid values are 'all' or 'subscribed'.
        * @returns The count of Stages subscribers with the given status.
        */
        public CountAsync = (status: string = "all") =>
        {
            return new WinJS.Promise<number>((resolve, reject) =>
            {
                var message = this.CreateRequest("GET", "admin/subscribers/count?status=" + status);

                this.FinishRequest<{ count: number }>(message, resolve, reject, (content) =>
                {
                    resolve(content.count);
                });
            });
        }
    }

    /**
    A service for interacting with the admin/financials API.
    */
    export class AdminFinancialService extends _Service
    {
        constructor(accessToken)
        {
            super(accessToken);
        }

        /**
        * Retrieves a list of Stages accounts.
        */
        public GetAsync = () =>
        {
            return new WinJS.Promise<Entities.API.ApplicationPlan[]>((resolve, reject) =>
            {
                var message = this.CreateRequest("GET", "admin/financials");

                this.FinishRequest(message, resolve, reject);
            });
        };
    }
}