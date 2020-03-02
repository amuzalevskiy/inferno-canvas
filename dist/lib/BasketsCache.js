"use strict";
/**
 * Cache implementation based on [BasketsQueue](https://people.csail.mit.edu/shanir/publications/Baskets%20Queue.pdf)
 *
 * Items are divided into baskets. Basket has certain lifetime to grow.
 *
 * Older baskets are removed together with items after overflow
 *
 * Graveyard has a limited size
 */
Object.defineProperty(exports, "__esModule", { value: true });
var BasketsCache = /** @class */ (function () {
    function BasketsCache(options) {
        this._baskets = [new Map()];
        this._lifeTimer = -1;
        this._basketLifetime = 2000;
        this._maxBaskets = 6;
        this._basketLifetime = options.basketLifetime || this._basketLifetime;
        this._onRemove = options.onRemove;
        this._maxBaskets = options.maxBaskets || this._maxBaskets;
        this._head = this._baskets[0];
    }
    BasketsCache.prototype.get = function (key) {
        // short path, micro optimization, gives 0.1% speedup...
        var value = this._head.get(key);
        if (value || this._head.has(key)) {
            return value;
        }
        var len = this._baskets.length;
        for (var i = 1; i < len; i++) {
            if (this._baskets[i].has(key)) {
                var value_1 = this._baskets[i].get(key);
                this._head.set(key, value_1);
                if (this._baskets[i].size > 1) {
                    this._baskets[i].delete(key);
                }
                else {
                    this._removeBasket(i);
                    i--;
                }
                return value_1;
            }
        }
        return;
    };
    BasketsCache.prototype.has = function (key) {
        // short path
        if (this._head.has(key)) {
            return true;
        }
        var len = this._baskets.length;
        for (var i = 1; i < len; i++) {
            if (this._baskets[i].has(key)) {
                return true;
            }
        }
        return false;
    };
    BasketsCache.prototype.set = function (key, value) {
        if (value === undefined) {
            return;
        }
        if (this.get(key) !== value) {
            this._head.set(key, value);
        }
        if (this._lifeTimer === -1) {
            this._lifeTimer = setTimeout(this._freezeTopBucket.bind(this), this._basketLifetime);
        }
    };
    BasketsCache.prototype.keys = function () {
        return Array.prototype.concat.apply([], this._baskets.map(function (v) { return Array.from(v.keys()); }));
    };
    BasketsCache.prototype.values = function () {
        return Array.prototype.concat.apply([], this._baskets.map(function (v) { return Array.from(v.values()); }));
    };
    BasketsCache.prototype.delete = function (key) {
        // short path
        if (this._head.has(key)) {
            return this._head.delete(key);
        }
        var len = this._baskets.length;
        for (var i = 1; i < len; i++) {
            if (this._baskets[i].has(key)) {
                if (this._baskets[i].size > 1) {
                    this._baskets[i].delete(key);
                }
                else {
                    this._removeBasket(i);
                    i--;
                }
                break;
            }
        }
    };
    BasketsCache.prototype._removeBasket = function (i) {
        this._baskets.splice(i, 1);
        if (i === 0) {
            this._head = this._baskets[0];
        }
    };
    BasketsCache.prototype._freezeTopBucket = function () {
        this._head = new Map();
        this._baskets.unshift(this._head);
        if (this._baskets.length > this._maxBaskets) {
            this._removeLastBucket();
        }
        this._lifeTimer = -1;
    };
    BasketsCache.prototype._removeLastBucket = function () {
        if (this._baskets.length) {
            var basket = this._baskets.pop();
            if (this._onRemove) {
                basket.forEach(this._onRemove);
            }
        }
    };
    return BasketsCache;
}());
exports.BasketsCache = BasketsCache;
//# sourceMappingURL=BasketsCache.js.map