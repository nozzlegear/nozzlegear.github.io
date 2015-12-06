module App
{
    export module Utils
    {
        //#region Storage 

        export module LocalStorage 
        {
            export function Save(key: string, value: any)
            {
                localStorage.setItem(key, value);
            };

            export function Retrieve(key: string)
            {
                return localStorage.getItem(key);
            };

            export function Delete(key: string)
            {
                localStorage.removeItem(key);
            };
        };

        export module SessionStorage
        {
            export function Save(key: string, value: any)
            {
                sessionStorage.setItem(key, value);
            };

            export function Retrieve(key: string)
            {
                return sessionStorage.getItem(key);
            };

            export function Delete(key: string)
            {
                sessionStorage.removeItem(key);
            };
        };

        //#endregion

        export function ShowDialog(title: string, message: string)
        {
            alert(message);

            // TODO: Replace alert with WinJS dialog.
        }
    }
}
