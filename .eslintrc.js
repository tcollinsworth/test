module.exports = {
  "parser": "babel-eslint",
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "rules": {
    "semi": [2, 'never'],
    "import/no-extraneous-dependencies": ['error', { devDependencies: true }],
    "max-len": [1, 120, 2, { "ignoreComments": true }]
  }
}
