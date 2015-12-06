declare module App.Stages
{
    export module Entities
    {
        export module API
        {
            /**
            A sanitized version of a Stages account. Does not include personal user information or sensitive data.
            */
            export class Account
            {
                id: number;

                plan: ApplicationPlan;

                accountOwner: string;

                isSubscribed: boolean;

                dateCreated: Date;

                reasonForCancellation: string;

                shopifyShopName: string;

                shopifyShopDomain: string;
            }

            /**
            A Stages subscription plan.
            */
            export class ApplicationPlan
            {
                id: string;

                stripeId: string;

                name: string;

                valueInCents: number;

                value: string;

                memberLimit: number;
            }
        }
    }
}