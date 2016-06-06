![npm install subtlepatterns](https://nodei.co/npm/subtlepatterns.png?mini=true)

Subtle patterns tool
===
Just a simple lib to

 - get actual sublte patterns list as JSON from its website
 - download the patterns
 
These go by **CC BY-SA 3.0** license. So play nicely and leave a credit when you use them. Read [subtlepatterns.com](http://subtlepatterns.com/about/) for more.

Usage
---
To use as a lib (why would you need that? Whatever...) read index.js

To download the patterns (files) and build JSON with meta - install package globally via npm:

    npm install -g subtlepatterns
    
And then run
  
    subtlepatterns download
    
And files will be downloaded to patterns folder. That's pretty much all for now
