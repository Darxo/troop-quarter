
// Don't tease the player with level-ups when they can't assign the stats in this window
var modTQUA_CharacterScreenLeftPanelHeaderModule_setLevel = CharacterScreenLeftPanelHeaderModule.prototype.setLevel;
CharacterScreenLeftPanelHeaderModule.prototype.setLevel = function(_levelValue, _hasLevelUp)
{
    if (this.mDataSource.mIsRosterManager !== undefined) _hasLevelUp = false;
    modTQUA_CharacterScreenLeftPanelHeaderModule_setLevel.call(this, _levelValue, _hasLevelUp);
};

var modTQUA_CharacterScreenLeftPanelHeaderModule_setXP = CharacterScreenLeftPanelHeaderModule.prototype.setXP;
CharacterScreenLeftPanelHeaderModule.prototype.setXP = function(_xpValue, _xpValueMax, _level, _hasLevelUp)
{
    if (this.mDataSource.mIsRosterManager !== undefined) _hasLevelUp = false;
    modTQUA_CharacterScreenLeftPanelHeaderModule_setXP.call(this, _xpValue, _xpValueMax, _level, _hasLevelUp);
};

// Permanently hides the Dismiss Button
var modTQUA_CharacterScreenLeftPanelHeaderModule_updateControls = CharacterScreenLeftPanelHeaderModule.prototype.updateControls;
CharacterScreenLeftPanelHeaderModule.prototype.updateControls = function(_data)
{
    modTQUA_CharacterScreenLeftPanelHeaderModule_updateControls.call(this, _data);
    if (this.mDataSource.mIsRosterManager === undefined) return;

    // We want the DismissButton to never be shown in the RosterManager.
    this.mDismissButton.addClass('display-none').removeClass('display-block');
};


var modTQUA_CharacterScreenLeftPanelHeaderModule_createDIV = CharacterScreenLeftPanelHeaderModule.prototype.createDIV;
CharacterScreenLeftPanelHeaderModule.prototype.createDIV = function (_parentDiv)
{
    modTQUA_CharacterScreenLeftPanelHeaderModule_createDIV.call(this, _parentDiv);
    if (this.mDataSource.mIsRosterManager === undefined) return;

    // Hide the Dismiss Button
    this.mDismissButton.addClass('display-none').removeClass('display-block');

    // Remove click-handler because we don't support that functionality in this screen
    this.mNameContainer.off()       // Just remove all handler
    this.mLevelContainer.off()      // Just remove all handler
    this.mXPProgressbar.off()       // Just remove all handler
}

var modTQUA_CharacterScreenLeftPanelHeaderModule_bindTooltips = CharacterScreenLeftPanelHeaderModule.prototype.bindTooltips;
CharacterScreenLeftPanelHeaderModule.prototype.bindTooltips = function ()
{
    modTQUA_CharacterScreenLeftPanelHeaderModule_bindTooltips.call(this);
    if (this.mDataSource.mIsRosterManager === undefined) return;

    // All this tooltip does is advertising the Change-Name-Title feature. But that is not supported in the RosterManager
    this.mNameContainer.unbindTooltip();
};
