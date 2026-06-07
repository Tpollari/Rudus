function addConsentEventToDataLayer(consents) {
  // added time out to make sure that data layer consents are sent before firing the event.
  setTimeout(() => {
    window.dataLayer = window.dataLayer || [];
    dataLayer.push({
      event: "gravitoGCMConsents",
      consents: consents,
    });
  }, 100);
}

function addGTagEventToDataLayer() {
  // added time out to make sure that data layer consents are sent before firing the event.
  setTimeout(() => {
    dataLayer.push(arguments);
  }, 0);
}

function addTCFEventToDataLayer(currentState) {
  // added time out to make sure that data layer consents are sent before firing the event.
  setTimeout(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "gravitoTCFConsents",
      consentObj: currentState,
    });
  }, 100);
}
function nonProLightWrapper() {
  function loadConfig(url) {
    return new Promise(function (res, rej) {
      let xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.onload = function () {
        let response = xhr.response;
        window.gravitoCMPConfig =
          typeof response === "string" ? JSON.parse(response) : null;
        res(response);
      };
      xhr.onerror = function () {
        console.log(xhr.response);
        rej(xhr.response);
      };
      xhr.send();
    });
  }
  // function to return consent levels based on user preferences.
  function getConsentLevel(consents, consentId) {
    var item = consents.filter((item) => item.id === consentId);
    return item.length > 0 ? item[0].consent : false;
  }

  function sendUpdatedConsentsForLightCMP(currentState) {
    // get consent levels based on setup in config.
    var adConsent = getConsentLevel(
      currentState,
      window.gravitoCMPConfig.core.adsConsentId
        ? window.gravitoCMPConfig.core.adsConsentId
        : 0
    );
    var analyticsConsent = getConsentLevel(
      currentState,
      window.gravitoCMPConfig.core.analyticsConsentId
        ? window.gravitoCMPConfig.core.analyticsConsentId
        : 0
    );
    var adUserDataConsent = getConsentLevel(
      currentState,
      window.gravitoCMPConfig.core.adsUserDataConsentId
        ? window.gravitoCMPConfig.core.adsUserDataConsentId
        : 0
    );
    var adPersonalizationConsent = getConsentLevel(
      currentState,
      window.gravitoCMPConfig.core.adsPersonalizationConsentId
        ? window.gravitoCMPConfig.core.adsPersonalizationConsentId
        : 0
    );

    var updatedConsent = {
      ad_storage: adConsent ? "granted" : "denied",
      analytics_storage: analyticsConsent ? "granted" : "denied",
      ad_user_data: adUserDataConsent ? "granted" : "denied",
      ad_personalization: adPersonalizationConsent ? "granted" : "denied",
    };

    return updatedConsent;
  }

  // function to return consent levels based on user preferences.

  // Load the config file from the given URL
  function main() {
    let gravitoConfigToken = atob(window.gravitoconfigtoken);
    let gravitoConfigURL =
      "https://cdn.gravito.net/cmpconfigs/" +
      gravitoConfigToken +
      "config.json";

    loadConfig(gravitoConfigURL).then(function () {
      var gravitoSDKTag = document.createElement("script");
      gravitoSDKTag.src = "https://cdn.gravito.net/sdkv3/latest/sdk.js";
      gravitoSDKTag.onload = function () {
        if (gravitoCMPConfig) {
          // set useGTMTemplate to true so that GCM Events are sent not fired by CMP codebase when using GTM template
          gravitoCMPConfig.settings.useGTMTemplate = true;
          // set useGCM to false so that GCM Events are sent not fired by CMP codebase when using GTM template
          gravitoCMPConfig.settings.useGCM = false;
          if (gravitoCMPConfig.settings.useGravitoBackend) {
            window.gravito.init("lightCMP", "firstParty");
          } else {
            window.gravito.init("lightCMP");
          }
          let message = {
            type: "sdkloaded",
          };
          window.postMessage(message);
        }
      };

      document.body.appendChild(gravitoSDKTag);
    });
  }
  const getCookieData = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  window.gravitoAddEventListner = function (callback) {
    window.addEventListener("message", function (message) {
      let data = message.data;
      if (data.type === "sdkloaded") {
        let cmpEventType;
        if (gravitoCMPConfig.settings.type === "Light") {
          cmpEventType = "gravito:cmp:light";
        } else if (gravitoCMPConfig.settings.type === "TCF") {
          cmpEventType = "gravito:tcfv2:client";
        } else {
          cmpEventType = null;
        }
        cmpEventType &&
          document.addEventListener(cmpEventType, function (event) {
            var button_click_events = [
              "layer1:opt-in:all",
              "layer2:opt-in:all",
              "layer2:opt-in:selected",
              "layer2:opt-out:all",
              "layer1:opt-out:all",
              "opt-in:previously",
            ];
            if (button_click_events.includes(event.detail.eventType)) {
              if (cmpEventType === "gravito:cmp:light") {
                let currentState = getCookieData(
                  gravitoCMPConfig.core.cookieName
                );
                let respone = {
                  type: "Light",
                  consentState: currentState
                    ? sendUpdatedConsentsForLightCMP(
                        JSON.parse(currentState).Model
                      )
                    : null,
                  config: { core: window.gravitoCMPConfig.core },
                };
                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                callback(respone);
              } else {
                let currentState = gravitoCMP.currentState;
                let respone = {
                  type: "TCF",
                  consentState: currentState,
                };
                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                callback(respone);
              }
            }
          });
      }
    });
  };
  main();
}

