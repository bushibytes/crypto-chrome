function cryptochrome() {
  function init() {
    this.openpgp = openpgp.init();
  }
  this.init = init;

  /**
   * @return string Armored string of the message encoded
   */
  function encrypt(message, key, callback) {
    var encrypted_message = this.openpgp.write_encrypted_message([key], message);
    if(encrypted_message) {
      return callback(null, encrypted_message);
    }
    return callback("Failed to encrypt message");
  };
  this.encrypt = encrypt;

  /**
   * Descrypt an armored text
   * @return string
   */
  function decrypt(armored_encrypted_msg, key, passphrase, callback) {
    var privkey = this.find_private_key_by_id(key.obj.getKeyId());
    if(privkey.length == 0) {
      return callback("No private key found");
    }
    var privkey_armored = privkey[0].key.armored;

    if(!key.decryptSecretMPIs(passphrase)) {
      return callback("Wrong passphrase");
    }

    var msg = this.openpgp.read_message(armored_encrypted_msg);

    for (var i = 0; i< msg[0].sessionKeys.length; i++) {
      if (privkeys[0].privateKeyPacket.publicKey.getKeyId() === msg[0].sessionKeys[i].keyId.bytes) {
        var keymat = { key: privkey[0], keymaterial: privkey[0].privateKeyPacket};
        var sesskey = msg[0].sessionKeys[i];
        break;
      }

      for (var j = 0; j < privkey[0].subKeys.length; j++) {
        if (privkey[0].subKeys[j].publicKey.getKeyId() === msg[0].sessionKeys[i].keyId.bytes) {
          if(!privkey[0].subKeys[j].decryptSecretMPIs(passphrase)) {
            return callback("Wrong passphrase");
          }
          var keymat = { key: privkey[0], keymaterial: privkey[0].subKeys[j]};
          var sesskey = msg[0].sessionKeys[i];
          break;
        }
      }
    }

    try {
      var decrypted = msg[0].decrypt(keymat, sesskey);
      return callback(null, decrypted);
    } catch (e) {
      return callback("Failed to decrypt message");
    }

  };
  this.decrypt = decrypt;

  function list_public_keys(master_password, callback) {
    var keys = JSON.parse(sjcl.decrypt(master_password, window.localStorage['crypto-chrome-pub']));
    if(keys) {
      return callback(null, keys);
    }
    return callback("Wrong master key");
  };
  this.list_public_keys = list_public_keys;

  function add_public_key_from_armored(master_password, armored_key, callback) {
    key = this.openpgp.read_publicKey(armored_key);
    if(!key) {
      return callback("Wrong key format.");
    }

    var keys = JSON.parse(sjcl.decrypt(master_password, window.localStorage['crypto-chrome-pub']));
    if(keys) {
      keys.push(key);
      window.localStorage['crypto-chrome-pub'] = sjcl.encrypt(master_password, JSON.stringify(keys));
      return callback();
    }
    return callback("Wrong master key");
  }
  this.add_public_key_from_armored = add_public_key_from_armored;

  function list_private_keys(master_password, callback) {
    var keys = JSON.parse(sjcl.decrypt(master_password, window.localStorage['crypto-chrome-priv']));
    if(keys) {
      return callback(null, keys);
    }
    return callback("Wrong master key");
  };
  this.list_private_keys = list_private_keys;

  function add_private_key_from_armored(master_password, armored_key, callback) {
    key = this.openpgp.read_privateKey(armored_key);
    if(!key) {
      return callback("Wrong key format.");
    }

    var keys = JSON.parse(sjcl.decrypt(master_password, window.localStorage['crypto-chrome-priv']));
    if(keys) {
      keys.push(key);
      window.localStorage['crypto-chrome-priv'] = sjcl.encrypt(master_password, JSON.stringify(keys));
      return callback();
    }
    return callback("Wrong master key");
  }
  this.add_private_key_from_armored = add_private_key_from_armored;

  function find_key_by_email(master_password, email, callback) {
    return this.list_public_keys(master_password, function(err, keys) {
      if(err) {
        return callback(err);
      }

      var results = []
      for(var i = 0; i <= keys.length; i++) {
        for(var j = 0; j <= keys[0].obj.userIds.length; j++) {
          if (keys[i].obj.userIds[j].text.toLowerCase().indexOf(email) >= 0)
            results.push(keys[i]);
          }
      }

      return callback(null, results);
    });
  }
  this.find_key_by_email = find_key_by_email;

  function find_private_key_by_id(master_password, id, callback) {
    return this.list_private_keys(master_password, function(err, keys) {
      if(err) {
        return callback(err);
      }

      var results = []
      for(var i = 0; i <= keys[0].length; i++) {
        if (id == keys[i].obj.getKeyId()) {
          results.push({ key: keys[i], keymaterial: keys[i].obj.privateKeyPacket});
        }
        if(keys[i].obj.subKeys != null) {
          var subkeyids = this.privateKeys[i].obj.getSubKeyIds();
          for(var j = 0; j <= subkeyids.length; j++) {
            if (keyId == util.hexstrdump(subkeyids[j])) {
              results.push({ key: keys[i], keymaterial: keys[i].obj.subKeys[j]});
            }
          }
        }
      }
      return callback(null, results);
    });
  }
  this.find_private_key_by_id = find_private_key_by_id;

  function delete_public_key_by_index(master_password, index, callback) {
    return this.list_public_keys(master_password, function(err, keys) {
      if(err) {
        return callback(err);
      }
      keys.slice(index, 1);
      window.localStorage['crypto-chrome-pub'] = sjcl.encrypt(master_password, JSON.stringify(keys));
    });
  }
  this.delete_public_key_by_index = delete_public_key_by_index;

  function delete_private_key_by_index(master_password, index, callback) {
    return this.list_private_keys(master_password, function(err, keys) {
      if(err) {
        return callback(err);
      }
      keys.slice(index, 1);
      window.localStorage['crypto-chrome-priv'] = sjcl.encrypt(master_password, JSON.stringify(keys));
    });
  }
  this.delete_private_key_by_index = delete_private_key_by_index;


  return this;
}
