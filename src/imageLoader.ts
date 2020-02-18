/**
 * Copyright (c) 2016-present, Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @source https://github.com/necolas/react-native-web/blob/b9172ceb8e0779c41e17210e56da36bdcc3e438b/packages/react-native-web/src/modules/ImageLoader/index.js
 * @licence https://github.com/necolas/react-native-web/blob/b9172ceb8e0779c41e17210e56da36bdcc3e438b/LICENSE
 */

/**
 * Changes:
 *  - Converted to typescript
 *  - removed getSize method
 */
let id = 0;
const requests: {[key: number]: HTMLImageElement} = {};

export const imageLoader = {
    abort(requestId: number) {
        let image = requests[requestId];
        if (image) {
            image.onerror = image.onload = null;
            delete requests[requestId];
        }
    },
    load(uri: string, onLoad: (img: HTMLImageElement) => void, onError: (e: string | Event) => void): number {
        id += 1;
        const image = new Image();
        image.onerror = onError;
        image.onload = () => {
            // avoid blocking the main thread
            const onDecode = () => onLoad(image);
            // tslint:disable:strict-type-predicates
            if (typeof (image as any).decode === 'function') {
                // Safari currently throws exceptions when decoding svgs.
                // We want to catch that error and allow the load handler
                // to be forwarded to the onLoad handler in this case
                (image as any).decode().then(onDecode, onDecode);
            } else {
                setTimeout(onDecode, 0);
            }
        };
        image.src = uri;
        requests[id] = image;
        return id;
    },
    prefetch(uri: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            imageLoader.load(uri, resolve, reject);
        });
    }
};
