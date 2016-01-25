EventEmitter = require('events').EventEmitter

MRAID_URL = 'http://services.tvzavr.ru/generic/MRAID/mraid.min.js'

##
# MRAID Container
# @uses EventEmitter
# @namespace widgets
class MRAIDContainer
    ##
    # @param {String} id container ID
    # @param {String} url creative URL
    # @param {Object} params
    # @param {MRAIDPosition} params.defaultPosition container default position
    # @param {String} params.placementType placement type
    # @throws {TypeError} if no id provided or it's not a correct id
    constructor: (id, url, params) ->
        throw new TypeError 'Incorrect MRAID container ID' if not id? or not id or typeof id isnt 'string'
        throw new TypeError 'Incorrect MRAID Ad Unit URL' if not url? or not url or typeof url isnt 'string'

        {defaultPosition, placementType} = params

        @id = id
        @parent = null
        @creativeUrl = url

        @_emitter = new EventEmitter

        @_state = 'loading'
        @_viewable = false
        @_placementType = placementType

        @_maxSize =
            width: window.innerWidth
            height: window.innerHeight

        @_expandProperties = @_maxSize

        @_defaultPosition = defaultPosition
        @_currentPosition = defaultPosition

        @_adView = MRAIDContainer.createAdView id
        @_adView.addEventListener 'load', @_initAdView

        @_setToDefaultPosition()

    ##
    # Create adView for container
    # @param {String} id adView 'id' and 'name' attributes
    # @return {Element} adView
    @createAdView: (id) ->
        adView = document.createElement 'iframe'
        adView.setAttribute 'id', id
        adView.setAttribute 'name', id
        adView.setAttribute 'scrolling', 'no'
        adView.setAttribute 'style', 'border: none; background-color: #000; position: fixed; top: 0; left: 0; z-index: 2147483646; display: none;'
        adView

    ##
    # Init adView after it have been loaded
    # @param {Event} e "load" event object
    _initAdView: (e) =>
        iWin = e.target.contentWindow
        iDoc = iWin.document

        iWin.mraid =
            _sendMessage: @_sendMessage
            placementType: @_placementType
            defaultPosition: @_defaultPosition
            maxSize: @_maxSize
            getVersion: -> '2.0'
            getState: -> 'loading'
            addEventListener: (event, listener) -> iWin.mraid._MRAIDReadyListener = listener if event is 'ready'

        iDoc.write '<style>html, body { margin: 0; padding: 0; }</style>';

        xhr = new XMLHttpRequest()
        xhr.open 'GET', @creativeUrl, true
        xhr.onreadystatechange = () ->
            if xhr.readyState is 4
                if xhr.status is 200
                    iDoc.write '<script src="' + MRAID_URL + '"></script>'
                    iDoc.write xhr.response

        xhr.send null

    ##
    # Send message from controller to container
    # @param {String} message message body
    # @param {Object} data message data
    # @param {Function} callback
    _sendMessage: (message, data, callback) =>
        switch message
            when 'vpaidEvent' then @_emitter.emit 'vpaidEvent', data
            when 'open' then @open data
            when 'state'
                switch data
                    when 'default' then @_setToDefaultPosition()
                    when 'expanded' then @_expand()
                    when 'hidden' then @_close()

        callback = data if typeof data is 'function'
        callback @_currentPosition if callback and typeof callback is 'function'

    ##
    # Set current position of adView
    # @param {MRAIDPosition} position
    _setCurrentPosition: (position) ->
        {x, y, width, height} = position
        @_currentPosition = {
            x,
            y,
            width,
            height
        }

        @_adView.style.top = "#{y}px"
        @_adView.style.left = "#{x}px"
        @_adView.style.width = "#{width}px"
        @_adView.style.height = "#{height}px"

    ##
    # Set to default screen position and size of adView
    _setToDefaultPosition: -> @_setCurrentPosition @_defaultPosition

    ##
    # Expand adView
    _expand: -> @_setCurrentPosition {
        x: 0
        y: 0
        width: @_expandProperties.width
        height: @_expandProperties.height
    }

    ##
    # Change the size of the ad container.
    # @param {String} [URL] the URL for the document to be displayed in a new overlay view. By default, the body of the
    # current ad will be used in the current webview
    expand: (URL) -> @_adView.contentWindow.mraid.expand URL

    ##
    # Display an embedded browser window in the application that loads an external URL.
    #
    # On device platforms that do not allow an embedded browser, the open method invokes the native browser with
    # the external URL.
    # @param {String} URL the URL of the web page
    open: (URL) -> @_emitter.emit 'open', URL

    ##
    # The close method will cause the ad container to downgrade its state.
    #
    # For ads in an expanded or resized state, the close() method moves the ad to a default state.
    # For interstitial ads in a default state, the close() method moves to a hidden state. For banners in a default
    # state, the effect of calling close() is deliberately left undefined by the MRAID specification.
    close: -> @_adView.contentWindow.mraid.close()

    ##
    # The resume method will cause the ad container to resume ad playback after mini-site was closed.
    resume: -> @_adView.contentWindow.mraid._setViewable true

    ##
    # Append to target DOM Node
    # @param {Element} target DOM Node to append adView to
    appendTo: (target) ->
        @parent = target
        target.appendChild @_adView

    ##
    # Show container
    # @return {Boolean} container visibility
    show: ->
        @_adView.style.display = 'block'
        @_viewable = true

        mraid = @_adView.contentWindow.mraid
        mraid._setViewable true if mraid._setViewable?

    ##
    # Hide container
    # @return {Boolean} container visibility
    hide: ->
        @_adView.style.display = 'none'
        @_viewable = false

        mraid = @_adView.contentWindow.mraid
        mraid._setViewable false if mraid._setViewable?

    ##
    # Close container with simple dispatch
    _close: ->
        @_adView.removeEventListener 'load', @_initAdView
        @parent.removeChild @_adView

        delete @parent
        delete @_adView

        @_emitter.emit 'close', @id

    ##
    # Subscribe to event
    # @param {String} event event name
    # @param {Function} listener event listener function
    on: (event, listener) -> @_emitter.addListener event, listener

    ##
    # Unsubscribe from event
    # @param {String} event event name
    # @param {Function} listener event listener function
    off: (event, listener) -> @_emitter.removeListener event, listener

module.exports = MRAIDContainer
