##
# The orientation properties object is intended to provide ad designers with additional control over expandable and
# interstitial ads
# @namespace typedef
class MRAIDOrientationProperties
    ##
    # Allow device-based orientation changes
    #
    # If set to “true” then the container will permit device-based orientation changes; if set to false, then the
    # container will ignore device-based orientation changes (e.g., the web view will not change even if the
    # orientation of the device changes). Default is “true.” The ad creative is always able to request a change of
    # its orientation by setting the forceOrientation variable, regardless of how allowOrientationChange is set.
    # @property allowOrientationChange
    # @type Boolean

    ##
    # View must open in the specified orientation
    #
    # Can be set to a value of “portrait,” landscape,” or “none.”
    # If forceOrientation is set then a view must open in the specified orientation, regardless of the orientation
    # of the device. That is, if a user is viewing an ad in landscape mode, and taps to expand it, if the ad
    # designer has set the forceOrientation orientation property to “portrait” then the ad will open in portrait
    # orientation. Default is “none.”
    # @property forceOrientation
    # @type String
