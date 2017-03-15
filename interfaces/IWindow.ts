"use strict";
/**
 * Additional Interfaces
 */
import ILocalStorage from "./ILocalStorage";
/**
 * The Window interface
 */
interface IWindow {
  atob: any;
  btoa: any;
  escape: any;
  unescape: any;
  location: any;
  Promise: any;
  document: Document;
  addEventListener: Function;
  removeEventListener: Function;
  localStorage: ILocalStorage;
}
/**
 * Declare window interface
 */
declare var window: IWindow;
/**
 * Export the window interface
 */
export default IWindow;
