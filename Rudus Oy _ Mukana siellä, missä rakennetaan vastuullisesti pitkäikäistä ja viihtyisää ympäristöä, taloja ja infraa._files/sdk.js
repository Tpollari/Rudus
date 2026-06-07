/******/ (() => { // webpackBootstrap
/*!********************!*\
  !*** ./src/sdk.js ***!
  \********************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
(function () {
  // var CDNUrl = "https://gravitocdn.blob.core.windows.net/procmp/sdkv4";
  // var CDNUrl = "https://cdn.gravito.net/prosdkbuilds/v1.0.1";
  // var CDNUrl = "http://127.0.0.1:5500/dist";
  var CDNUrl = "https://cdn.gravito.net/sdk/v6/latest";
  // var firstPartyFile="FIRSTPARTYFILE";
  // var lightCMPFIle="LIGHCMPFILE"
  // var tcfCMPFIle="TCFCMPFILE"

  // var firstPartyFile="FIRSTPARTYFILE";
  // var lightCMPFIle="LIGHCMPFILE"
  // var tcfCMPFIle="TCFCMPFILE"

  // var CDNUrl =
  //   window.location.pathname.substring(
  //     0,
  //     window.location.pathname.lastIndexOf("/") + 1
  //   ) + "/dist";

  var humanLikenessThreshold = window.gravito.config.isHumanLikenessThreshold || 1;
  var performanceThreshold = window.gravito.config.performanceThreshold || 0.01;
  var baseUrl = window.gravito.config.baseURL || "https://gto.gravito.net/api/op/listen";
  var sendIsHumanToBackend = window.gravito.config.sendIsHumanToBackend || false;
  var Subscriber = /*#__PURE__*/function () {
    function Subscriber(onNotifyCallback, predicate) {
      _classCallCheck(this, Subscriber);
      this.onNotifyCallback = onNotifyCallback;
      this.predicate = predicate;
    }
    return _createClass(Subscriber, [{
      key: "notify",
      value: function notify(data, oldData) {
        this.onNotifyCallback(data);
      }
    }]);
  }();
  var Subject = /*#__PURE__*/function () {
    function Subject(initalValue) {
      _classCallCheck(this, Subject);
      this._subscribers = [];
      this._state = initalValue;
      this._prevState = initalValue;
    }
    return _createClass(Subject, [{
      key: "state",
      get: function get() {
        return this._state;
      }
    }, {
      key: "subscribers",
      get: function get() {
        return this._subscribers;
      }
    }, {
      key: "change",
      value: function change(field, value) {
        this._prevState = JSON.parse(JSON.stringify(this._state));
        this._state[field] = value;
        this.notifyAll();
      }
    }, {
      key: "changeMultiple",
      value: function changeMultiple(newState) {
        var _this = this;
        this._prevState = JSON.parse(JSON.stringify(this._state));
        var keys = Object.keys(newState);
        keys.map(function (key) {
          _this._state[key] = newState[key];
        });
        this.notifyAll();
      }
    }, {
      key: "subscribe",
      value: function subscribe(func, predicate) {
        var s = new Subscriber(func, predicate);
        this.subscribers.push(s);
      }
    }, {
      key: "notify",
      value: function notify(subscriber) {
        if (!subscriber.predicate) {
          subscriber.notify(this._state);
          return;
        }
        subscriber.predicate(this._state, this._prevState) && subscriber.notify(this._state);
      }
    }, {
      key: "notifyAll",
      value: function notifyAll() {
        var _this2 = this;
        this._subscribers.forEach(function (sub) {
          _this2.notify(sub);
        });
      }
    }]);
  }();
  window.gravitoSDKV2 = true;
  window.gravito.humanLikeness = 0;
  window.gravito.isHuman = false;
  window.gravito.state = new Subject({
    TCFCMPLoaded: false,
    lightCMPLoaded: false,
    firstPartyLoaded: false,
    prebidLoaded: false,
    modulesInUse: [],
    fpQue: [],
    fpRetryCall: 0
  });
  window.gravito.fireGTMTag = function (gtmEvent) {
    if (!window.dataLayer) {
      console.error("No data layer intialized");
      return;
    }
    window.dataLayer.push({
      event: gtmEvent
    });
  };
  function sendIsHumanValueToBackend() {
    var params = "?event=SDK&trackEvent=isHuman";
    new Image().src = baseUrl + params;
  }
  window.gravito.updateIsHuman = function (value) {
    window.gravito.humanLikeness = window.gravito.humanLikeness + value;
    // disptach event on document which can be listened by consumer
    if (window.gravito.humanLikeness >= humanLikenessThreshold) {
      gravito.isHuman = true;
      sendIsHumanToBackend && sendIsHumanValueToBackend();
    } else {
      gravito.isHuman = false;
    }
    document.dispatchEvent(new CustomEvent("gravito:humanLikeness:changed", {
      detail: {
        isHuman: gravito.isHuman,
        humanLikeness: gravito.humanLikeness
      }
    }));
    return window.gravito.humanLikeness;
  };
  function initialIsHumanCheck() {
    try {
      if (document.visibilityState === "visible" && document.hasFocus() && (Date.now() - performance.timeOrigin) / 1000 > performanceThreshold) {
        window.gravito.updateIsHuman(1);
      }
    } catch (error) {
      console.error("Error in initial isHuman check:", error);
    }
  }
  window.gravito.init = function () {
    var featuresArray = Object.keys(window.gravito.config);
    var modulesInUse = [];
    var firstParty = featuresArray.findIndex(function (item, index) {
      return item === "firstParty";
    }) != -1 ? true : false;
    var cmp = featuresArray.findIndex(function (item, index) {
      return item === "cmp";
    }) != -1 ? true : false;
    if (cmp) {
      var cmpTag = document.createElement("script");
      cmpTag.src = CDNUrl + "/cmp.js";
      document.body.append(cmpTag);
      modulesInUse.push("CMP");
    }
    if (firstParty) {
      //load firstparty
      var firstPartyTag = document.createElement("script");
      firstPartyTag.src = CDNUrl + "/firstparty.js";
      //   firstPartyTag.src = "dist/firstparty.js";
      document.body.append(firstPartyTag);
      modulesInUse.push("firstParty");
    }
    gravito.state.change("modulesInUse", modulesInUse);
    //dispatch event on document which can  be listened by consumer. This is dispatched when core SDK file is loaded.
    //Note: This does not means all the modules are loaded.
    var event = new CustomEvent("gravitoSDK:sdk-loaded");
    document.dispatchEvent(event);

    // add listner to changeStateEvent
    function onStateChangeFunction(currentState) {}
    window.gravito.state.subscribe(onStateChangeFunction);
    initialIsHumanCheck();
  };
})();
/******/ })()
;
