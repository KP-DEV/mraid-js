##
# Represents resizeProperties object
# @namespace typedef
class MRAIDResizeProperties
    ##
    # Width of creative in pixels
    # @property width
    # @type Number

    ##
    # Height of creative in pixels
    # @property height
    # @type Number

    ##
    # The horizontal delta from the banner's upper left-hand corner where the upper left - hand corner of the
    # expanded region should be placed; positive integers for expand right; negative for left
    # @property offsetX
    # @type Number

    ##
    # The vertical delta from the banner's upper left-hand corner where the upper left - hand corner of the expanded
    # region should be placed; positive integers for expand down; negative for up
    # @property offsetY
    # @type Number

    ##
    # Either `top-left`, `top-right`, `center`, `bottom-left`, `bottom-right,` `top-center`, or `bottom-center`
    # indicates the origin of the container-supplied close event region relative to the resized creative. If not
    # specified or not one of these options, will default to `top-right`.
    # @property customClosePosition
    # @type String

    ##
    # Tells the container whether or not it should allow the resized creative to be drawn fully/partially offscreen
    #
    # * `true` (default): the container should not attempt to position the resized creative
    # * `false`: the container should try to reposition the resized creative to always fit in the getMaxSize() area
    # @property allowOffscreen
    # @type Boolean
