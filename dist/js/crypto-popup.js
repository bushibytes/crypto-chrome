$(function() {
  var engine, populate_keys;
  engine = cryptochrome();
  $('#button-confirm-verify').click(function() {
    return $('#modal-verify').modal('hide');
  });
  $('.button-close-verify').click(function() {
    return $('#modal-verify').modal('hide');
  });
  $('#button-confirm-sign').click(function() {
    var index, key, key_password, master_password, plainText;
    master_password = $('#input-sign-master-password').val();
    key = $('#select-sign-private-key').val();
    key_password = $('#input-sign-private-password').val();
    $('#modal-sign').modal('hide');
    plainText = $('#popup-textarea').val();
    index = parseInt(key);
    return engine.list_private_keys(master_password, function(err, keys) {
      if (err) {
        return alert(err);
      } else {
        return engine.sign(plainText, keys[index], key_password, master_password, function(err, signed_message) {
          $('#popup-textarea').val(signed_message);
          return chrome.tabs.query({
            active: true,
            currentWindow: true
          }, function(tabs) {
            return chrome.tabs.sendMessage(tabs[0].id, {
              fonction: 'inject',
              message: signed_message
            }, function(response) {
              if (response && response.status === 'ok') {

              } else {
                $('#popup-textarea').val(signed_message);
                return true;
              }
            });
          });
        });
      }
    });
  });
  $('.button-close-sign').click(function() {
    return $('#modal-sign').modal('hide');
  });
  $('#button-confirm-decrypt').click(function() {
    var cipherText, index, key, key_password, master_password;
    master_password = $('#input-decrypt-master-password').val();
    key = $('#select-decrypt-private-key').val();
    key_password = $('#input-decrypt-private-password').val();
    $('#modal-decrypt').modal('hide');
    cipherText = $('#popup-textarea').val();
    index = parseInt(key);
    return engine.list_private_keys(master_password, function(err, keys) {
      if (err) {
        return alert(err);
      } else {
        return engine.decrypt(cipherText, keys[index], key_password, master_password, function(err, text) {
          return $('#popup-textarea').val(text);
        });
      }
    });
  });
  $('.button-close-decrypt').click(function() {
    return $('#modal-decrypt').modal('hide');
  });
  $('#button-confirm-encrypt').click(function() {
    var cipherText, index, key, master_password, plainText;
    master_password = $('#input-encrypt-master-password').val();
    key = $('#select-encrypt-public-key').val();
    $('#modal-encrypt').modal('hide');
    plainText = $('#popup-textarea').val();
    cipherText = null;
    index = parseInt(key);
    engine.list_public_keys(master_password, function(err, keys) {
      if (err) {
        return alert(err);
      } else {
        return engine.encrypt(plainText, keys[index], function(err, encrypted_message) {
          cipherText = encrypted_message;
          console.log(cipherText);
          return true;
        });
      }
    });
    $('#popup-textarea').val(cipherText);
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      return chrome.tabs.sendMessage(tabs[0].id, {
        fonction: 'inject',
        message: cipherText
      }, function(response) {
        if (response && response.status === 'ok') {

        } else {
          return $('#popup-textarea').val(cipherText);
        }
      });
    });
  });
  $('.button-close-encrypt').click(function() {
    return $('#modal-encrypt').modal('hide');
  });
  $('#button-confirm-enter-master-password').click(function() {
    var password;
    password = $('#input-entered-master-password').val();
    $('#modal-enter-master-password').modal('hide');
    return populate_keys(engine, password);
  });
  $('.button-close-enter-master-password').click(function() {
    return $('#modal-enter-master-password').modal('hide');
  });
  $('#button-import-textarea').click(function() {
    console.log("Clicked text area");
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      return chrome.tabs.sendMessage(tabs[0].id, {
        fonction: 'retrieve'
      }, function(response) {
        return $('#popup-textarea').html(response.text);
      });
    });
  });
  $('#button-import-message-textarea').click(function() {
    console.log("Clicked text area");
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      return chrome.tabs.sendMessage(tabs[0].id, {
        fonction: 'retrieveLast'
      }, function(response) {
        return $('#popup-textarea').html(response.text);
      });
    });
  });
  $('#button-decrypt').click(function() {
    return $('#modal-decrypt').modal();
  });
  $('#button-sign').click(function() {
    return $('#modal-sign').modal();
  });
  $('#button-encrypt').click(function() {
    return $('#modal-encrypt').modal();
  });
  $('#button-verify').click(function() {
    return $('#modal-verify').modal();
  });
  populate_keys = function(engine, master_password) {
    var e, i, key, name, priv_keys, pub_keys, storage, _i, _j, _len, _len1, _results;
    if (!master_password) {
      return $('#modal-enter-master-password').modal();
    } else {
      storage = window.localStorage;
      if (!(storage['crypto-chrome-pub'] || storage['crypto-chrome-priv'])) {
        return alert("You must initiate the storage first by visiting the setting page");
      }
      try {
        pub_keys = null;
        priv_keys = null;
        engine.list_public_keys(master_password, function(err, keys) {
          return pub_keys = keys;
        });
        engine.list_private_keys(master_password, function(err, keys) {
          return priv_keys = keys;
        });
      } catch (_error) {
        e = _error;
        alert("Failed to decrypt storage");
        throw e;
      }
      $("select").empty();
      i = 0;
      for (_i = 0, _len = pub_keys.length; _i < _len; _i++) {
        key = pub_keys[_i];
        name = openpgp_encoding_html_encode(key[0].userIds[0].text);
        $(".select-public-key").append("<option value='" + i + "'>" + name + "</option>");
        i++;
      }
      i = 0;
      _results = [];
      for (_j = 0, _len1 = priv_keys.length; _j < _len1; _j++) {
        key = priv_keys[_j];
        name = openpgp_encoding_html_encode(key[0].userIds[0].text);
        $(".select-private-key").append("<option value='" + i + "'>" + name + "</option>");
        _results.push(i++);
      }
      return _results;
    }
  };
  return populate_keys(engine);
});
