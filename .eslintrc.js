module.exports = {
    "extends": "airbnb-base",
    "rules": {
        "linebreak-style": ["error", "unix"],
        "no-cond-assign": ["error", "always"],
        // disable rules from base configurations
        "no-console": "off",
        "max-len": ["error", 180, { "ignoreComments": true, },],
        "no-underscore-dangle": "off",
    },
};