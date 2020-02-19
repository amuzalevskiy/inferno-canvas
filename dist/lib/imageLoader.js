"use strict";
/**
 * Copyright (c) 2016-present, Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @source https://github.com/necolas/react-native-web/blob/b9172ceb8e0779c41e17210e56da36bdcc3e438b/packages/react-native-web/src/modules/ImageLoader/index.js
 * @licence https://github.com/necolas/react-native-web/blob/b9172ceb8e0779c41e17210e56da36bdcc3e438b/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Changes:
 *  - Converted to typescript
 *  - removed getSize method
 */
var id = 0;
var requests = {};
exports.imageLoader = {
    abort: function (requestId) {
        var image = requests[requestId];
        if (image) {
            image.onerror = image.onload = null;
            delete requests[requestId];
        }
    },
    load: function (uri, onLoad, onError) {
        id += 1;
        var image = new Image();
        image.onerror = onError;
        image.onload = function () {
            // avoid blocking the main thread
            var onDecode = function () { return onLoad(image); };
            // tslint:disable:strict-type-predicates
            if (typeof image.decode === 'function') {
                // Safari currently throws exceptions when decoding svgs.
                // We want to catch that error and allow the load handler
                // to be forwarded to the onLoad handler in this case
                image.decode().then(onDecode, onDecode);
            }
            else {
                setTimeout(onDecode, 0);
            }
        };
        image.src = uri;
        requests[id] = image;
        return id;
    },
    prefetch: function (uri) {
        return new Promise(function (resolve, reject) {
            exports.imageLoader.load(uri, resolve, reject);
        });
    }
};
//# sourceMappingURL=imageLoader.js.map