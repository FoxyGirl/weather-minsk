/**
 * Created by FoxyGirl on 18.02.2017.
 */

/**
 * @module load
 * @return {Function) - Create XMLHttpRequest.
 * @param {string} url - The url for XMLHttpRequest.
 * @param {Function} onLoad - Callback function.
 */
window.load = (function () {
    'use strict';

    var xhr = null;

  return function (url, onLoad) {
    xhr = new XMLHttpRequest();
    xhr.timeout = 2000;
    xhr.responseType = 'json';

    xhr.addEventListener('load', function (event) {
      if (event.target.status >= 400) {
        errorHandler('Failed to load data. Server returned status: ' + event.target.status);
      } else if (event.target.status >= 200) {
        if (typeof onLoad === 'function') {
          onLoad(event.target.response);
        }
      }
    });

    xhr.addEventListener('error', errorHandler);
    xhr.addEventListener('timeout', errorHandler);

    xhr.open('GET', url);
    xhr.send();

    /**
     * Console error message
     * @private
     * @param {object | string} err - Error message or error object.
     */
    function errorHandler(err) {
      console.log(err); //eslint-disable-line
    }
  };
})();
