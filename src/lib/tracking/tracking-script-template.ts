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

  // ============================================================================
  // ENGAGEMENT ACTIONS MODULE
  // ============================================================================

  var actionsEndpoint = '__API_ENDPOINT__/api/actions/active/' + config.trackingId;
  var trackActionEndpoint = '__API_ENDPOINT__/api/track-action';
  var activeActions = [];
  var displayedActions = {};
  var actionElements = {};

  // Escape HTML
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // URL pattern matching
  function matchesUrlPattern(pattern, matchType) {
    var currentUrl = window.location.href;
    var pathname = window.location.pathname;

    switch(matchType) {
      case 'exact':
        return currentUrl === pattern || pathname === pattern;
      case 'startsWith':
        return currentUrl.indexOf(pattern) === 0 || pathname.indexOf(pattern) === 0;
      case 'regex':
        try {
          return new RegExp(pattern).test(currentUrl);
        } catch(e) {
          return false;
        }
      case 'contains':
      default:
        return currentUrl.indexOf(pattern) > -1 || pathname.indexOf(pattern) > -1;
    }
  }

  // Check if action should display
  function shouldDisplayAction(action) {
    if (displayedActions[action.id]) {
      return false;
    }

    if (!action.urlPatterns || action.urlPatterns.length === 0) {
      return true;
    }

    for (var i = 0; i < action.urlPatterns.length; i++) {
      if (matchesUrlPattern(action.urlPatterns[i], action.urlMatchType)) {
        return true;
      }
    }
    return false;
  }

  // Track action interaction
  function trackAction(actionId, type) {
    var sessionToken = getOrCreateSession();
    var payload = {
      actionId: actionId,
      trackingId: config.trackingId,
      sessionToken: sessionToken,
      type: type,
      url: window.location.href
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon(trackActionEndpoint, JSON.stringify(payload));
    } else {
      fetch(trackActionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function() {});
    }
  }

  // Close action
  function closeAction(actionId) {
    if (actionElements[actionId]) {
      var elements = actionElements[actionId];
      if (elements.overlay && elements.overlay.parentNode) {
        elements.overlay.parentNode.removeChild(elements.overlay);
      }
      if (elements.container && elements.container.parentNode) {
        elements.container.parentNode.removeChild(elements.container);
      }
      delete actionElements[actionId];
    }
  }

  // Get action styles
  function getActionStyles(action) {
    var styling = action.styling || {};
    var baseStyles =
      'position: fixed; z-index: 999999; ' +
      'background: ' + (styling.backgroundColor || '#fff') + '; ' +
      'padding: ' + (styling.padding || '24px') + '; ' +
      'border-radius: ' + (styling.borderRadius || '8px') + '; ' +
      'box-shadow: 0 4px 20px rgba(0,0,0,0.15); ' +
      'font-family: ' + (styling.fontFamily || 'system-ui, -apple-system, sans-serif') + '; ' +
      'font-size: ' + (styling.fontSize || '16px') + '; ';

    var position = styling.position || 'center';
    var width = styling.width || '400px';
    var maxWidth = 'calc(100vw - 32px)';

    switch(position) {
      case 'center':
        baseStyles += 'top: 50%; left: 50%; transform: translate(-50%, -50%); ';
        break;
      case 'top':
        baseStyles += 'top: 16px; left: 50%; transform: translateX(-50%); ';
        break;
      case 'bottom':
        baseStyles += 'bottom: 16px; left: 50%; transform: translateX(-50%); ';
        break;
      case 'top-right':
        baseStyles += 'top: 16px; right: 16px; ';
        break;
      case 'top-left':
        baseStyles += 'top: 16px; left: 16px; ';
        break;
      case 'bottom-right':
        baseStyles += 'bottom: 16px; right: 16px; ';
        break;
      case 'bottom-left':
        baseStyles += 'bottom: 16px; left: 16px; ';
        break;
    }

    baseStyles += 'width: ' + width + '; max-width: ' + maxWidth + '; ';

    if (styling.height) {
      baseStyles += 'height: ' + styling.height + '; ';
    }

    return baseStyles;
  }

  // Apply animation
  function applyAnimation(container, overlay, animation) {
    container.style.opacity = '0';
    if (overlay) overlay.style.opacity = '0';

    setTimeout(function() {
      container.style.transition = 'all 0.3s ease';
      if (overlay) overlay.style.transition = 'opacity 0.3s ease';

      switch(animation) {
        case 'slide':
          container.style.transform += ' translateY(-20px)';
          break;
        case 'scale':
          container.style.transform += ' scale(0.9)';
          break;
      }

      setTimeout(function() {
        container.style.opacity = '1';
        if (overlay) overlay.style.opacity = '1';
        if (animation === 'slide' || animation === 'scale') {
          container.style.transform = container.style.transform
            .replace('translateY(-20px)', '')
            .replace('scale(0.9)', '');
        }
      }, 10);
    }, 10);
  }

  // Create action element
  function createActionElement(action) {
    var styling = action.styling || {};
    var content = action.content || {};

    // Create overlay
    var overlay = null;
    if (styling.overlay !== false) {
      overlay = document.createElement('div');
      overlay.style.cssText =
        'position: fixed; top: 0; left: 0; right: 0; bottom: 0; ' +
        'background: ' + (styling.overlayColor || 'rgba(0,0,0,0.5)') + '; ' +
        'z-index: 999998; transition: opacity 0.3s ease;';

      if (content.dismissable !== false) {
        overlay.onclick = function() {
          closeAction(action.id);
          trackAction(action.id, 'dismiss');
        };
      }
    }

    // Create container
    var container = document.createElement('div');
    container.setAttribute('data-zf-action', action.id);
    container.style.cssText = getActionStyles(action);

    // Build content HTML
    var html = '';
    if (content.title) {
      html += '<h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: ' +
              (styling.textColor || '#000') + ';">' + escapeHtml(content.title) + '</h3>';
    }
    if (content.message) {
      html += '<p style="margin: 0 0 16px 0; color: ' +
              (styling.textColor || '#000') + '; line-height: 1.5;">' +
              escapeHtml(content.message) + '</p>';
    }

    // Add buttons
    var buttonsHtml = '<div style="display: flex; gap: 8px; justify-content: flex-end;">';
    if (content.dismissable !== false) {
      buttonsHtml += '<button data-zf-dismiss style="' +
        'padding: 8px 16px; border: 1px solid #ccc; background: #fff; ' +
        'color: #333; border-radius: 4px; cursor: pointer; font-size: 14px;">' +
        'Dismiss</button>';
    }
    if (content.ctaText && content.ctaUrl) {
      buttonsHtml += '<button data-zf-cta style="' +
        'padding: 8px 16px; border: none; ' +
        'background: ' + (styling.buttonColor || '#000') + '; ' +
        'color: ' + (styling.buttonTextColor || '#fff') + '; ' +
        'border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500;">' +
        escapeHtml(content.ctaText) + '</button>';
    }
    buttonsHtml += '</div>';

    html += buttonsHtml;
    container.innerHTML = html;

    // Event handlers
    var dismissBtn = container.querySelector('[data-zf-dismiss]');
    if (dismissBtn) {
      dismissBtn.onclick = function(e) {
        e.stopPropagation();
        closeAction(action.id);
        trackAction(action.id, 'dismiss');
      };
    }

    var ctaBtn = container.querySelector('[data-zf-cta]');
    if (ctaBtn) {
      ctaBtn.onclick = function(e) {
        e.stopPropagation();
        trackAction(action.id, 'click');
        if (content.ctaUrl) {
          window.location.href = content.ctaUrl;
        }
        closeAction(action.id);
      };
    }

    // Apply animation
    applyAnimation(container, overlay, styling.animation || 'fade');

    return { container: container, overlay: overlay };
  }

  // Display action
  function displayAction(action) {
    if (displayedActions[action.id]) return;

    var elements = createActionElement(action);
    actionElements[action.id] = elements;

    if (elements.overlay) {
      document.body.appendChild(elements.overlay);
    }
    document.body.appendChild(elements.container);

    displayedActions[action.id] = true;
    trackAction(action.id, 'impression');
  }

  // Setup time trigger
  function setupTimeTrigger(action) {
    var delayMs = action.trigger.delayMs || 3000;
    setTimeout(function() {
      if (shouldDisplayAction(action)) {
        displayAction(action);
      }
    }, delayMs);
  }

  // Setup scroll trigger
  function setupScrollTrigger(action) {
    var targetPercentage = action.trigger.percentage || 50;
    var triggered = false;

    var scrollHandler = function() {
      if (triggered) return;

      var scrollPercent = Math.round(
        (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent >= targetPercentage && shouldDisplayAction(action)) {
        triggered = true;
        displayAction(action);
        if (window.removeEventListener) {
          window.removeEventListener('scroll', scrollHandler);
        } else if (window.detachEvent) {
          window.detachEvent('onscroll', scrollHandler);
        }
      }
    };

    if (window.addEventListener) {
      window.addEventListener('scroll', scrollHandler, { passive: true });
    } else if (window.attachEvent) {
      window.attachEvent('onscroll', scrollHandler);
    }
  }

  // Setup exit intent trigger
  function setupExitIntentTrigger(action) {
    var triggered = false;
    var sensitivity = action.trigger.sensitivity || 'medium';
    var threshold = sensitivity === 'low' ? 100 : sensitivity === 'high' ? 10 : 50;

    var exitHandler = function(e) {
      if (triggered) return;
      if (e.clientY <= threshold && shouldDisplayAction(action)) {
        triggered = true;
        displayAction(action);
        if (document.removeEventListener) {
          document.removeEventListener('mouseout', exitHandler);
        } else if (document.detachEvent) {
          document.detachEvent('onmouseout', exitHandler);
        }
      }
    };

    if (document.addEventListener) {
      document.addEventListener('mouseout', exitHandler);
    } else if (document.attachEvent) {
      document.attachEvent('onmouseout', exitHandler);
    }
  }

  // Initialize actions
  function initializeActions() {
    for (var i = 0; i < activeActions.length; i++) {
      var action = activeActions[i];

      switch(action.trigger.type) {
        case 'time':
          setupTimeTrigger(action);
          break;
        case 'scroll':
          setupScrollTrigger(action);
          break;
        case 'exit':
          setupExitIntentTrigger(action);
          break;
      }
    }
  }

  // Fetch active actions
  function fetchActions() {
    fetch(actionsEndpoint)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        activeActions = data.actions || [];
        initializeActions();
      })
      .catch(function(error) {
        // Silent fail
      });
  }

  // Initialize tracking
  function init() {
    // Track initial page view
    trackPageView();

    // Fetch and initialize engagement actions
    fetchActions();

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
