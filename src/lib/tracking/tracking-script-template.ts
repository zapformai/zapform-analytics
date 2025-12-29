// This is a template that will be served to clients with variables replaced
export const trackingScriptTemplate = `
(function() {
  'use strict';

  var config = {
    trackingId: '__TRACKING_ID__',
    apiEndpoint: '__API_ENDPOINT__/api/track',
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
  };

  var SESSION_KEY = 'zf_session';
  var LAST_ACTIVITY_KEY = 'zf_last_activity';

  // Generate unique ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Get element selector
  function getSelector(element) {
    if (element.id) return '#' + element.id;
    if (element.className && typeof element.className === 'string') {
      var classes = element.className.split(' ').filter(function(c) { return c; });
      if (classes.length > 0) return '.' + classes[0];
    }
    return element.tagName.toLowerCase();
  }

  // Detect device info
  function getDeviceInfo() {
    var ua = navigator.userAgent;
    var deviceType = 'desktop';

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      deviceType = 'mobile';
    }

    return {
      browser: (function() {
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Chrome') > -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1) return 'Safari';
        if (ua.indexOf('Edge') > -1) return 'Edge';
        if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
        return 'Unknown';
      })(),
      os: (function() {
        if (ua.indexOf('Win') > -1) return 'Windows';
        if (ua.indexOf('Mac') > -1) return 'macOS';
        if (ua.indexOf('Linux') > -1) return 'Linux';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
        return 'Unknown';
      })(),
      deviceType: deviceType,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
    };
  }

  // Session Management
  function getOrCreateSession() {
    try {
      var now = Date.now();
      var sessionToken = localStorage.getItem(SESSION_KEY);
      var lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

      // Check if session expired
      if (lastActivity && now - parseInt(lastActivity) > config.sessionTimeout) {
        sessionToken = null;
      }

      // Create new session if needed
      if (!sessionToken) {
        sessionToken = generateId();
        localStorage.setItem(SESSION_KEY, sessionToken);

        // Send session start event
        sendEvent('session_start', {
          sessionToken: sessionToken,
          deviceInfo: getDeviceInfo()
        });
      }

      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      return sessionToken;
    } catch (e) {
      // Fallback if localStorage is not available
      return 'session_' + generateId();
    }
  }

  // Send event to API
  function sendEvent(type, data) {
    var payload = {
      type: type,
      trackingId: config.trackingId,
      timestamp: new Date().toISOString()
    };

    // Merge data
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        payload[key] = data[key];
      }
    }

    // Use sendBeacon if available
    if (navigator.sendBeacon) {
      navigator.sendBeacon(config.apiEndpoint, JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function() {
        // Silent fail
      });
    }
  }

  // Track page view
  function trackPageView() {
    var sessionToken = getOrCreateSession();
    sendEvent('pageview', {
      url: window.location.href,
      referrer: document.referrer || null,
      sessionToken: sessionToken,
    });
  }

  // Track clicks
  function trackClick(e) {
    var sessionToken = getOrCreateSession();
    var target = e.target || e.srcElement;

    sendEvent('click', {
      url: window.location.href,
      elementSelector: getSelector(target),
      elementText: target.innerText ? target.innerText.substring(0, 100) : null,
      xCoordinate: e.clientX,
      yCoordinate: e.clientY,
      sessionToken: sessionToken,
    });
  }

  // Track scroll depth
  var maxScroll = 0;
  var scrollTimeout;

  function trackScroll() {
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    var documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;

    var scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
    if (isNaN(scrollPercent)) scrollPercent = 0;
    if (scrollPercent > 100) scrollPercent = 100;

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        var sessionToken = getOrCreateSession();
        sendEvent('scroll', {
          url: window.location.href,
          scrollDepth: scrollPercent,
          maxScroll: maxScroll,
          sessionToken: sessionToken,
        });
      }, 1000); // Debounce 1 second
    }
  }

  // Initialize tracking
  function init() {
    // Track initial page view
    trackPageView();

    // Track clicks
    if (document.addEventListener) {
      document.addEventListener('click', trackClick, true);
    } else if (document.attachEvent) {
      document.attachEvent('onclick', trackClick);
    }

    // Track scroll
    if (window.addEventListener) {
      window.addEventListener('scroll', trackScroll, { passive: true });
    } else if (window.attachEvent) {
      window.attachEvent('onscroll', trackScroll);
    }

    // Track page visibility change
    if (document.addEventListener) {
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          sendEvent('page_hide', { sessionToken: getOrCreateSession() });
        }
      });
    }
  }

  // Start tracking when DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 1);
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', init);
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState === 'complete') {
        init();
      }
    });
  }
})();
`;
