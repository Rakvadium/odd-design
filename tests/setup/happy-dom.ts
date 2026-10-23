import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

HTMLElement.prototype.showPopover = function showPopover() {};
HTMLElement.prototype.hidePopover = function hidePopover() {};