function nonProTCFWrapper() {
  function loadConfig(url) {
    return new Promise(function (res, rej) {
      let xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.onload = function () {
        let response = xhr.response;
        window.gravitoCMPConfig =
          typeof response === "string" ? JSON.parse(response) : null;
        res(response);
      };
      xhr.onerror = function () {
        console.log(xhr.response);
        rej(xhr.response);
      };
      xhr.send();
    });
  }

  function sendUpdatedConsentsForTCFCMP() {
    var consentObject = window.gravitoCMP.getGoogleConsents();
    var updatedConsent = {
      ad_storage: consentObject.googleAds ? "granted" : "denied",
      analytics_storage: consentObject.googleAnalytics ? "granted" : "denied",
      ad_user_data: consentObject.googleAdsUserData ? "granted" : "denied",
      ad_personalization: consentObject.googleAdsPersonalization
        ? "granted"
        : "denied",
    };

    return updatedConsent;
  }

  // Load the config file from the given URL
  function main() {
    let gravitoConfigToken = atob(window.gravitoconfigtoken);
    let gravitoConfigURL =
      "https://cdn.gravito.net/cmpconfigs/" +
      gravitoConfigToken +
      "config.json";

    loadConfig(gravitoConfigURL).then(function () {
      var gravitoSDKTag = document.createElement("script");
      gravitoSDKTag.src = "https://cdn.gravito.net/sdkv3/latest/sdk.js";
      gravitoSDKTag.onload = function () {
        if (gravitoCMPConfig) {
          // set useGTMTemplate to true so that GCM Events are sent not fired by CMP codebase when using GTM template
          gravitoCMPConfig.settings.useGTMTemplate = true;

          if (gravitoCMPConfig.settings.useGravitoBackend) {
            window.gravito.init("tcfCMP", "firstParty");
          } else {
            window.gravito.init("tcfCMP");
          }
          let message = {
            type: "sdkloaded",
          };
          window.postMessage(message);
        }
      };

      document.body.appendChild(gravitoSDKTag);
    });
  }
  const getCookieData = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  window.gravitoAddEventListner = function (callback) {
    window.addEventListener("message", function (message) {
      let data = message.data;
      if (data.type === "sdkloaded") {
        let cmpEventType;
        if (gravitoCMPConfig.settings.type === "Light") {
          cmpEventType = "gravito:cmp:light";
        } else if (gravitoCMPConfig.settings.type === "TCF") {
          cmpEventType = "gravito:tcfv2:client";
        } else {
          cmpEventType = null;
        }
        cmpEventType &&
          document.addEventListener(cmpEventType, function (event) {
            var button_click_events = [
              "layer1:opt-in:all",
              "layer2:opt-in:all",
              "layer2:opt-in:selected",
              "layer2:opt-out:all",
              "layer1:opt-out:all",
              "opt-in:previously",
            ];
            if (button_click_events.includes(event.detail.eventType)) {
              if (cmpEventType === "gravito:cmp:light") {
                let currentState = getCookieData(
                  gravitoCMPConfig.core.cookieName
                );
                let respone = {
                  type: "Light",
                  consentState: currentState
                    ? JSON.parse(currentState).Model
                    : null,
                  config: { core: window.gravitoCMPConfig.core },
                };
                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                callback(respone);
              } else {
                let currentState = gravitoCMP.currentState;
                let respone = {
                  type: "TCF",
                  consentState: sendUpdatedConsentsForTCFCMP(),
                  config: { core: window.gravitoCMPConfig.core },
                };

                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                addTCFEventToDataLayer(window.gravitoCMP.currentState);

                callback(respone);
              }
            }
          });
      }
    });
  };
  main();
}

