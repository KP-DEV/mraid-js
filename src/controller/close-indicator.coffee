EventEmitter = require('events').EventEmitter

CLOSE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABiElEQVRYR8WX7VHDMAyG304AG5QNaCegTMIIrMII3QS6AWzQEcoG3NuLco5jWR/OHf7ZNH4e27Kk7PDPY6fwzwCeAbwCuA06HgB8Ari25msJEP42Qb8HJQT+qM1XC5RwWXhWooY35ysFWvCshAZfzScCHwDejbP27oQFF8wXj1cEGCB7R7BZEl44UT8ADiLAF2n0MCARhZ94w8oYGJGIwH+58ulaor4FGYmn6Z7LVettIuFcOY/yPlp5ICpBgRRcE+DvEQlH2GC18t4OyLOtJFR4bwe2kujCPQIjx2HCvQIZCRc8KsCS6ol2zmtlzDlwtX6gjOxIkinfc0lYAlm4u4r2BEbhLglNYCu4KaGlYm/AMdo50lW0VYwicBYWjnQpr8txFC5VLZK2F7ejbEiy8EzaniWiLZmV4aI7cRQBnuGLUVcteHQnLmxORIAplhL8GmoNL9wrwYZ01RNqElG4JTHDW8WolsjCNYkFXKuGIsFeb9FAGjGiPZbA5LfHfdvLP1rFKMn0v/YH3SyKIXgTEY0AAAAASUVORK5CYII='

###
# Close indicator widget
# @extends EventEmitter
# @namespace widgets
###
class CloseIndicator extends EventEmitter
    constructor: ->
        @_viewable = false

        @_elem = document.createElement 'div'
        @_elem.setAttribute 'style', 'border-bottom-left-radius: 5px; width: 50px; height: 50px; position: absolute; top: 0; right: 0; z-index: 2147483647; display: none; box-shadow: 0 0 4px 0 rgba(0, 0, 0, .5);'
        @_elem.style.background = "rgba(255, 255, 255, .5) url(#{CLOSE_IMAGE}) 50% 50% no-repeat"

        @_elem.addEventListener 'click', (e) => @emit 'click', e

    ###
    # Append to target DOM Node
    # @param {Element} target DOM Node to append indicator to
    ###
    appendTo: (target) ->
        @parent = target
        target.appendChild @_elem

    ###
    # Show indicator
    # @return {Boolean} indicator visibility
    ###
    show: ->
        @_elem.style.display = 'block'
        @_viewable = true

    ###
    # Hide indicator
    # @return {Boolean} indicator visibility
    ###
    hide: ->
        @_elem.style.display = 'none'
        @_viewable = false

module.exports = CloseIndicator
