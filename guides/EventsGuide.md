# `"ready"`
The ready event triggers when the container is fully loaded, initialized, and ready for any calls from the ad creative. It is the responsibility of the MRAID-compliant container to prepare the API methods before the ad creative is loaded.
While the container may load all of MRAID at once, at a minimum the container must be prepared to support the getState and addEventListener capabilities as early as possible in the ad loading process; otherwise there will be no way for the ad to register for the ready event. In the event that the container may still need more time to initialize settings or prepare additional features, ready should only fire when the container is completely prepared for any MRAID request.

```
ready -> function()
```
*parameters*
* none

*triggered by*
* none

# `"error"`
This event is triggered whenever a container error occurs. The event contains a description of the error that occurred and, when appropriate, the name of the action that resulted in the error (in the absence of an associated action, the action parameter is null).
While the “message” part of the error event is not defined by the MRAID specification and mainly intended for pre-flight debugging of creative, the “action” part of the error is always the name of the method that the ad tried to use that led to the error.

```
error -> function(message, action)
```
*parameters*
* `message:string` - description of the type of error
* `action:string` - name of action that caused error

*triggered by*
* anything that goes wrong

# `"stateChange"`
The stateChange event fires when the state is changed programmatically by the ad or by the environment. This event is triggered when the Ad View changes between default, expanded, resized, and hidden states as the result of an expand(), resize(), or a close().

```
stateChange -> function(state)
```
*parameters*
* `state:number` - "loading|default|expanded|resized|hidden"

*triggered by*
* expand, close, resize or the app

# `"viewableChange"`
The viewableChange event fires when the ad moves from on-screen to off-screen and vice versa.

```
stateChange -> function(viewable)
```
*parameters*
* `viewable:boolean` - true: container is on-screen and viewable by the user; false: container is offscreen and not 
viewable

*triggered by*
* a change in the application view controller

# `"sizeChange"`
The `sizeChange` event fires when the ad’s size within the app UI changes. This can be the result of an orientation change of the device or calls to the resize or expand methods. Measurements are in density-independent pixels.
This event is triggered when the display state of the ad’s web view changes.

```
sizeChange -> function(width, height)
```
*parameters*
* `width:number` - the width of the view
* `height:number` - the height of the view

*triggered by*
* a change in the view size as the result of a resize, expand, close, orientation, or the app after registering a 
`sizeChange` event listener
