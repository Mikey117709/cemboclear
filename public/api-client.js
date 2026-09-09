


(function (global) {
  'use strict';

  var CSRF_KEY = 'cemboclear.csrf';
  var PUBLIC_METHODS = { GET: true, HEAD: true, OPTIONS: true };

  


  function resolveApiBase() {
    if (global.CEMBOCLEAR_API_BASE) {
      return String(global.CEMBOCLEAR_API_BASE).replace(/\/+$/, '');
    }

    

    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src || scripts[i].getAttribute('src');
      if (src && src.indexOf('api-client.js') !== -1) {
        
        var baseDir = src.replace(/(?:^|\/)api-client\.js(\?.*)?$/, '').replace(/\/+$/, '');
        return (baseDir || '.') + '/api';
      }
    }

    
    return './api';
  }

  var API_BASE = resolveApiBase();

  


  var ApiClient = function () {
    this.csrf = readStoredToken();
  };

  
  ApiClient.prototype.setCsrfToken = function (token) {
    this.csrf = token ? String(token) : null;
    if (this.csrf) {
      try { global.localStorage.setItem(CSRF_KEY, this.csrf); } catch (e) {}
    } else {
      try { global.localStorage.removeItem(CSRF_KEY); } catch (e) {}
    }
  };

  ApiClient.prototype.clear = function () {
    this.setCsrfToken(null);
  };

  
  ApiClient.prototype.request = function (method, path, body) {
    var url = buildUrl(path);
    var isJson = body != null && typeof body === 'object' &&
                 typeof body.append !== 'function';

    var headers = { Accept: 'application/json' };

    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }

    
    if (!PUBLIC_METHODS[method] && this.csrf) {
      headers['X-CSRF-Token'] = this.csrf;
    }

    var options = {
      method: method,
      headers: headers,
      credentials: 'same-origin',
      cache: 'no-store'
    };

    if (isJson) {
      options.body = JSON.stringify(body);
    } else if (body != null) {
      options.body = body; 
    }

    return global.fetch(url, options).then(function (response) {
      return parseResponse(response).then(function (payload) {
        if (response.status === 401 && typeof global.redirectToLogin === 'function') {
          global.redirectToLogin();
        }
        if (!response.ok) {
          var err = new Error(payload && payload.message ? payload.message : 'Request failed');
          err.status = response.status;
          err.payload = payload;
          throw err;
        }
        return payload;
      });
    });
  };

  

  ApiClient.prototype.get = function (path) {
    return this.request('GET', path);
  };

  ApiClient.prototype.post = function (path, body) {
    return this.request('POST', path, body || {});
  };

  ApiClient.prototype.put = function (path, body) {
    return this.request('PUT', path, body || {});
  };

  ApiClient.prototype.del = function (path) {
    return this.request('DELETE', path);
  };

  

  
  ApiClient.prototype.login = function (identifier, password) {
    var self = this;
    return this.request('POST', '/login', {
      email: identifier,
      password: password
    }).then(function (res) {
      if (res && res.csrf_token) {
        self.setCsrfToken(res.csrf_token);
      }
      return res;
    });
  };

  
  ApiClient.prototype.logout = function () {
    var self = this;
    return this.request('POST', '/logout', {}).then(function (res) {
      self.clear();
      return res;
    });
  };

  
  ApiClient.prototype.me = function () {
    var self = this;
    return this.request('GET', '/me').then(function (res) {
      if (res && res.csrf_token) {
        self.setCsrfToken(res.csrf_token);
      }
      return res;
    });
  };

  

  function readStoredToken() {
    try { return global.localStorage.getItem(CSRF_KEY) || null; } catch (e) { return null; }
  }

  function buildUrl(path) {
    var clean = String(path || '').replace(/^\/+/, '');
    if (clean.indexOf('api/') === 0) {
      clean = clean.substring(4);
    }
    return API_BASE + (clean ? '/' + clean : '');
  }

  function parseResponse(response) {
    var contentType = response.headers.get('content-type') || '';
    if (response.status === 204) {
      return Promise.resolve(null);
    }
    if (contentType.indexOf('application/json') !== -1) {
      return response.json().catch(function () { return null; });
    }
    return response.text();
  }

  

  var singleton = null;

  function client() {
    if (!singleton) {
      singleton = new ApiClient();
    }
    return singleton;
  }

  global.CemboClear = {
    client: client,
    ApiClient: ApiClient,

    
    
    apiBase: API_BASE,

    
    
    attachmentUrl: function (attachmentId, opts) {
      var q = opts && opts.inline ? '?inline=1' : '';
      return API_BASE + '/attachments/' + Number(attachmentId) + q;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
