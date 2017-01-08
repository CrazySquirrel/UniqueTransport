#!/bin/bash

npm update
npm run development:server
npm run development:client
npm run production:server
npm run production:client
git status
git add .
git commit -am "Auto publish"
git push origin master
npm version patch
git push --tags
npm publish