function proWrapper() {
  function loadConfig(url) {
    return new Promise(function (res, rej) {
      let xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.onload = function () {
        let response = xhr.response;
        window.gravitoPROCMPConfig =
          typeof response === "string" ? JSON.parse(response) : null;
        if (window.currentLanguage) {
          window.gravitoPROCMPConfig.gravitoCMP.core.languageCode =
            window.currentLanguage;
        }
        if (window.gravitoPROCMPConfig.gravitoCMP) {
          window.gravitoPROCMPConfig.gravitoCMP.core.useGCM = false;
        }

        res(response);
      };
      xhr.onerror = function () {
        console.log(xhr.response);
        rej(xhr.response);
      };
      xhr.send();
    });
  }

  // function to return consent levels based on user preferences.
  function getConsentLevel(consents, consentId) {
    var item = consents.filter((item) => item.id === consentId);
    return item.length > 0 ? item[0].consent : false;
  }

  function sendUpdatedConsentsForLightCMP(currentState) {
    // get consent levels based on setup in config.
    var adConsent = getConsentLevel(
      currentState,
      window.gravitoPROCMPConfig.gravitoCMP.core.adsConsentId
        ? window.gravitoPROCMPConfig.gravitoCMP.core.adsConsentId
        : 0
    );
    var analyticsConsent = getConsentLevel(
      currentState,
      window.gravitoPROCMPConfig.gravitoCMP.core.analyticsConsentId
        ? window.gravitoPROCMPConfig.gravitoCMP.core.analyticsConsentId
        : 0
    );
    var adUserDataConsent = getConsentLevel(
      currentState,
      window.gravitoPROCMPConfig.gravitoCMP.core.adsUserDataConsentId
        ? window.gravitoPROCMPConfig.gravitoCMP.core.adsUserDataConsentId
        : 0
    );
    var adPersonalizationConsent = getConsentLevel(
      currentState,
      window.gravitoPROCMPConfig.gravitoCMP.core.adsPersonalizationConsentId
        ? window.gravitoPROCMPConfig.gravitoCMP.core.adsPersonalizationConsentId
        : 0
    );

    var updatedConsent = {
      ad_storage: adConsent ? "granted" : "denied",
      analytics_storage: analyticsConsent ? "granted" : "denied",
      ad_user_data: adUserDataConsent ? "granted" : "denied",
      ad_personalization: adPersonalizationConsent ? "granted" : "denied",
    };

    return updatedConsent;
  }

  function sendUpdatedConsentsForTCFCMP() {
    var consentObject = window.gravitoCMP.getGoogleConsents();
    var updatedConsent = {
      ad_storage: consentObject.googleAds ? "granted" : "denied",
      analytics_storage: consentObject.googleAnalytics ? "granted" : "denied",
      ad_user_data: consentObject.googleAdsUserData ? "granted" : "denied",
      ad_personalization: consentObject.googleAdsPersonalization
        ? "granted"
        : "denied",
    };
    return updatedConsent;
  }

  function main() {
    let gravitoConfigToken = atob(window.gravitoconfigtoken);
    let gravitoConfigURL =
      "https://cdn.gravito.net/cmpconfigs/" +
      gravitoConfigToken +
      "config.json";

    loadConfig(gravitoConfigURL).then(function () {
      var gravitoSDKTag = document.createElement("script");
      gravitoSDKTag.src = "https://cdn.gravito.net/prosdkbuilds/tcftest/sdk.js";
      gravitoSDKTag.onload = function () {
        if (gravitoPROCMPConfig) {
          // set useGTMTemplate to true so that GCM Events are sent not fired by CMP codebase when using GTM template
          gravitoPROCMPConfig.settings.useGTMTemplate = true;
          if (gravitoPROCMPConfig.settings.useGravitoBackend) {
            window.gravito.init("proCMP", "firstParty");
          } else {
            window.gravito.init("proCMP");
          }
          let message = {
            type: "sdkloaded",
          };
          window.postMessage(message);
        }
      };

      document.body.appendChild(gravitoSDKTag);
    });
  }
  const getCookieData = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  window.gravitoAddEventListner = function (callback) {
    window.addEventListener("message", function (message) {
      let data = message.data;
      if (data.type === "sdkloaded") {
        // let state = { ...gravito.state._state };
        // let keys = Object.keys(state);
        // let simpleState = {};
        // for (var k of keys) {
        //   simpleState[k] = state[k];
        // }
        // callback(simpleState);
        let cmpEventType;
        if (gravitoPROCMPConfig.gravitoCMP) {
          cmpEventType = "gravito:cmp:light";
        } else if (gravitoPROCMPConfig.tcfCMP) {
          cmpEventType = "gravito:tcfv2:client";
        } else {
          cmpEventType = null;
        }
        cmpEventType &&
          document.addEventListener(cmpEventType, function (event) {
            var button_click_events = [
              "layer1:opt-in:all",
              "layer2:opt-in:all",
              "layer2:opt-in:selected",
              "layer2:opt-out:all",
              "layer1:opt-out:all",
              "opt-in:previously",
            ];
            if (button_click_events.includes(event.detail.eventType)) {
              if (cmpEventType === "gravito:cmp:light") {
                let currentState = getCookieData(
                  gravitoPROCMPConfig.gravitoCMP.core.cookieName
                );
                let respone = {
                  type: "Light",
                  consentState: currentState
                    ? sendUpdatedConsentsForLightCMP(
                        JSON.parse(currentState).Model
                      )
                    : null,
                  config: {
                    core: gravitoPROCMPConfig.gravitoCMP.core,
                  },
                };
                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                callback(respone);
              } else {
                let currentState = gravitoCMP.currentState;
                let respone = {
                  type: "TCF",
                  consentState: sendUpdatedConsentsForTCFCMP(),
                };
                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                addTCFEventToDataLayer(window.gravitoCMP.currentState);

                callback(respone);
              }
            }
          });
      }
    });
  };
  main();
}

