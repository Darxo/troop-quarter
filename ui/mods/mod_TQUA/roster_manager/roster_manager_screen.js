
"use strict";


var RosterManagerScreen = function()
{
    this.mSQHandle = null;
    this.mDataSource = new RosterManagerDatasource();
    this.mDataSource.mRosterManager.mDataSource = this.mDataSource;

    // generic containers
    this.mContainer = null;
    this.mRosterManagerScreen = null;
    this.mLeftContentContainer = null;
    this.mRightContentContainer = null;

    // modules
    this.mCharacterPanelModule = null;
    this.mBrothersModule = null;

    this.createModules();
};

RosterManagerScreen.prototype.isConnected = function ()
{
    return this.mSQHandle !== null;
};

RosterManagerScreen.prototype.onConnection = function (_handle)
{
    this.mSQHandle = _handle;
    this.mDataSource.onConnection(this.mSQHandle);

    this.register($('.root-screen'));
};

RosterManagerScreen.prototype.onDisconnection = function ()
{
    this.mSQHandle = null;
    this.mDataSource.onDisconnection();

    // remove from DOM as there is no link to a SQ object
    this.unregister();
};

RosterManagerScreen.prototype.onModuleOnConnectionCalled = function (_module)
{
};

RosterManagerScreen.prototype.onModuleOnDisconnectionCalled = function (_module)
{
};

RosterManagerScreen.prototype.createDIV = function (_parentDiv)
{
    // create: containers (init hidden!)
    this.mContainer = $('<div class="character-screen ui-control dialog-modal-background display-none opacity-none"/>');
    _parentDiv.append(this.mContainer);

    var rosterManagerScreenStatuetes = $('<div class="character-screen-statuetes"/>');
    this.mContainer.append(rosterManagerScreenStatuetes);

    var parentWidth = this.mContainer.width();
    var parentHeight = this.mContainer.height();
    var width = rosterManagerScreenStatuetes.width();
    var height = rosterManagerScreenStatuetes.height();

    if (width > parentWidth)
    {
        width = width + 32;
        var marginLeft = (parentWidth - width) / 2;

        rosterManagerScreenStatuetes.css({ 'left': marginLeft, 'margin-left': 0, 'margin-right': 0 });
    }

    if (height > parentHeight)
    {
        height = height + 122;
        var marginTop = (parentHeight - height) / 2;

        rosterManagerScreenStatuetes.css({ 'top': marginTop, 'margin-top': 0, 'margin_bottom': 0 });
    }

    this.mRosterManagerScreen = $('<div class="character-screen-container"/>');
    rosterManagerScreenStatuetes.append(this.mRosterManagerScreen);

    this.mLeftContentContainer = $('<div class="l-left-content-container"/>');
    this.mRosterManagerScreen.append(this.mLeftContentContainer);
    this.mRightContentContainer = $('<div class="l-right-content-container"/>');
    this.mRosterManagerScreen.append(this.mRightContentContainer);

    // MSU Hotkeys:
    var self = this;
    $(document).on('keyup.' + modTQUA.ID + 'CS', null, this, function (_event)
    {
        if (self.isVisible() === false) return false;

        if (MSU.Keybinds.isKeybindPressed(modTQUA.ID, "SwitchToNextSelected", _event))
        {
            self.mDataSource.mRosterManager.switchToNextBrother();
            return true;
        }
        else if (MSU.Keybinds.isKeybindPressed(modTQUA.ID, "SwitchToPrevSelected", _event))
        {
            self.mDataSource.mRosterManager.switchToPreviousBrother();
            return true;
        }
        else if (MSU.Keybinds.isKeybindPressed(modTQUA.ID, "SwitchToAboveSelected", _event))
        {
            self.mDataSource.mRosterManager.switchToPreviousBrother(9);
            return true;
        }
        else if (MSU.Keybinds.isKeybindPressed(modTQUA.ID, "SwitchToBelowSelected", _event))
        {
            self.mDataSource.mRosterManager.switchToNextBrother(9);
            return true;
        }

        return false
    });
};

RosterManagerScreen.prototype.destroyDIV = function ()
{
    this.mRightContentContainer.empty();
    this.mRightContentContainer = null;
    this.mLeftContentContainer.empty();
    this.mLeftContentContainer = null;

    this.mRosterManagerScreen.empty();
    this.mRosterManagerScreen = null;

    this.mContainer.empty();
    this.mContainer.remove();
    this.mContainer = null;
};

