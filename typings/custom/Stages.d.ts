declare namespace Stages
{
    export namespace Entities
    {
        export module SubscriberController
        {
            export interface ExpectedState
            {
                Accounts?: API.Account[];
            }
        }

        export module API
        {
            /**
            A sanitized version of a Stages account. Does not include personal user information or sensitive data.
            */
            export class Account
            {
                Id: number;

                Plan: ApplicationPlan;

                AccountOwner: string;

                IsSubscribed: boolean;

                DateCreated: Date;
                
                NextChargeDate: Date;

                ReasonForCancellation: string;

                ShopifyShopName: string;

                ShopifyShopDomain: string;
            }

            /**
            A Stages subscription plan.
            */
            export class ApplicationPlan
            {
                Id: string;

                StripeId: string;

                Name: string;

                ValueInCents: number;

                Value: string;

                MemberLimit: number;
            }
        }
    }
}