// gravitoCMPV6 wrapper

function gravitoCMPV6Wrapper() {
  function loadConfig(url) {
    return new Promise(function (res, rej) {
      let xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.onload = function () {
        let response = xhr.response;
        window.gravito = window.gravito || {};
        window.gravito.config =
          typeof response === "string" ? JSON.parse(response) : null;
        let cmps = Object.keys(window.gravito.config.cmp);
        let isTCF = cmps.includes("tcf");
        let isStandard = cmps.includes("standard");
        if (window.currentLanguage) {
          if (isTCF) {
            window.gravito.config.cmp.tcf.core.languageCode =
              window.currentLanguage;
          }
          if (isStandard) {
            window.gravito.config.cmp.standard.core.languageCode =
              window.currentLanguage;
          }
        }
        // if (isStandard) {
        //   window.gravito.config.cmp.standard.core.useGCM = false;
        // }

        res(response);
      };
      xhr.onerror = function () {
        console.log(xhr.response);
        rej(xhr.response);
      };
      xhr.send();
    });
  }

  // function to return consent levels based on user preferences.
  function getConsentLevel(consents, consentId) {
    var item = consents.filter((item) => item.id === consentId);
    return item.length > 0 ? item[0].consent : false;
  }

  function sendUpdatedConsentsForStandardCMP(currentState) {
    let googleConsentView = window.gravito.cmp.standard.googleConsents;
    // get consent levels based on setup in config.
    var adConsent = googleConsentView.googleAds.isConsented;
    var analyticsConsent = googleConsentView.googleAnalytics.isConsented;
    var adUserDataConsent = googleConsentView.googleAdsUserData.isConsented;
    var adPersonalizationConsent =
      googleConsentView.googleAdsPersonalization.isConsented;
    var functionalityStorageConsent =
      googleConsentView.googleFunctionalityStorageConsent.isConsented;
    var personalizationStorageConsent =
      googleConsentView.googlePersonalizationStorageConsent.isConsented;
    var securityStorageConsent =
      googleConsentView.googleSecurityStorageConsent.isConsented;

    var updatedConsent = {
      ad_storage: adConsent ? "granted" : "denied",
      analytics_storage: analyticsConsent ? "granted" : "denied",
      ad_user_data: adUserDataConsent ? "granted" : "denied",
      ad_personalization: adPersonalizationConsent ? "granted" : "denied",
      functionality_storage: functionalityStorageConsent ? "granted" : "denied",
      personalization_storage: personalizationStorageConsent
        ? "granted"
        : "denied",
      // security_storage: securityStorageConsent ? "granted" : "denied",
    };

    return updatedConsent;
  }

  function sendUpdatedConsentsForTCFCMP() {
    var consentObject = window.gravito.cmp.tcf.getGoogleConsents();
    var updatedConsent = {
      ad_storage: consentObject.googleAds ? "granted" : "denied",
      analytics_storage: consentObject.googleAnalytics ? "granted" : "denied",
      ad_user_data: consentObject.googleAdsUserData ? "granted" : "denied",
      ad_personalization: consentObject.googleAdsPersonalization
        ? "granted"
        : "denied",
      functionality_storage: consentObject.googleFunctionalityStorage
        ? "granted"
        : "denied",
      personalization_storage: consentObject.googlePersonalizationStorage
        ? "granted"
        : "denied",
      // security_storage: consentObject.googleSecurityStorage
      //   ? "granted"
      //   : "denied",
    };
    return updatedConsent;
  }

  function main() {
    let gravitoConfigToken = atob(window.gravitoconfigtoken);
    let gravitoConfigURL =
      "https://cdn.gravito.net/cmpconfigs/" +
      gravitoConfigToken +
      "config.json";

    loadConfig(gravitoConfigURL).then(function () {
      var gravitoSDKTag = document.createElement("script");
      gravitoSDKTag.src = "https://cdn.gravito.net/sdk/v6/latest/sdk.js";
      gravitoSDKTag.onload = function () {
        if (window.gravito.config) {
          // set useGTMTemplate to true so that GCM Events are sent not fired by CMP codebase when using GTM template
          gravito.config.cmp.settings.useGTMTemplate = true;
          window.gravito.init();
          let message = {
            type: "sdkloaded",
          };
          window.postMessage(message);
        }
      };

      document.body.appendChild(gravitoSDKTag);
    });
  }
  const getCookieData = (cname) => {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  window.gravitoAddEventListner = function (callback) {
    window.addEventListener("message", function (message) {
      let data = message.data;
      if (data.type === "sdkloaded") {
        let cmps = Object.keys(window.gravito.config.cmp);
        let isTCF = cmps.includes("tcf");
        let isStandard = cmps.includes("standard");

        let cmpEventType;
        if (isStandard) {
          cmpEventType = "gravito:cmp:light";
        } else if (isTCF) {
          cmpEventType = "gravito:tcfv2:client";
        } else {
          cmpEventType = null;
        }
        cmpEventType &&
          document.addEventListener(cmpEventType, function (event) {
            var button_click_events = [
              "layer1:opt-in:all",
              "layer2:opt-in:all",
              "layer2:opt-in:selected",
              "layer2:opt-out:all",
              "layer1:opt-out:all",
              "opt-in:previously",
            ];
            if (button_click_events.includes(event.detail.eventType)) {
              if (cmpEventType === "gravito:cmp:light") {
                let currentState = getCookieData(
                  window.gravito.config.cmp.standard.core.cookieName
                );
                let respone = {
                  type: "Light",
                  consentState: currentState
                    ? sendUpdatedConsentsForStandardCMP(
                        JSON.parse(currentState).Model
                      )
                    : null,
                  config: {
                    core: window.gravito.config.cmp.standard.core,
                  },
                };
                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                callback(respone);
              } else {
                let currentState = window.gravito.cmp.tcf.currentState;
                let respone = {
                  type: "TCF",
                  consentState: sendUpdatedConsentsForTCFCMP(),
                };
                // add consents event into data layer.
                addConsentEventToDataLayer(respone.consentState);
                addTCFEventToDataLayer(currentState);

                callback(respone);
              }
            }
          });
      }
    });
  };
  main();
}

function init() {
  switch (window.gravitocmptype) {
    case "lightCMP":
      nonProLightWrapper();
      break;
    case "tcfCMP":
      nonProTCFWrapper();
      break;
    case "proCMP":
      proWrapper();
      break;
    case "gravitoCMPV6":
      gravitoCMPV6Wrapper();
      break;
    default:
      console.error("Invalid CMP type");
  }
}

init();