RosterManagerScreen.prototype.createModules = function()
{
    this.mCharacterPanelModule = new CharacterScreenLeftPanelModule(this, this.mDataSource);
    this.mBrothersModule = new RosterManagerRosterModule(this, this.mDataSource);
};

RosterManagerScreen.prototype.registerModules = function ()
{
    this.mCharacterPanelModule.register(this.mLeftContentContainer);    // These are all vanilla modules with a few hooks to turn off certain features
    this.mBrothersModule.register(this.mRightContentContainer);
};

RosterManagerScreen.prototype.unregisterModules = function ()
{
    this.mCharacterPanelModule.unregister();
    this.mBrothersModule.unregister();
};

RosterManagerScreen.prototype.create = function(_parentDiv)
{
    this.createDIV(_parentDiv);
    this.registerModules();
};

RosterManagerScreen.prototype.destroy = function()
{
    this.unregisterModules();
    this.destroyDIV();
};

RosterManagerScreen.prototype.register = function (_parentDiv)
{
    console.log('RosterManagerScreen::REGISTER');

    if (this.mContainer !== null)
    {
        console.error('ERROR: Failed to register Character Screen. Reason: Screen is already initialized.');
        return;
    }

    if (_parentDiv !== null && typeof(_parentDiv) == 'object')
    {
        this.create(_parentDiv);

        this.notifyBackendOnConnected();
    }
};

RosterManagerScreen.prototype.unregister = function ()
{
    console.log('RosterManagerScreen::UNREGISTER');

    if (this.mContainer === null)
    {
        console.error('ERROR: Failed to unregister Character Screen. Reason: Screen is not initialized.');
        return;
    }

    this.notifyBackendOnDisconnected();

    this.destroy();
};

RosterManagerScreen.prototype.isVisible = function ()
{
	return this.mContainer.hasClass('display-block');
};

RosterManagerScreen.prototype.show = function (_data)
{
    var self = this;

    if (_data !== undefined && _data !== null && typeof(_data) === 'object')
    {
        this.mDataSource.loadFromData(_data);
        this.mBrothersModule.createDelayedRosterDIVs();
        this.mDataSource.mRosterManager.generateDIVs();
        this.mDataSource.mRosterManager.selectAnything();
    }
    else    // Show the same window as before without reloading anything
    {
        // this.mDataSource.loadBrothersList();
    }

    this.mContainer.velocity("finish", true).velocity({ opacity: 1 },
    {
        duration: Constants.SCREEN_FADE_IN_OUT_DELAY,
        easing: 'swing',
        begin: function()
        {
            $(this).removeClass('display-none').addClass('display-block');
            self.notifyBackendOnAnimating();
        },
        complete: function()
        {
            self.notifyBackendOnShown();
        }
    });
};

RosterManagerScreen.prototype.hide = function ()
{
    var self = this;

    this.mContainer.velocity("finish", true).velocity({ opacity: 0 },
    {
        duration: Constants.SCREEN_FADE_IN_OUT_DELAY,
        easing: 'swing',
        begin: function()
        {
            self.notifyBackendOnAnimating();
        },
        complete: function()
        {
            $(this).removeClass('display-block').addClass('display-none');
            self.notifyBackendOnHidden();
        }
    });
};

RosterManagerScreen.prototype.getModule = function (_name)
{
    switch(_name)
    {
        case 'DataSource': return this.mDataSource;
        default: return null;
    }
};

RosterManagerScreen.prototype.getModules = function ()
{
    return [
        { name: 'DataSource', module: this.mDataSource }
    ];
};


RosterManagerScreen.prototype.notifyBackendOnConnected = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenConnected');
    }
};

RosterManagerScreen.prototype.notifyBackendOnDisconnected = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenDisconnected');
    }
};

RosterManagerScreen.prototype.notifyBackendOnShown = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenShown');
    }
};

RosterManagerScreen.prototype.notifyBackendOnHidden = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenHidden');
    }
};

RosterManagerScreen.prototype.notifyBackendOnAnimating = function ()
{
    if (this.mSQHandle !== null)
    {
        SQ.call(this.mSQHandle, 'onScreenAnimating');
    }
};

registerScreen("RosterManagerScreen", new RosterManagerScreen());
