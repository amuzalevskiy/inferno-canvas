/**
 * Cache implementation based on [BasketsQueue](https://people.csail.mit.edu/shanir/publications/Baskets%20Queue.pdf)
 *
 * Items are divided into baskets. Basket has certain lifetime to grow.
 *
 * Older baskets are removed together with items after overflow
 * 
 * Graveyard has a limited size
 */

import {ICache} from "./ICache";

export interface IBasketsCacheOptions<K, V> {
    basketLifetime?: number;
    maxBaskets?: number;
    onRemove?: (item: V, key: K) => void;
}

export class BasketsCache<K, V> implements ICache<K, V>{
    private _baskets: Array<Map<K, V>> = [new Map()];
    private _head!: Map<K, V>;
    private _lifeTimer: number = -1;
    private _onRemove: ((item: V, key: K) => void) | undefined;
    private _basketLifetime: number = 2000;
    private _maxBaskets: number = 6;
    constructor(options: IBasketsCacheOptions<K, V>) {
        this._basketLifetime = options.basketLifetime || this._basketLifetime;
        this._onRemove = options.onRemove;
        this._maxBaskets = options.maxBaskets || this._maxBaskets;
        this._head = this._baskets[0];
    }
    get(key: K): V | undefined {
        // short path
        if (this._head.has(key)) {
            return this._head.get(key)!;
        }
        let len = this._baskets.length;
        for (let i = 1; i < len; i++) {
            if (this._baskets[i].has(key)) {
                let value = this._baskets[i].get(key)!;
                this._head.set(key, value);
                if (this._baskets[i].size > 1) {
                    this._baskets[i].delete(key);
                } else {
                    this._removeBasket(i);
                    i--;
                }
                return value;
            }
        }
        return;
    }
    has(key: K): boolean {
        // short path
        if (this._head.has(key)) {
            return true;
        }
        let len = this._baskets.length;
        for (let i = 1; i < len; i++) {
            if (this._baskets[i].has(key)) {
                return true;
            }
        }
        return false;
    }
    set(key: K, value: V) {
        if (value === undefined) {
            return;
        }
        if (this.get(key) !== value) {
            this._head.set(key, value);
        }
        if (this._lifeTimer === -1) {
            this._lifeTimer = setTimeout(this._freezeTopBucket.bind(this), this._basketLifetime) as any as number;
        }
    }

    keys(): Array<K> {
        return Array.prototype.concat.apply([], this._baskets.map((v)=>Array.from(v.keys())));
    }

    values(): Array<V> {
        return Array.prototype.concat.apply([], this._baskets.map((v)=>Array.from(v.values())));
    }

    delete(key: K) {
        // short path
        if (this._head.has(key)) {
            return this._head.delete(key);
        }
        let len = this._baskets.length;
        for (let i = 1; i < len; i++) {
            if (this._baskets[i].has(key)) {
                if (this._baskets[i].size > 1) {
                    this._baskets[i].delete(key);
                } else {
                    this._removeBasket(i);
                    i--;
                }
                break;
            }
        }
    }

    private _removeBasket(i: number) {
        this._baskets.splice(i, 1);
        if (i === 0) {
            this._head = this._baskets[0];
        }
    }
    private _freezeTopBucket() {
        this._head = new Map();
        this._baskets.unshift(this._head);
        if (this._baskets.length > this._maxBaskets) {
            this._removeLastBucket();
        }
        this._lifeTimer = -1;
    }
    
    private _removeLastBucket() {
        if (this._baskets.length) {
            let basket = this._baskets.pop()!;
            if (this._onRemove) {
                basket.forEach(this._onRemove);
            }
        }
    }
}
