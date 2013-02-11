# Mighty player #
----

Mighty player is a weekend project which goal was to develop some mashup based on [soundcloud](http://soundcloud.com)

It is a soundcloud based player, where instead of controlling the flow using browser, you can open remote control on any device and give commands to browser player from anywhere.

Go ahead and try clicking Demo and then green "Use remote" button, scan QR code or enter short url on your mobile and CONTROL THE MIGHTY PLAYER :D

---
# Used technologies #

### Server ###
* node.js
* nvm, upstart, npm
* express.js
* underscore.js as template engine
* socket.io
* capistrano for deployment
* modified recipies for deployment with nvm+upstart

### Client ###
* Twitter Bootstrap
* Knockout.js
* Soundmanager2
* Custom core
* Google shortener api
* jQuery, jquery.qr.code library


# TODO #
### General TODO ###
* Get rid of soundmanager2
* Add require.js + assets manager
* Add configuration for express.js
* Add custom playlist creation for SC
* Improve design and ui


### Player TODO ###
* Prev and next should cycle through playlist
* Add support for youtube
* Allow to shuffle and cycle playlist
* Add volume control

