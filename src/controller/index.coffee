EventEmitter = require('events').EventEmitter
CloseIndicator = require './close-indicator.coffee'

MRAID_VER = '2.0'
SUPPORTS =
    sms: false
    tel: false
    calendar: false
    storePicture: false
    inlineVideo: true
    vpaid: true

STATES = ['loading', 'default', 'expanded', 'resized', 'hidden']
PLACEMENTS = ['inline', 'interstitial']

## # MRAID Controller # # Used as a bridge between SDK and ad unit. # @uses EventEmitter # @uses CloseIndicator
class MRAID ## # State of current ad container # # * *loading* - the container is not yet ready for interactions with the MRAID implementation # * *default* - the initial position and size of the ad container as placed by the application and SDK # * *expanded* - the ad container has expanded to cover the application content at the top of the view hierarchy # * *resized* - the ad container has changed size via MRAID 2.0’s resize() method # * *hidden* - the state an interstitial ad transitions to when closed. Where supported, the state a banner ad transitions to when closed # @type String
    @_state: 'loading'

    ##
    # Placement type of current ad container.
    #
    # * *inline* - the default ad placement is inline with content in the display (i.e. a banner)
    # * *interstitial* - the ad placement is over laid on top of content
    # @type String
    @_placementType: 'interstitial'

    ##
    # Whether the container on-screen and viewable by the user
    # @type Boolean
    @_viewable: false

    ##
    # The maximum size an ad can expand or resize to
    # @type MRAIDSize
    @_maxSize:
        width: 0
        height: 0

    ##
    # The position and size of the default ad view
    # @type MRAIDPosition
    @_defaultPosition:
        x: 0
        y: 0
        width: 0
        height: 0

    ##
    # The current position and size of the ad view
    # @type MRAIDPosition
    @_currentPosition:
        x: 0
        y: 0
        width: 0
        height: 0

    ##
    # The resize properties object is intended to provide additional features to ad designers
    # @type MRAIDResizeProperties
    @_resizeProperties:
        width: 0
        height: 0
        offsetX: 0
        offsetY: 0
        customClosePosition: 'top-right'
        allowOffscreen: true

    ##
    # The expand properties object is intended to provide additional features to ad designers
    # @type MRAIDExpandProperties
    @_expandProperties:
        width: 0
        height: 0
        useCustomClose: false
        isModal: true

    ##
    # The orientation properties object is intended to provide ad designers with additional control over expandable
    # and interstitial ads
    # @type MRAIDOrientationProperties
    @_orientationProperties:
        allowOrientationChange: true
        forceOrientation: 'landscape'

    ##
    # Event emitter
    # @type EventEmitter
    # @private
    @_emitter: new EventEmitter

    # ==================================================================================================================
    ##
    # Get the MRAID spec version number
    # @return {String} MRAID version number
    @getVersion: -> MRAID_VER

    ##
    # Subscribe to specific event
    # @param {String} event name of event to listen for
    # @param {Function} listener function to execute
    @addEventListener: (event, listener) ->
        if not event?
            @_emitError 'No event name to listen for provided', 'addEventListener'
            return

        if not listener?
            @_emitError 'No listener for event provided', 'addEventListener'
            return

        @_emitter.addListener event, listener

    ##
    # Unsubscribe from specific event
    #
    # If no listener function is specified, then all functions listening to the event will be removed.
    # @param {String} event name of event
    # @param {Function} [listener] function to be removed
    @removeEventListener: (event, listener) ->
        if not event?
            @_emitError 'No event name to unsubscribe from provided', 'removeEventListener'
            return

        if listener
            @_emitter.removeListener event, listener
        else
            @_emitter.removeAllListeners event

    # ==================================================================================================================
    ##
    # Get state of current ad container
    # @return {String} ad container state ("loading|default|expanded|resized|hidden")
    @getState: -> @_state

    ##
    # Set state of current ad container
    # @param {String} state
    @_setState: (state) ->
        if state in STATES and state isnt @_state
            @_state = state
            @_emitter.emit 'stateChange', state

    ##
    # Get placement type of current ad container
    #
    # getPlacementType should always return the placement that it initially displayed in. That is, in the case of
    # two-part expandables, the second, expanded part should also see “inline” if it does a getPlacementType.
    # @return {String} ad container placement type ("inline", "interstitial")
    @getPlacementType: -> @_placementType

    ##
    # Set placement type of current ad container
    # @param {String} placement
    @_setPlacementType: (placement) -> @_placementType = placement if placement in PLACEMENTS

    ##
    # Returns whether the ad container is currently on or off the screen
    #
    # For a two-piece expandable ad, when the ad state is expanded, isViewable will return an answer based on the
    # viewability of the expanded piece of the ad. Note that MRAID does not define a minimum threshold percentage or
    # number of pixels of the ad that must be onscreen to constitute "viewable".
    # @return {Boolean} **true**: container is on-screen and viewable by the user; **false**: container is
    # off-screen and not viewable
    @isViewable: -> @_viewable

    ##
    # Set whether the ad container is currently on or off the screen
    # @param {Boolean} viewable **true**: container is on-screen and viewable by the user; **false**: container is
    # off-screen and not viewable
    @_setViewable: (viewable) ->
        viewable = !!viewable

        if viewable isnt @_viewable
            @_viewable = viewable
            @_emitter.emit 'viewableChange', viewable

    # ==================================================================================================================
    ##
    # Display an embedded browser window in the application that loads an external URL.
    #
    # On device platforms that do not allow an embedded browser, the open method invokes the native browser with
    # the external URL.
    # @param {String} URL the URL of the web page
    @open: (URL = '') ->
        if typeof URL is 'string' and URL
            @_sendMessage 'open', URL, => @_emitter.emit 'viewableChange', false
        else
            @_emitError 'No or invalid URL passed in', 'open'

    # ==================================================================================================================
    ##
    # Expand ad view
    #
    # The expand method will cause an existing web view (for one-part creatives) or a new web view (for two-part
    # creatives) to open at the highest level (e.g., at a higher z-index value than any app content) in the view
    # hierarchy.
    # The expanded view can either contain a new HTML document if a URL is specified, or it can reuse the same
    # document that was in the default position.
    # @param {String} [URL] the URL for the document to be displayed in a new overlay view. By default, the body of the
    # current ad will be used in the current webview
    # @todo Make it work with URL passed in (now emits "error" event in this case)
    @expand: (URL) ->
        return if @_state is 'expanded'

        if URL
            @_emitError 'Not implemented. Connect with the developer of this piece of shit and say it to him', 'expand'
        else
            @_sendMessage 'state', 'expanded', =>
                @_setCurrentPosition {
                                         x: 0
                                         y: 0
                                         width: @_expandProperties.width
                                         height: @_expandProperties.height
                                     }
                @_setState 'expanded'

    ##
    # Returns the expandProperties object
    # @return {MRAIDExpandProperties} expand properties
    @getExpandProperties: -> @_expandProperties

    ##
    # Set the ad's expand properties, including the maximum width and height of the ad creative, and whether the
    # creative is supplying its own close indicator
    # @param {MRAIDExpandProperties} properties expand properties
    @setExpandProperties: (properties) ->
        if @_state isnt 'expanded'
            {width, height, useCustomClose} = properties

            @_expandProperties.width = width if width?
            @_expandProperties.height = height if height?
            @_expandProperties.useCustomClose = useCustomClose if useCustomClose?

    # ==================================================================================================================
    ##
    # Returns the orientationProperties object
    # @return {MRAIDOrientationProperties}
    @getOrientationProperties: -> @_orientationProperties

    ##
    # Set the orientationProperties object
    # @param {MRAIDOrientationProperties} properties orientation properties
    @setOrientationProperties: (properties) ->
        {allowOrientationChange, forceOrientation} = properties

        @_orientationProperties.allowOrientationChange = allowOrientationChange if allowOrientationChange?
        @_orientationProperties.forceOrientation = forceOrientation if forceOrientation?


    # ==================================================================================================================
    ##
    # The close method will cause the ad container to downgrade its state
    #
    # For ads in an expanded or resized state, the close() method moves the ad to a default state.
    # For interstitial ads in a default state, the close() method moves to a hidden state. For banners in a default
    # state, the effect of calling close() is deliberately left undefined by the MRAID specification.
    @close: ->
        switch @_state
            when 'expanded', 'resized'
                @_sendMessage 'state', 'default', => @_setState 'default'
            when 'default'
                if @_placementType is 'interstitial'
                    @_sendMessage 'state', 'hidden', => @_setState 'hidden'
            else
                @_emitError 'Error occurred while trying to close container', 'close'

    ##
    # Signal the container to stop using the default close indicator
    #
    # This method serves as a convenience method to the expand property of the same name. Setting the property or
    # calling this method both have the same effect and can be used interchangeably. If an ad sets useCustomClose
    # via both expand properties AND this method, whichever is invoked later will override the earlier setting.
    # @param {Boolean} use true – ad creative supplies its own design for the close indicator; false – container
    # default image should be displayed for the close indicator
    @useCustomClose: (use) ->
        @_expandProperties.useCustomClose = use if use?
        @_closeIndicator.hide() if use and @_closeIndicator?

    # ==================================================================================================================
    ##
    # Will cause the existing web view to change size using the existing HTML document
    # @todo Implement
    @resize: -> @_emitError 'Not implemented. Connect with the developer of this piece of shit and say it to him', 'resize'

    ##
    # Returns the resizeProperties object
    # @return {MRAIDResizeProperties} resize properties
    @getResizeProperties: -> @_resizeProperties

    ##
    # Set resizeProperties object
    #
    # Use this method to set the ad's resize properties, in particular the width and height of the resized ad creative.
    # @param {MRAIDResizeProperties} properties this object contains the width and height of the resized ad, close position,
    # offset direction (all in density-independent pixels), and whether the ad can resize offscreen
    @setResizeProperties: (properties) ->
        {width, height, offsetX, offsetY, customClosePosition, allowOffscreen} = properties

        @_resizeProperties.width = width if width?
        @_resizeProperties.height = height if height?
        @_resizeProperties.offsetX = offsetX if offsetX?
        @_resizeProperties.offsetY = offsetY if offsetY?
        @_resizeProperties.customClosePosition = customClosePosition if customClosePosition?
        @_resizeProperties.allowOffscreen = allowOffscreen if allowOffscreen?

    # ==================================================================================================================
    ##
    # Returns the current position and size of the ad view, measured in density-independent pixels
    # @return {MRAIDPosition} current ad container position
    @getCurrentPosition: -> @_currentPosition

    ##
    # Set the current position and size of the ad view, measured in density-independent pixels
    # @param {MRAIDPosition} position current ad container position
    @_setCurrentPosition: (position) ->
        {x, y, width, height} = position

        @_currentPosition.x = x if x?
        @_currentPosition.y = y if y?
        @_currentPosition.width = width if width?
        @_currentPosition.height = height if height?

        @_emitter.emit 'sizeChange', @_currentPosition.width, @_currentPosition.height if width? or height?

    ##
    # Returns the maximum size (in density-independent pixel width and height) an ad can expand or resize to
    #
    # If the app runs full-screen on the device (e.g., covers the status bar), the max size will be the full screen
    # dimensions. If the app runs at less than full screen on the device, due to screen area reserved for a status
    # bar or other elements outside the app, then the max size will return the size of the view that contains the
    # app (which defines the maximum space the ad may resize within).
    # @return {MRAIDSize} the maximum width and height the view can grow to
    @getMaxSize: -> @_maxSize

    ##
    # Set the maximum size an ad can expand or resize to
    # @param {MRAIDSize} size the maximum width and height the view can grow to
    @_setMaxSize: (size) ->
        {width, height} = size

        @_maxSize.width = width if width?
        @_maxSize.height = height if height?

    ##
    # Returns the position and size of the default ad view, measured in density-independent pixels, regardless of what
    # state the calling view is in
    # @return {MRAIDPosition} default ad container position
    @getDefaultPosition: -> @_defaultPosition

    ##
    # Set the position and size of the default ad view
    # @param {MRAIDPosition} position default ad container position
    @_setDefaultPosition: (position) ->
        {x, y, width, height} = position

        @_defaultPosition.x = x if x?
        @_defaultPosition.y = y if y?
        @_defaultPosition.width = width if width?
        @_defaultPosition.height = height if height?

    ##
    # Returns the current actual pixel width and height, based on the current orientation, in density-independent
    # pixels, of the device on which the ad is running.
    #
    # Note that the ScreenSize will change if the device is turned from portrait to landscape mode (and vice
    # versa). Note also that getScreenSize will return the TOTAL size of the device screen, including area (if any)
    # reserved by the OS for status/system bars or other functions, which cannot be overridden by the app or the ad.
    # @return {MRAIDSize}
    @getScreenSize: ->
        size =
            width: window.screen.width
            height: window.screen.height

    # ==================================================================================================================
    ##
    # Returns support of specific device features
    #
    # * *sms* - the device supports using the sms: protocol to send an SMS message
    # * *tel* - the device supports initiating calls using the tel: protocol
    # * *calendar* - the device can create a calendar entry
    # * *storePicture* - the device supports the MRAID storePicture method
    #* *inlineVideo* - The device can playback HTML5 video files using the &lt;video&gt; tag and honors the size (width
    # and height) specified in the video tag. This does not require the video to be played in full screen.
    # @param {String} feature name of feature
    # @return {Boolean} true, the feature is supported and getter and events are available; false, the
    # feature is not supported on this device
    @supports: (feature) ->
        if feature of SUPPORTS
            SUPPORTS[feature]
        else
            false

    ##
    # Open the device UI to create a new calendar event
    #
    # The ad is suspended while the UI is open. Where a device does not support such a "create calendar event"
    # sheet, the SDK should treat that device as if it does not support adding calendar events. Calendar event data
    # should be delivered in the form of a JavaScript object written to the W3C’s calendar specification.
    # @param {Object} params the parameters for the calendar entry, written according to the W3C specification for
    # calendar entries
    # @todo Implement (now emits "error" event)
    @createCalendarEvent: (params) -> @_emitError 'Not supported by SDK', 'createCalendarEvent'

    ##
    # Play a video on the device via the device’s native, external player
    # @param {String} URI the URI of the video or video stream
    # @todo Implement (now emits "error" event)
    @playVideo: (URI) -> @_emitError 'Not supported by SDK', 'playVideo'

    ##
    # Place a picture in the device's photo album
    #
    # To ensure that the user is aware a picture is being added to the photo album, MRAID requires the SDK/container
    # use an OS-level handler to display a modal dialog box asking that the user confirm or cancel the addition to
    # the photo album for each image added. If the device does not have a native “add photo” confirmation handler,
    # the SDK should treat the device as though it does not support storePicture. If the attempt to add the picture
    # fails for any reason or is cancelled by the user, it will trigger an error.
    # @param {String} URI the URI to the image or other media asset
    # @todo Implement (now emits "error" event)
    @storePicture: (URI) -> @_emitError 'Not supported by SDK', 'storePicture'


    # ==================================================================================================================
    ##
    # Init VPAID protocol in container
    # @param {Object} vpaidObject VPAID object
    @initVpaid: (vpaidCreative) ->
        if not @_checkVPAIDInterface vpaidCreative
            console.log 'vpaid check failed', vpaidCreative
            @_emitError 'Incorrect VPAID Creative Interface. VPAID will not be initialized', 'initVpaid'
            return

        onAdImpression = => @_sendMessage 'vpaidEvent', {name: 'adImpression'}
        onStartAd = => @_sendMessage 'vpaidEvent', {name: 'startAd'}
        onAdVideoStart = => @_sendMessage 'vpaidEvent', {name: 'adVideoStart'}
        onAdVideoFirstQuartile = => @_sendMessage 'vpaidEvent', {name: 'adVideoFirstQuartile'}
        onAdVideoMidpoint = => @_sendMessage 'vpaidEvent', {name: 'adVideoMidpoint'}
        onAdVideoThirdQuartile = => @_sendMessage 'vpaidEvent', {name: 'adVideoThirdQuartile'}
        onAdVideoComplete = => @_sendMessage 'vpaidEvent', {name: 'adVideoComplete'}
        onAdClickThru = (url, id, playerHandles) => @_sendMessage 'vpaidEvent', {name: 'adClickThru', params: {url: url, id: id, playerHandles: playerHandles}}
        onAdInteraction = (id) => @_sendMessage 'vpaidEvent', {name: 'adInteraction', params: id}
        onAdDurationChange = =>
            duration = vpaidCreative.getAdDuration()
            remaining = vpaidCreative.getAdRemainingTime()
            @_sendMessage 'vpaidEvent', {name: 'adDurationChange', params: {duration: duration, remaining: remaining}}
        onAdUserAcceptInvitation = => @_sendMessage 'vpaidEvent', {name: 'adUserAcceptInvitation'}
        onAdUserMinimize = => @_sendMessage 'vpaidEvent', {name: 'adUserMinimize'}
        onAdUserClose = => @_sendMessage 'vpaidEvent', {name: 'adUserClose'}
        onAdPaused = => @_sendMessage 'vpaidEvent', {name: 'adPaused'}
        onAdPlaying = => @_sendMessage 'vpaidEvent', {name: 'adPlaying'}
        onAdError = (message) => @_sendMessage 'vpaidEvent', {name: 'adError', params: message}
        onAdLog = (id) => @_sendMessage 'vpaidEvent', {name: 'adLog', params: id}

        callbacks =
            AdImpression: onAdImpression
            AdStarted: onStartAd
            AdVideoStart: onAdVideoStart
            AdVideoFirstQuartile: onAdVideoFirstQuartile
            AdVideoMidpoint: onAdVideoMidpoint
            AdVideoThirdQuartile: onAdVideoThirdQuartile
            AdVideoComplete: onAdVideoComplete
            AdClickThru: onAdClickThru
            AdInteraction: onAdInteraction
            AdDurationChange: onAdDurationChange
            AdUserAcceptInvitation: onAdUserAcceptInvitation
            AdUserMinimize: onAdUserMinimize
            AdUserClose: onAdUserClose
            AdPaused: onAdPaused
            AdPlaying: onAdPlaying
            AdError: onAdError
            AdLog: onAdLog

        vpaidCreative.subscribe callback, event for event, callback of callbacks

        vpaidCreative.startAd()

    ##
    # Check VPAID Interface of the creative
    # @param {Object} vpaidCreative VPAID Creative object
    # @return {Boolean} whether the VPAID Creative implements all of the functions required by the MRAID+VPAID spec
    @_checkVPAIDInterface: (vpaidCreative) ->
        return true if vpaidCreative.subscribe and vpaidCreative.unsubscribe and vpaidCreative.getAdDuration and vpaidCreative.getAdRemainingTime and vpaidCreative.startAd
        false

    # ==================================================================================================================
    ##
    # Emit error event
    # @param {String} message description of the type of error
    # @param {String} [action=null] name of action that caused error
    @_emitError: (message, action = null) -> @_emitter.emit 'error', message, action

    # "fake" static constructor
    do ->
        MRAID._sendMessage = window.mraid._sendMessage

        MRAID._setPlacementType window.mraid.placementType
        MRAID._setDefaultPosition window.mraid.defaultPosition
        MRAID._setCurrentPosition window.mraid.defaultPosition
        MRAID._setMaxSize window.mraid.maxSize
        MRAID.setExpandProperties window.mraid.maxSize

        MRAID.addEventListener 'ready', window.mraid._MRAIDReadyListener if window.mraid._MRAIDReadyListener

        MRAID._closeIndicator = new CloseIndicator
        MRAID._closeIndicator.on 'click', -> MRAID.close()

        timeout = (delay, func) -> setTimeout func, delay
        timeout 1000, =>
            MRAID._closeIndicator.appendTo window.document.body
            MRAID._closeIndicator.show() if not MRAID._expandProperties.useCustomClose

        document.addEventListener 'click', (e) ->
            html = document.documentElement
            body = document.body
            target = e.target

            while target isnt body and target isnt html
                if target.nodeName.toLowerCase() is 'a'
                    e.preventDefault()
                    return
                target = target.parentNode

        window.mraid = MRAID
        window.mraid._setState 'default'
        window.mraid._emitter.emit 'ready'

module.exports = MRAID
