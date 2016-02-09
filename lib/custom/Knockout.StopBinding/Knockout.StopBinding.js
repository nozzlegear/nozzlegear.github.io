/// <reference path="../../../typings/tsd.d.ts" />
ko.bindingHandlers["stopBinding"] = {
    init: function () {
        return { controlsDescendantBindings: true };
    }
};
ko.virtualElements.allowedBindings["stopBinding"] = true;
//# sourceMappingURL=Knockout.StopBinding.js.map