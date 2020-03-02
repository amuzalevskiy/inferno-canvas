"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SortedArray = /** @class */ (function () {
    function SortedArray(arg) {
        this.items = [];
        var type = typeof arg;
        if (type === 'string') {
            this.key = arg;
            this.cmp = this.objectComparison;
        }
        else if (type === 'function') {
            this.key = null;
            this.cmp = arg;
        }
        else {
            this.key = null;
            this.cmp = this.defaultComparison;
        }
    }
    Object.defineProperty(SortedArray.prototype, "length", {
        get: function () {
            return this.items.length;
        },
        enumerable: true,
        configurable: true
    });
    SortedArray.prototype.get = function (index) {
        return this.items[index];
    };
    SortedArray.prototype.insert = function (elements) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var toInsert = (arguments.length === 1 && Array.isArray(elements))
            ? elements.slice()
            : Array.prototype.slice.call(arguments);
        if (this.items.length === 0) {
            this.items = toInsert.sort(this.cmp.bind(this));
            return this;
        }
        toInsert.forEach(function (element) {
            _this.insertOne(element);
        });
        return this;
    };
    SortedArray.prototype.remove = function (index, deleteCount) {
        if (deleteCount === void 0) { deleteCount = 1; }
        this.items.splice(index, deleteCount);
        return this;
    };
    SortedArray.prototype.removeByValue = function (value) {
        var _this = this;
        if (value instanceof Array) {
            value.forEach(function (v) { return _this.removeByValue(v); });
            return this;
        }
        var found = this.getEqual(value);
        if (found.length === 0) {
            return this;
        }
        this.items.splice(found.first, found.length);
        return this;
    };
    SortedArray.prototype.search = function (value) {
        var element = this.prepareComparableValue(value);
        var middle;
        var min = 0;
        var max = this.items.length - 1;
        while (min <= max) {
            middle = (min + max) >> 1;
            var cmp = this.cmp(this.get(middle), element);
            if (cmp < 0) {
                min = middle + 1;
            }
            else if (cmp > 0) {
                max = middle - 1;
            }
            else if (min !== middle) {
                max = middle;
            }
            else {
                return middle;
            }
        }
        return -1;
    };
    SortedArray.prototype.has = function (value) {
        return this.search(value) !== -1;
    };
    SortedArray.prototype.eq = function (value) {
        var found = this.getEqual(value);
        var result = new SortedArray(this.key || this.cmp);
        result.insert((found.length === 0) ? [] : this.items.slice(found.first, found.first + found.length));
        return result;
    };
    SortedArray.prototype.gt = function (value) {
        var index = this.greaterThan(value);
        var result = new SortedArray(this.key || this.cmp);
        result.insert((index < 0) ? [] : this.items.slice(index));
        return result;
    };
    SortedArray.prototype.lt = function (value) {
        var index = this.lessThan(value);
        var result = new SortedArray(this.key || this.cmp);
        result.insert((index < 0) ? [] : this.items.slice(0, index + 1));
        return result;
    };
    SortedArray.prototype.gte = function (value) {
        var index = this.greaterThan(value, true);
        var result = new SortedArray(this.key || this.cmp);
        result.insert((index < 0) ? [] : this.items.slice(index));
        return result;
    };
    SortedArray.prototype.lte = function (value) {
        var index = this.lessThan(value, true);
        var result = new SortedArray(this.key || this.cmp);
        result.insert((index < 0) ? [] : this.items.slice(0, index + 1));
        return result;
    };
    SortedArray.prototype.clear = function () {
        this.items = [];
        return this;
    };
    SortedArray.prototype.toArray = function () {
        return this.items;
    };
    SortedArray.prototype.toString = function () {
        return this.items.toString();
    };
    SortedArray.prototype.getEqual = function (value) {
        var element = this.prepareComparableValue(value);
        var result = { first: -1, length: 0 };
        var index = this.search(element);
        if (index === -1) {
            return result;
        }
        result.first = index++;
        var numberOfEqualValues = 1;
        while (index < this.items.length) {
            if (this.cmp(this.get(index), element) === 0) {
                numberOfEqualValues += 1;
            }
            else {
                break;
            }
            index += 1;
        }
        result.length = numberOfEqualValues;
        return result;
    };
    SortedArray.prototype.greaterThan = function (value, orEqual) {
        if (orEqual === void 0) { orEqual = false; }
        var element = this.prepareComparableValue(value);
        var middle;
        var min = 0;
        var max = this.items.length - 1;
        while (min <= max) {
            middle = (min + max) >> 1;
            var cmp = this.cmp(this.get(middle), element);
            if (cmp > 0 || (orEqual && cmp === 0)) {
                max = middle - 1;
            }
            else {
                min = middle + 1;
            }
        }
        return (max + 1 === this.items.length) ? -1 : max + 1;
    };
    SortedArray.prototype.lessThan = function (value, orEqual) {
        if (orEqual === void 0) { orEqual = false; }
        var element = this.prepareComparableValue(value);
        var middle;
        var min = 0;
        var max = this.items.length - 1;
        while (min <= max) {
            middle = (min + max) >> 1;
            var cmp = this.cmp(this.get(middle), element);
            if ((!orEqual && cmp >= 0) || (orEqual && cmp > 0)) {
                max = middle - 1;
            }
            else {
                min = middle + 1;
            }
        }
        return (min - 1 < 0) ? -1 : min - 1;
    };
    SortedArray.prototype.prepareComparableValue = function (value) {
        var element;
        if (this.key && typeof value !== 'object') {
            element = {};
            element[this.key] = value;
        }
        else {
            element = value;
        }
        return element;
    };
    SortedArray.prototype.defaultComparison = function (left, right) {
        if (left < right) {
            return -1;
        }
        else if (left > right) {
            return 1;
        }
        return 0;
    };
    SortedArray.prototype.objectComparison = function (left, right) {
        var leftValue = left[this.key];
        var rightValue = right[this.key];
        if (leftValue < rightValue) {
            return -1;
        }
        else if (leftValue > rightValue) {
            return 1;
        }
        return 0;
    };
    SortedArray.prototype.insertOne = function (element) {
        var index = this.greaterThan(element);
        if (index < 0) {
            index = this.items.length;
        }
        this.items.splice(index, 0, element);
        return this;
    };
    return SortedArray;
}());
exports.SortedArray = SortedArray;
//# sourceMappingURL=SortedArray.js.map