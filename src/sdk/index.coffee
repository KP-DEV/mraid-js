MRAIDContainer = require './container.coffee'

MRAID_VER = '2.0'
DEFAULT_POSITION =
    x: 0
    y: 0
    width: 1280
    height: 720

##
# MRAID JavaScript SDK
# @uses MRAIDContainer
class MRAIDSDK
    ##
    # Available MRAID containers
    # @type Object
    @containers: {}

    ##
    # Get the MRAID spec version number
    # @return {String} the MRAID version that this SDK is certified against by the IAB, or that this SDK is compliant with
    @getVersion: -> MRAID_VER

    ##
    # Create MRAID container and append it to document body
    # @param {String} id container ID
    # @param {String} url MRAID creative URL
    # @return {MRAIDContainer} created MRAID container instance
    @createContainer: (id, url) ->
        timeout = (delay, func) -> setTimeout func, delay

        @removeContainer id if @containers[id]

        container = @containers[id] = new MRAIDContainer id, url, {
            defaultPosition: DEFAULT_POSITION
            placementType: 'interstitial'
        }
        container.on 'close', (_id) => timeout 100, => @removeContainer _id
        container.appendTo document.body

        timeout 100, => container._adView.focus()

        container.show()
        container

    ##
    # Remove MRAID container
    # @param {String} id container ID
    @removeContainer: (id) -> delete @containers[id]

module.exports = MRAIDSDK
