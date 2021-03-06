"use strict";

module.exports = function(environment) {
  const ENV = {
    modulePrefix: "ember-caluma-form-builder",
    environment,

    "ember-validated-form": {
      theme: "uikit",
      defaults: {
        label: "cfb-label"
      }
    }
  };

  return ENV;
};
