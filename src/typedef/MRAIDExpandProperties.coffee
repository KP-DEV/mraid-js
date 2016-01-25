##
# Provides set of properties to define the container/ad view expandProperties
# @namespace typedef
class MRAIDExpandProperties
    ##
    # Width of creative, default is full screen width
    # @property width
    # @type Number

    ##
    # Height of creative, default is full screen height. Note that when getting the expand properties before setting
    # them, the values for width and height will reflect the actual values of the screen.
    # @property height
    # @type Number

    ##
    # Ad creative’s custom close indicator; **false** (default), container will display the default close graphic
    # **true**, container will stop showing default close graphic and rely on
    # @property useCustomClose
    # @type Boolean

    ##
    # True, the container is modal for the expanded ad; false, the container is not
    # modal for the expanded ad; this property is read-only and cannot be set by the ad designer. Note that while
    # this could be **false** in MRAID 1.0, in MRAID v2.0 will always return **true**
    # @property isModal
    # @type Boolean
